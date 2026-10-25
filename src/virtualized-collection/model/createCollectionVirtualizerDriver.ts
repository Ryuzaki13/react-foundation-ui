import {
	elementScroll,
	measureElement as measureVirtualElement,
	observeElementOffset,
	observeElementRect,
	Virtualizer,
	type VirtualizerOptions
} from "@tanstack/react-virtual";

import { captureCollectionScrollAnchor } from "../lib/captureCollectionScrollAnchor";
import { type CollectionScrollAnchor } from "../lib/collectionScrollAnchorTypes";
import { indexCollectionRowAnchorKeys } from "../lib/indexCollectionRowAnchorKeys";
import { resolveCollectionScrollAnchor } from "../lib/resolveCollectionScrollAnchor";
import { selectCollectionVisibleKeys } from "../lib/selectCollectionVisibleKeys";

import {
	type CollectionVirtualizerDriver,
	type CollectionVirtualizerOptions,
	type CollectionVirtualizerSnapshot
} from "./collectionVirtualizerTypes";

/** Числовой ключ не пересекается со строковыми ключами пользовательских данных. */
const loadingRowKey = -1;

/**
 * Владеет внешним изменяемым core, измерениями DOM и публикацией снимков.
 * Все обновления набора применяются после React commit, чтобы новая строка
 * никогда не измерялась с прежним индексным ключом. Пагинация этому драйверу
 * не принадлежит: дополнительная строка лишь резервирует место индикатора.
 */
