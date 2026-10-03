import {
	elementScroll,
	measureElement as measureVirtualElement,
	observeElementOffset,
	observeElementRect,
	Virtualizer,
	type VirtualizerOptions
} from "@tanstack/react-virtual";

import { captureListScrollAnchor } from "../lib/captureListScrollAnchor";
import { type ListScrollAnchor } from "../lib/listScrollAnchorTypes";
import { resolveListScrollAnchor } from "../lib/resolveListScrollAnchor";

import { type ListVirtualizerDriver, type ListVirtualizerOptions, type ListVirtualizerSnapshot } from "./listVirtualizerTypes";

/** Числовой ключ не пересекается со строковыми ключами пользовательских данных. */
const loadingRowKey = -1;

/**
 * Владеет внешним изменяемым core, измерениями DOM и публикацией снимков.
 * Все обновления набора применяются после React commit, чтобы новая строка
 * никогда не измерялась с прежним индексным ключом. Пагинация этому драйверу
 * не принадлежит: дополнительная строка лишь резервирует место индикатора.
 */
export function createListVirtualizerDriver<T>(initialOptions: ListVirtualizerOptions<T>): ListVirtualizerDriver<T> {
	let committedOptions = initialOptions;
	let committedKeys = initialOptions.items.map(initialOptions.getKey);
	let scrollElement: HTMLDivElement | null = null;
	let mounted = false;
	let committing = false;
	let pendingAnchor: ListScrollAnchor | null = null;
	let receiveScrollOffset: ((offset: number, isScrolling: boolean) => void) | null = null;
	const listeners = new Set<() => void>();
	const measuredElements = new Set<HTMLElement>();
	const pendingMeasurements = new Set<HTMLElement>();
	let shouldPruneElements = false;
	const serverSnapshot: ListVirtualizerSnapshot = Object.freeze({
		virtualItems: Object.freeze([]),
		totalSize: (initialOptions.items.length + Number(initialOptions.hasNextPage ?? false)) * (initialOptions.estimateSize ?? 120)
	});
	let snapshot = serverSnapshot;
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

	function publishSnapshot(): void {
		if (!mounted || committing) return;
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
		if (sameGeometry) return;

		snapshot = Object.freeze({
			virtualItems: Object.freeze(virtualItems.map((item) => Object.freeze({ ...item }))),
			totalSize
		});
		for (const listener of listeners) listener();
	}

	function createCoreOptions(
		options: ListVirtualizerOptions<T>,
		keys: readonly string[]
	): VirtualizerOptions<HTMLDivElement, HTMLElement> {
		return {
			count: keys.length + Number(options.hasNextPage ?? false),
			getItemKey: (index) => keys[index] ?? loadingRowKey,
			getScrollElement,
			estimateSize,
			overscan: options.overscan ?? 5,
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
		const resolved = resolveListScrollAnchor(pendingAnchor, committedKeys);
		instance.getTotalSize();
		const measurement = resolved === null ? undefined : instance.measurementsCache[resolved.index];
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
			const cleanup = instance._didMount();
			return () => {
				mounted = false;
				cleanup();
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
				const datasetChanged =
					candidateKeys !== committedKeys &&
					(candidateKeys.length !== committedKeys.length || candidateKeys.some((key, index) => key !== committedKeys[index]));
				if (!Object.is(options.resetKey, committedOptions.resetKey)) {
					pendingAnchor = { type: "start" };
				} else if (!(options.preserveScrollAnchor ?? true)) {
					pendingAnchor = null;
				} else if (datasetChanged && (options.preserveScrollAnchor ?? true) && pendingAnchor === null) {
					const offset = scrollElement?.scrollTop ?? 0;
					const visibleMeasurement = instance.getVirtualItemForOffset(offset);
					// В коротком viewport может быть виден только loader. Новая страница
					// привязывается к концу последней реальной строки, а не к её sentinel.
					const anchorMeasurement =
						typeof visibleMeasurement?.key === "string"
							? visibleMeasurement
							: instance.measurementsCache[committedKeys.length - 1];
					pendingAnchor = captureListScrollAnchor(committedKeys, anchorMeasurement, offset);
				}

				// Новая функция key extractor нужна только при изменении порядка:
				// TanStack пересчитывает позиции, сохраняя измеренные высоты по ключам.
				const keys = datasetChanged ? candidateKeys : committedKeys;
				const nextOptions = createCoreOptions(options, keys);
				if (!datasetChanged && (options.estimateSize ?? 120) === (committedOptions.estimateSize ?? 120)) {
					nextOptions.getItemKey = instance.options.getItemKey;
				}
				committedKeys = keys;
				committedOptions = options;
				instance.setOptions(nextOptions);
				instance._willUpdate();
				instance.getTotalSize();
				// Обычный scroll commit подключает только новые ref-узлы. Уже живые
				// строки измеряет ResizeObserver core; смена порядка единственный раз
				// обновляет их data-index, сохраняя keyed cache реальных размеров.
				const elementsToMeasure = datasetChanged ? measuredElements : pendingMeasurements;
				for (const element of elementsToMeasure) {
					if (element.isConnected && scrollElement?.contains(element)) instance.measureElement(element);
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