export function createCollectionVirtualizerDriver<T>(initialOptions: CollectionVirtualizerOptions<T>): CollectionVirtualizerDriver<T> {
	let committedOptions = initialOptions;
	let committedKeys = initialOptions.items.map(initialOptions.getKey);
	let committedAnchorKeyIndex = initialOptions.getAnchorKeys
		? indexCollectionRowAnchorKeys(initialOptions.items, initialOptions.getAnchorKeys)
		: null;
	let committedVisibleEntries = initialOptions.getVisibleKeys
		? new Map(initialOptions.items.map((item, index) => [initialOptions.getKey(item, index), { item, index }]))
		: null;
	let scrollElement: HTMLDivElement | null = null;
	let mounted = false;
	let mountRevision = 0;
	let committing = false;
	let pendingAnchor: CollectionScrollAnchor | null = null;
	let receiveScrollOffset: ((offset: number, isScrolling: boolean) => void) | null = null;
	const listeners = new Set<() => void>();
	const measuredElements = new Set<HTMLElement>();
	const pendingMeasurements = new Set<HTMLElement>();
	let shouldPruneElements = false;
	const serverRowCount = initialOptions.items.length + Number(initialOptions.hasNextPage ?? false);
	const serverSnapshot: CollectionVirtualizerSnapshot = Object.freeze({
		virtualItems: Object.freeze([]),
		totalSize: serverRowCount * (initialOptions.estimateSize ?? 120) + Math.max(0, serverRowCount - 1) * (initialOptions.gap ?? 0)
	});
	let snapshot = serverSnapshot;
	let visibleKeys: readonly string[] | null = null;
	let visibleCallback: CollectionVirtualizerOptions<T>["onVisibleKeysChange"];
	const getScrollElement = () => scrollElement;
	const estimateSize = () => committedOptions.estimateSize ?? 120;
	const observeScrollOffset: VirtualizerOptions<HTMLDivElement, HTMLElement>["observeElementOffset"] = (core, callback) => {
		receiveScrollOffset = callback;
		const cleanup = observeElementOffset(core, callback);
		return () => {
			if (receiveScrollOffset === callback) receiveScrollOffset = null;
			cleanup?.();
		};
	};

	/** Baseline устанавливается до callback: reentrant commit не повторяет тот же набор и не получает старую геометрию. */
	function publishVisibleKeys(virtualItems: CollectionVirtualizerSnapshot["virtualItems"]): void {
		const callback = committedOptions.onVisibleKeysChange;
		if (callback === undefined) {
			const previous = visibleCallback;
			const hadVisibleKeys = (visibleKeys?.length ?? 0) > 0;
			visibleCallback = undefined;
			visibleKeys = null;
			if (previous && hadVisibleKeys) previous(Object.freeze([]));
			return;
		}
		if (visibleCallback && visibleCallback !== callback) {
			const revision = mountRevision;
			const previous = visibleCallback;
			const hadVisibleKeys = (visibleKeys?.length ?? 0) > 0;
			visibleCallback = undefined;
			visibleKeys = null;
			if (hadVisibleKeys) previous(Object.freeze([]));
			if (!mounted || revision !== mountRevision || committedOptions.onVisibleKeysChange !== callback) return;
			// Освобождение прежнего consumer допускает reentrant commit; используем уже текущий core.
			virtualItems = instance.getVirtualItems();
		}
		const rowKeys = selectCollectionVisibleKeys(virtualItems, instance.scrollOffset ?? 0, instance.scrollRect?.height ?? 0);
		const getVisibleKeys = committedOptions.getVisibleKeys;
		const next = getVisibleKeys
			? Object.freeze(
					rowKeys.flatMap((key) => {
						const entry = committedVisibleEntries?.get(key);
						return entry === undefined ? [] : getVisibleKeys(entry.item, entry.index);
					})
				)
			: rowKeys;
		if (callback === visibleCallback && visibleKeys?.length === next.length && visibleKeys.every((key, index) => key === next[index]))
			return;
		visibleCallback = callback;
		visibleKeys = next;
		callback(next);
	}

	function publishSnapshot(): void {
		if (!mounted || committing) return;
		const revision = mountRevision;
		const virtualItems = instance.getVirtualItems();
		const totalSize = instance.getTotalSize();
		const sameGeometry =
			snapshot.totalSize === totalSize &&
			snapshot.virtualItems.length === virtualItems.length &&
			snapshot.virtualItems.every((previous, index) => {
				const current = virtualItems[index];
				return (
					current !== undefined &&
					previous.key === current.key &&
					previous.index === current.index &&
					previous.start === current.start &&
					previous.end === current.end &&
					previous.size === current.size &&
					previous.lane === current.lane
				);
			});
		if (!sameGeometry) {
			snapshot = Object.freeze({
				virtualItems: Object.freeze(virtualItems.map((item) => Object.freeze({ ...item }))),
				totalSize
			});
		}
		// Scroll/resize может сменить пересечение строк, не меняя overscan-геометрию.
		// Поэтому range уведомляется даже при прежнем cached React snapshot.
		publishVisibleKeys(virtualItems);
		if (!mounted || revision !== mountRevision || sameGeometry) return;
		for (const listener of listeners) listener();
	}

	function createCoreOptions(
		options: CollectionVirtualizerOptions<T>,
		keys: readonly string[]
	): VirtualizerOptions<HTMLDivElement, HTMLElement> {
		return {
			count: keys.length + Number(options.hasNextPage ?? false),
			getItemKey: (index) => keys[index] ?? loadingRowKey,
			getScrollElement,
			estimateSize,
			overscan: options.overscan ?? 5,
			gap: options.gap ?? 0,
			measureElement: measureVirtualElement,
			observeElementRect,
			observeElementOffset: observeScrollOffset,
			scrollToFn: elementScroll,
			onChange: publishSnapshot
		};
	}

	const instance = new Virtualizer<HTMLDivElement, HTMLElement>(createCoreOptions(initialOptions, committedKeys));

	/**
	 * DOM ещё может иметь высоту предыдущего снимка. В этом случае якорь дожидается
	 * следующего commit геометрии; новый scroll offset передаётся тому же наблюдателю,
	 * а не отдельному React-состоянию или параллельному scroll listener.
	 */
	function restorePendingAnchor(): void {
		if (scrollElement === null || pendingAnchor === null) return;
		const resolved = resolveCollectionScrollAnchor(pendingAnchor, committedAnchorKeyIndex?.keys ?? committedKeys);
		const rowIndex = resolved === null ? undefined : (committedAnchorKeyIndex?.rowIndexes[resolved.index] ?? resolved.index);
		instance.getTotalSize();
		const measurement = rowIndex === undefined ? undefined : instance.measurementsCache[rowIndex];
		const targetOffset =
			measurement === undefined || resolved === null ? 0 : measurement.start + Math.min(resolved.offset, measurement.size);
		const desiredOffset = Math.max(0, Math.min(targetOffset, instance.getTotalSize() - scrollElement.clientHeight));
		scrollElement.scrollTop = desiredOffset;
		receiveScrollOffset?.(scrollElement.scrollTop, false);
		if (Math.abs(scrollElement.scrollTop - desiredOffset) < 1) pendingAnchor = null;
	}

	return {
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		getSnapshot: () => snapshot,
		getServerSnapshot: () => serverSnapshot,
		attachScrollElement: (element) => {
			scrollElement = element;
		},
		measureElement: (element) => {
			if (element === null) shouldPruneElements = true;
			else {
				measuredElements.add(element);
				pendingMeasurements.add(element);
			}
		},
		mount: () => {
			mounted = true;
			const revision = ++mountRevision;
			const cleanup = instance._didMount();
			return () => {
				if (!mounted || revision !== mountRevision) return;
				mounted = false;
				mountRevision += 1;
				const callback = visibleCallback;
				const hadVisibleKeys = (visibleKeys?.length ?? 0) > 0;
				visibleCallback = undefined;
				visibleKeys = null;
				cleanup();
				// Consumer освобождает interests после закрытия observers; повторный cleanup ничего не публикует.
				if (callback && hadVisibleKeys) callback(Object.freeze([]));
			};
		},
		commit: (options) => {
			if (!mounted) return;
			committing = true;
			try {
				const candidateKeys =
					options.items === committedOptions.items && options.getKey === committedOptions.getKey
						? committedKeys
						: options.items.map(options.getKey);
				const rowKeysChanged =
					candidateKeys !== committedKeys &&
					(candidateKeys.length !== committedKeys.length || candidateKeys.some((key, index) => key !== committedKeys[index]));
				const candidateAnchorKeyIndex =
					options.items === committedOptions.items && options.getAnchorKeys === committedOptions.getAnchorKeys
						? committedAnchorKeyIndex
						: options.getAnchorKeys
							? indexCollectionRowAnchorKeys(options.items, options.getAnchorKeys)
							: null;
				const previousAnchorKeyIndex = committedAnchorKeyIndex;
				// Прежний geometric key не означает прежний состав ряда: смена
				// колонок или удаление клетки могут оставить первый ключ на месте.
				const anchorKeysChanged =
					candidateAnchorKeyIndex !== previousAnchorKeyIndex &&
					(candidateAnchorKeyIndex === null ||
						previousAnchorKeyIndex === null ||
						candidateAnchorKeyIndex.keys.length !== previousAnchorKeyIndex.keys.length ||
						candidateAnchorKeyIndex.keys.some(
							(key, index) =>
								key !== previousAnchorKeyIndex.keys[index] ||
								candidateAnchorKeyIndex.rowIndexes[index] !== previousAnchorKeyIndex.rowIndexes[index]
						));
				const datasetChanged = rowKeysChanged || anchorKeysChanged;
				const measurementChanged = !Object.is(options.measurementKey, committedOptions.measurementKey);
				const geometryChanged = datasetChanged || measurementChanged || (options.gap ?? 0) !== (committedOptions.gap ?? 0);
				if (!Object.is(options.resetKey, committedOptions.resetKey)) {
					pendingAnchor = { type: "start" };
				} else if (!(options.preserveScrollAnchor ?? true)) {
					pendingAnchor = null;
				} else if (geometryChanged && (options.preserveScrollAnchor ?? true) && pendingAnchor === null) {
					const offset = scrollElement?.scrollTop ?? 0;
					const visibleMeasurement = instance.getVirtualItemForOffset(offset);
					// В коротком viewport может быть виден только loader. Новая страница
					// привязывается к концу последней реальной строки, а не к её sentinel.
					const anchorMeasurement =
						typeof visibleMeasurement?.key === "string"
							? visibleMeasurement
							: instance.measurementsCache[committedKeys.length - 1];
					if (committedAnchorKeyIndex === null) {
						pendingAnchor = captureCollectionScrollAnchor(committedKeys, anchorMeasurement, offset);
					} else {
						const logicalIndex =
							anchorMeasurement === undefined ? undefined : committedAnchorKeyIndex.firstKeyIndexes[anchorMeasurement.index];
						const logicalKey = logicalIndex === undefined ? undefined : committedAnchorKeyIndex.keys[logicalIndex];
						pendingAnchor = captureCollectionScrollAnchor(
							committedAnchorKeyIndex.keys,
							anchorMeasurement === undefined || logicalIndex === undefined || logicalKey === undefined
								? undefined
								: { key: logicalKey, index: logicalIndex, start: anchorMeasurement.start },
							offset
						);
					}
				}

				// Новая функция key extractor нужна только при изменении порядка:
				// TanStack пересчитывает позиции, сохраняя измеренные высоты по ключам.
				const keys = rowKeysChanged ? candidateKeys : committedKeys;
				const nextOptions = createCoreOptions(options, keys);
				if (!rowKeysChanged && (options.estimateSize ?? 120) === (committedOptions.estimateSize ?? 120)) {
					nextOptions.getItemKey = instance.options.getItemKey;
				}
				if (options.getVisibleKeys === undefined) {
					committedVisibleEntries = null;
				} else if (rowKeysChanged || options.items !== committedOptions.items || committedVisibleEntries === null) {
					// Проекция читает текущие данные, даже если прежние ключи рядов
					// сохранились. Callback consumer при этом не заменяется wrapper.
					committedVisibleEntries = new Map(options.items.map((item, index) => [options.getKey(item, index), { item, index }]));
				}
				committedKeys = keys;
				committedAnchorKeyIndex = candidateAnchorKeyIndex;
				committedOptions = options;
				instance.setOptions(nextOptions);
				instance._willUpdate();
				// Ширина карточек может измениться без смены числа колонок. Старые
				// размеры невидимых рядов в этом случае не описывают новую раскладку.
				if (measurementChanged) instance.measure();
				instance.getTotalSize();
				// Обычный scroll commit подключает только новые ref-узлы. Уже живые
				// строки измеряет ResizeObserver core; смена порядка или состава рядов
				// обновляет их измерения, сохраняя keyed cache реальных размеров.
				const elementsToMeasure = datasetChanged || measurementChanged ? measuredElements : pendingMeasurements;
				for (const element of elementsToMeasure) {
					if (!element.isConnected || !scrollElement?.contains(element)) continue;
					const forceMeasurement = measurementChanged && instance.isScrolling;
					instance.measureElement(element);
					// При пользовательском scroll core обычно ждёт ResizeObserver.
					// Новая геометрия нужна якорю уже в текущем layout commit.
					if (forceMeasurement)
						instance.resizeItem(instance.indexFromElement(element), measureVirtualElement(element, undefined, instance));
				}
				pendingMeasurements.clear();
				if (shouldPruneElements || datasetChanged) {
					for (const element of measuredElements) {
						if (!element.isConnected || !scrollElement?.contains(element)) measuredElements.delete(element);
					}
					instance.measureElement(null);
					shouldPruneElements = false;
				}
				restorePendingAnchor();
			} finally {
				committing = false;
			}
			publishSnapshot();
		}
	};
}
