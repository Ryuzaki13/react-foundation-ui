import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { installCollectionTestEnvironment } from "../test-fixtures/installCollectionTestEnvironment.fixture.test";

import { type CollectionVirtualizerOptions } from "./collectionVirtualizerTypes";
import { createCollectionVirtualizerDriver } from "./createCollectionVirtualizerDriver";

let environment: ReturnType<typeof installCollectionTestEnvironment>;
const cleanupCallbacks = new Set<() => void>();

beforeEach(() => {
	environment = installCollectionTestEnvironment();
});
afterEach(() => {
	for (const cleanup of cleanupCallbacks) cleanup();
	cleanupCallbacks.clear();
	document.body.replaceChildren();
	environment.restore();
});

/** Изолированный DOM-host проверяет настоящий core без подмены его ключей/измерений. */
function createDriverHost(items: readonly string[], options: Partial<CollectionVirtualizerOptions<string>> = {}) {
	const viewport = document.createElement("div");
	viewport.setAttribute("role", "region");
	document.body.append(viewport);
	const getKey = (item: string) => item;
	const driver = createCollectionVirtualizerDriver({ items, getKey, ...options });
	driver.attachScrollElement(viewport);
	const cleanup = driver.mount();
	cleanupCallbacks.add(cleanup);
	const rowsByKey = new Map<string, HTMLElement>();

	function commit(nextItems: readonly string[], nextOptions: Partial<CollectionVirtualizerOptions<string>> = {}) {
		const currentKeys = new Set(nextItems);
		for (const [key, row] of rowsByKey) {
			if (!currentKeys.has(key)) {
				row.remove();
				rowsByKey.delete(key);
				driver.measureElement(null);
			}
		}
		for (const [index, key] of nextItems.entries()) {
			let row = rowsByKey.get(key);
			if (row === undefined) {
				row = document.createElement("li");
				const content = document.createElement("span");
				content.dataset.listTestItem = key;
				row.append(content);
				rowsByKey.set(key, row);
				driver.measureElement(row);
			}
			row.setAttribute("data-index", String(index));
			viewport.append(row);
		}
		driver.commit({ items: nextItems, getKey, ...options, ...nextOptions });
		// Браузер подтверждает размеры через настоящий ResizeObserver core;
		// начальный scroll event может отложить его синхронное измерение.
		environment.flushResizeObservers();
	}
	commit(items);
	return { driver, viewport, commit, cleanup, getKey };
}

type LogicalDriverTestRow = {
	readonly key: string;
	readonly anchorKeys: readonly string[];
	readonly visibleKeys?: readonly string[];
};

/** Проекция изменяется вместе с данными; внешний visible callback сохраняет identity. */
function createLogicalDriverHost(rows: readonly LogicalDriverTestRow[], options: Partial<CollectionVirtualizerOptions<string>> = {}) {
	let entries = new Map(rows.map((row) => [row.key, row]));
	const getAnchorKeys = (key: string) => entries.get(key)?.anchorKeys ?? [];
	const getVisibleKeys = (key: string) => {
		const row = entries.get(key);
		return row?.visibleKeys ?? row?.anchorKeys ?? [];
	};
	const host = createDriverHost(
		rows.map((row) => row.key),
		{ getAnchorKeys, getVisibleKeys, ...options }
	);
	return {
		...host,
		commit(nextRows: readonly LogicalDriverTestRow[], nextOptions: Partial<CollectionVirtualizerOptions<string>> = {}) {
			entries = new Map(nextRows.map((row) => [row.key, row]));
			host.commit(
				nextRows.map((row) => row.key),
				nextOptions
			);
		}
	};
}

function createColumnRows(keys: readonly string[], columns = 2): readonly LogicalDriverTestRow[] {
	return keys.flatMap((key, index) => (index % columns === 0 ? [{ key, anchorKeys: keys.slice(index, index + columns) }] : []));
}

describe("createCollectionVirtualizerDriver", () => {
	const items = Array.from({ length: 30 }, (_, index) => `item-${index}`);

	it("имеет детерминированный cached SSR snapshot без доступа к DOM", () => {
		const driver = createCollectionVirtualizerDriver({ items, getKey: (item) => item });
		expect(driver.getSnapshot()).toBe(driver.getServerSnapshot());
		expect(driver.getServerSnapshot()).toBe(driver.getServerSnapshot());
		expect(driver.getServerSnapshot()).toEqual({ virtualItems: [], totalSize: 3600 });
		expect(Object.isFrozen(driver.getServerSnapshot())).toBe(true);
		expect(Object.isFrozen(driver.getServerSnapshot().virtualItems)).toBe(true);
	});

	it("учитывает gap только между рядами, включая sentinel, при SSR и в браузере", () => {
		const { driver } = createDriverHost(["first", "second", "third"], { gap: 12, hasNextPage: true });
		expect(driver.getServerSnapshot().totalSize).toBe(516);
		expect(driver.getSnapshot().totalSize).toBe(516);
		expect(driver.getSnapshot().virtualItems.map((row) => row.start)).toEqual([0, 132, 264, 396]);
		const empty = createCollectionVirtualizerDriver({ items: [], getKey: String, gap: 12 });
		expect(empty.getServerSnapshot().totalSize).toBe(0);
		const sentinelOnly = createCollectionVirtualizerDriver({ items: [], getKey: String, gap: 12, hasNextPage: true });
		expect(sentinelOnly.getServerSnapshot().totalSize).toBe(120);
	});

	it("изменение gap сохраняет якорь и его внутреннее смещение", () => {
		const { driver, viewport, commit } = createDriverHost(items, { gap: 12 });
		viewport.scrollTop = 1357;
		viewport.dispatchEvent(new Event("scroll"));
		commit(items, { gap: 24 });
		expect(viewport.scrollTop).toBe(1477);
		expect(driver.getSnapshot().virtualItems.find((row) => row.key === "item-10")?.start).toBe(1440);
	});

	it("measurementKey сбрасывает невидимые размеры и заново измеряет живые ряды", () => {
		environment.setRowHeight("item-20", 360);
		const { driver, viewport, getKey } = createDriverHost(items, { measurementKey: "wide" });
		expect(driver.getSnapshot().totalSize).toBe(3840);
		viewport.querySelector('[data-index="20"]')?.remove();
		driver.measureElement(null);
		driver.commit({ items, getKey, measurementKey: "wide" });
		environment.setRowHeight("item-0", 180);
		driver.commit({ items, getKey, measurementKey: "narrow" });
		expect(driver.getSnapshot().totalSize).toBe(3660);
		expect(driver.getSnapshot().virtualItems.find((row) => row.key === "item-0")?.size).toBe(180);
	});

	it("measurementKey сохраняет глубокий якорь при сбросе невидимых размеров до viewport", () => {
		environment.setRowHeight("item-3", 240);
		const { driver, viewport, getKey } = createDriverHost(items, { measurementKey: "wide" });
		viewport.scrollTop = 1237;
		viewport.dispatchEvent(new Event("scroll"));
		viewport.querySelector('[data-index="3"]')?.remove();
		driver.measureElement(null);
		driver.commit({ items, getKey, measurementKey: "wide" });
		driver.commit({ items, getKey, measurementKey: "narrow" });
		expect(viewport.scrollTop).toBe(1117);
		expect(driver.getSnapshot().virtualItems.find((row) => row.key === "item-9")?.start).toBe(1080);
	});

	it("публикует только изменённую immutable геометрию, а не каждый commit", () => {
		const { driver, commit } = createDriverHost(items);
		const listener = vi.fn();
		const unsubscribe = driver.subscribe(listener);
		const before = driver.getSnapshot();
		commit(items);
		expect(driver.getSnapshot()).toBe(before);
		expect(listener).not.toHaveBeenCalled();
		expect(before.virtualItems.length).toBeGreaterThan(0);
		expect(before.virtualItems.length).toBeLessThan(20);
		expect(Object.isFrozen(before)).toBe(true);
		expect(Object.isFrozen(before.virtualItems[0])).toBe(true);
		unsubscribe();
	});

	it("повторный commit и scroll не вызывают синхронное чтение размера живых строк", () => {
		const { driver, viewport, getKey } = createDriverHost(items);
		const readGeometry = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect");
		readGeometry.mockClear();
		driver.commit({ items, getKey });
		viewport.scrollTop = 120;
		viewport.dispatchEvent(new Event("scroll"));
		driver.commit({ items, getKey });
		expect(readGeometry).not.toHaveBeenCalled();
	});

	it("сохраняет key и внутристочное смещение при prepend", () => {
		const { viewport, commit, driver } = createDriverHost(items);
		viewport.scrollTop = 1237;
		viewport.dispatchEvent(new Event("scroll"));
		commit(["new", ...items]);
		expect(viewport.scrollTop).toBe(1357);
		expect(driver.getSnapshot().virtualItems.some((row) => row.key === "item-10" && row.start === 1320)).toBe(true);
	});

	it("сохраняет логическую запись при prepend одного элемента и полной пересборке двух колонок", () => {
		const source = Array.from({ length: 60 }, (_, index) => `item-${index}`);
		const { viewport, commit, driver } = createLogicalDriverHost(createColumnRows(source));
		viewport.scrollTop = 1237;
		viewport.dispatchEvent(new Event("scroll"));
		commit(createColumnRows(["new", ...source]));
		expect(viewport.scrollTop).toBe(1237);
		expect(driver.getSnapshot().virtualItems.some((row) => row.key === "item-19" && row.start === 1200)).toBe(true);
	});

	it("сопоставляет логический anchor новому индексу ряда при смене числа колонок", () => {
		const source = Array.from({ length: 90 }, (_, index) => `item-${index}`);
		const { viewport, commit } = createLogicalDriverHost(createColumnRows(source));
		viewport.scrollTop = 1237;
		viewport.dispatchEvent(new Event("scroll"));
		commit(createColumnRows(source, 3));
		expect(viewport.scrollTop).toBe(757);
	});

	it("обнаруживает перестановку logical identities при прежних геометрических ключах", () => {
		const rows = Array.from({ length: 30 }, (_, index) => ({
			key: `row-${index}`,
			anchorKeys: [`item-${index * 2}`, `item-${index * 2 + 1}`]
		}));
		const { viewport, commit } = createLogicalDriverHost(rows);
		viewport.scrollTop = 1237;
		viewport.dispatchEvent(new Event("scroll"));
		commit(rows.map((row, index) => ({ ...row, anchorKeys: rows[index === 10 ? 12 : index === 12 ? 10 : index]?.anchorKeys ?? [] })));
		expect(viewport.scrollTop).toBe(1477);
	});

	it("обнаруживает новое распределение прежнего логического порядка при прежних ключах рядов", () => {
		const rows = Array.from({ length: 30 }, (_, index) => ({
			key: `row-${index}`,
			anchorKeys: [`item-${index * 2}`, `item-${index * 2 + 1}`]
		}));
		const { viewport, commit } = createLogicalDriverHost(rows);
		viewport.scrollTop = 1237;
		viewport.dispatchEvent(new Event("scroll"));
		commit(
			rows.map((row, index) => ({
				...row,
				anchorKeys:
					index === 9
						? ["item-18"]
						: index === 10
							? ["item-19"]
							: index === 11
								? ["item-20", "item-21", "item-22", "item-23"]
								: row.anchorKeys
			}))
		);
		expect(viewport.scrollTop).toBe(1357);
	});

	it("при удалении logical anchor выбирает ближайшего участника прежнего порядка внутри нового ряда", () => {
		const source = Array.from({ length: 60 }, (_, index) => `item-${index}`);
		const { viewport, commit } = createLogicalDriverHost(createColumnRows(source));
		viewport.scrollTop = 1237;
		viewport.dispatchEvent(new Event("scroll"));
		commit(createColumnRows(source.filter((key) => key !== "item-19" && key !== "item-20")));
		expect(viewport.scrollTop).toBe(1117);
	});

	it("поддерживает same-count внутреннюю перестановку, а не только изменение краёв", () => {
		const { viewport, commit } = createDriverHost(items);
		viewport.scrollTop = 1237;
		viewport.dispatchEvent(new Event("scroll"));
		const reordered = [...items];
		reordered.splice(10, 1);
		reordered.splice(15, 0, "item-10");
		commit(reordered);
		expect(viewport.scrollTop).toBe(1837);
	});

	it("переносит якорь на ближайшего преемника и сохраняет верх на нуле", () => {
		const { viewport, commit } = createDriverHost(items);
		viewport.scrollTop = 1237;
		viewport.dispatchEvent(new Event("scroll"));
		commit(items.filter((item) => item !== "item-10"));
		expect(viewport.scrollTop).toBe(1237);
		viewport.scrollTop = 0;
		viewport.dispatchEvent(new Event("scroll"));
		commit(["new", ...items]);
		expect(viewport.scrollTop).toBe(0);
	});

	it("сохраняет измеренную высоту по stable key при смене индекса", () => {
		environment.setRowHeight("item-3", 240);
		const { commit, driver } = createDriverHost(items);
		expect(driver.getSnapshot().totalSize).toBe(3720);
		commit(["new", ...items]);
		const measured = driver.getSnapshot().virtualItems.find((row) => row.key === "item-3");
		expect(measured).toMatchObject({ index: 4, size: 240 });
		expect(driver.getSnapshot().totalSize).toBe(3840);
	});

	it("resetKey сбрасывает прокрутку без потери измерений и без замены драйвера", () => {
		environment.setRowHeight("item-3", 240);
		const { viewport, commit, driver } = createDriverHost(items, { resetKey: "first" });
		viewport.scrollTop = 1237;
		viewport.dispatchEvent(new Event("scroll"));
		commit(items, { resetKey: "second" });
		expect(viewport.scrollTop).toBe(0);
		expect(driver.getSnapshot().totalSize).toBe(3720);
		expect(driver.getSnapshot().virtualItems.find((row) => row.key === "item-3")?.size).toBe(240);
	});

	it("preserveScrollAnchor=false не переопределяет числовую позицию браузера", () => {
		const { viewport, commit } = createDriverHost(items, { preserveScrollAnchor: false });
		viewport.scrollTop = 1237;
		viewport.dispatchEvent(new Event("scroll"));
		commit(["new", ...items]);
		expect(viewport.scrollTop).toBe(1237);
	});

	it("loader key не конфликтует с пользовательским строковым ключом", () => {
		const { driver } = createDriverHost(["-1"], { hasNextPage: true });
		expect(driver.getSnapshot().virtualItems.map((row) => row.key)).toEqual(["-1", -1]);
	});

	it("после догрузки не отправляет короткий viewport с видимого loader в начало списка", () => {
		const { viewport, commit } = createDriverHost(items, { hasNextPage: true });
		Object.defineProperty(viewport, "clientHeight", { configurable: true, value: 60 });
		viewport.scrollTop = 3620;
		viewport.dispatchEvent(new Event("scroll"));
		commit([...items, "next-page"]);
		expect(viewport.scrollTop).toBe(3600);
	});

	it("изменение estimate пересчитывает неизмеренные строки без нового экземпляра", () => {
		const viewport = document.createElement("div");
		viewport.setAttribute("role", "region");
		document.body.append(viewport);
		const getKey = (item: string) => item;
		const driver = createCollectionVirtualizerDriver({ items, getKey });
		driver.attachScrollElement(viewport);
		cleanupCallbacks.add(driver.mount());
		driver.commit({ items, getKey });
		expect(driver.getSnapshot().totalSize).toBe(3600);
		driver.commit({ items, getKey, estimateSize: 100 });
		expect(driver.getSnapshot().totalSize).toBe(3000);
	});

	it("после commit новой высоты DOM повторяет ранее ограниченную браузером позицию якоря", () => {
		const { driver, viewport, commit } = createDriverHost(items);
		let offset = 3360;
		let browserMaximum = 3360;
		Object.defineProperty(viewport, "scrollTop", {
			configurable: true,
			get: () => offset,
			set: (value: number) => {
				offset = Math.max(0, Math.min(value, browserMaximum));
			}
		});
		viewport.dispatchEvent(new Event("scroll"));
		const prepended = ["new", ...items];
		commit(prepended);
		expect(viewport.scrollTop).toBe(3360);
		expect(driver.getSnapshot().totalSize).toBe(3720);
		// Представление применило новый totalSize; следующий layout commit
		// теперь может восстановить позицию, прежде ограниченную старой высотой.
		browserMaximum = 3480;
		commit(prepended);
		expect(viewport.scrollTop).toBe(3480);
	});

	it("после cleanup освобождает observers и не уведомляет subscribers", () => {
		const { driver, viewport, cleanup } = createDriverHost(items);
		const listener = vi.fn();
		driver.subscribe(listener);
		cleanup();
		cleanupCallbacks.delete(cleanup);
		expect(environment.activeObservedTargets()).toBe(0);
		viewport.scrollTop = 1200;
		viewport.dispatchEvent(new Event("scroll"));
		environment.flushResizeObservers();
		expect(listener).not.toHaveBeenCalled();
	});

	it("SSR/factory не вызывают visible callback и не читают DOM", () => {
		const onVisibleKeysChange = vi.fn<NonNullable<CollectionVirtualizerOptions<string>["onVisibleKeysChange"]>>();
		const readGeometry = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect");
		readGeometry.mockClear();
		const driver = createCollectionVirtualizerDriver({ items, getKey: (item) => item, onVisibleKeysChange });
		driver.getSnapshot();
		driver.getServerSnapshot();
		expect(onVisibleKeysChange).not.toHaveBeenCalled();
		expect(readGeometry).not.toHaveBeenCalled();
	});

	it("visible keys не включают overscan и меняются при прежней cached геометрии без новых DOM reads", () => {
		const onVisibleKeysChange = vi.fn<NonNullable<CollectionVirtualizerOptions<string>["onVisibleKeysChange"]>>();
		const { driver, viewport } = createDriverHost(items, { onVisibleKeysChange });
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(["item-0", "item-1"]);
		expect(driver.getSnapshot().virtualItems.length).toBeGreaterThan(2);
		viewport.scrollTop = 1;
		viewport.dispatchEvent(new Event("scroll"));
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(["item-0", "item-1", "item-2"]);
		const snapshot = driver.getSnapshot();
		const listener = vi.fn();
		driver.subscribe(listener);
		const readGeometry = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect");
		readGeometry.mockClear();
		onVisibleKeysChange.mockClear();
		viewport.scrollTop = 120;
		viewport.dispatchEvent(new Event("scroll"));
		expect(onVisibleKeysChange).toHaveBeenCalledExactlyOnceWith(["item-1", "item-2"]);
		expect(driver.getSnapshot()).toBe(snapshot);
		expect(listener).not.toHaveBeenCalled();
		expect(readGeometry).not.toHaveBeenCalled();
	});

	it("проецирует видимые ряды в исходные keys, исключая group и loader без замены consumer", () => {
		const onVisibleKeysChange = vi.fn<NonNullable<CollectionVirtualizerOptions<string>["onVisibleKeysChange"]>>();
		const rows = [
			{ key: "group:first", anchorKeys: ["group:first"], visibleKeys: [] },
			{ key: "row:first", anchorKeys: ["item-1", "item-2"] },
			{ key: "row:second", anchorKeys: ["item-3", "item-4"] }
		];
		const { viewport, commit, cleanup } = createLogicalDriverHost(rows, { onVisibleKeysChange, hasNextPage: true });
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(["item-1", "item-2"]);
		expect(Object.isFrozen(onVisibleKeysChange.mock.lastCall?.[0])).toBe(true);
		onVisibleKeysChange.mockClear();
		commit(rows.map((row) => ({ ...row })));
		expect(onVisibleKeysChange).not.toHaveBeenCalled();
		commit(rows.map((row) => (row.key === "row:first" ? { ...row, anchorKeys: ["item-1", "item-9"] } : row)));
		expect(onVisibleKeysChange).toHaveBeenCalledExactlyOnceWith(["item-1", "item-9"]);
		viewport.scrollTop = 360;
		viewport.dispatchEvent(new Event("scroll"));
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith([]);
		viewport.scrollTop = 120;
		viewport.dispatchEvent(new Event("scroll"));
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(["item-1", "item-9", "item-3", "item-4"]);
		onVisibleKeysChange.mockClear();
		cleanup();
		expect(onVisibleKeysChange).toHaveBeenCalledExactlyOnceWith([]);
	});

	it("публикует пустую проекцию viewport с одним заголовком и не раскрывает его anchor key", () => {
		environment.setViewportHeight(120);
		const onVisibleKeysChange = vi.fn<NonNullable<CollectionVirtualizerOptions<string>["onVisibleKeysChange"]>>();
		const { viewport } = createLogicalDriverHost(
			[
				{ key: "heading", anchorKeys: ["group:first"], visibleKeys: [] },
				{ key: "row", anchorKeys: ["item-1", "item-2"] }
			],
			{ onVisibleKeysChange }
		);
		expect(onVisibleKeysChange).toHaveBeenCalledExactlyOnceWith([]);
		viewport.scrollTop = 120;
		viewport.dispatchEvent(new Event("scroll"));
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(["item-1", "item-2"]);
	});

	it("дедуплицирует одинаковые keys при scroll/commit и передаёт immutable массив", () => {
		const onVisibleKeysChange = vi.fn<NonNullable<CollectionVirtualizerOptions<string>["onVisibleKeysChange"]>>();
		const { viewport, commit } = createDriverHost(items, { onVisibleKeysChange });
		const keys = onVisibleKeysChange.mock.lastCall?.[0];
		expect(Object.isFrozen(keys)).toBe(true);
		onVisibleKeysChange.mockClear();
		commit(items);
		viewport.dispatchEvent(new Event("scroll"));
		environment.flushResizeObservers();
		expect(onVisibleKeysChange).not.toHaveBeenCalled();
	});

	it("resize/измерение обновляют пересечение, а скрытие viewport публикует пустой диапазон", () => {
		const onVisibleKeysChange = vi.fn<NonNullable<CollectionVirtualizerOptions<string>["onVisibleKeysChange"]>>();
		createDriverHost(items, { onVisibleKeysChange });
		environment.setViewportHeight(360);
		environment.flushResizeObservers();
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(["item-0", "item-1", "item-2"]);
		environment.setRowHeight("item-0", 240);
		environment.flushResizeObservers();
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(["item-0", "item-1"]);
		environment.setViewportHeight(0);
		environment.flushResizeObservers();
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith([]);
		environment.setViewportHeight(240);
		environment.flushResizeObservers();
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(["item-0"]);
	});

	it("замена/удаление callback закрывают старый consumer и новый получает current range", () => {
		const first = vi.fn<NonNullable<CollectionVirtualizerOptions<string>["onVisibleKeysChange"]>>();
		const second = vi.fn<NonNullable<CollectionVirtualizerOptions<string>["onVisibleKeysChange"]>>();
		const { commit, cleanup } = createDriverHost(items, { onVisibleKeysChange: first });
		commit(items, { onVisibleKeysChange: second });
		expect(first.mock.calls.map(([keys]) => keys)).toEqual([["item-0", "item-1"], []]);
		expect(second).toHaveBeenCalledExactlyOnceWith(["item-0", "item-1"]);
		commit(items, { onVisibleKeysChange: second });
		expect(second).toHaveBeenCalledTimes(1);
		commit(items, { onVisibleKeysChange: undefined });
		expect(second.mock.calls.map(([keys]) => keys)).toEqual([["item-0", "item-1"], []]);
		cleanup();
		expect(second).toHaveBeenCalledTimes(2);
	});

	it("cleanup закрывает range ровно один раз и старый cleanup не закрывает remount", () => {
		const onVisibleKeysChange = vi.fn<NonNullable<CollectionVirtualizerOptions<string>["onVisibleKeysChange"]>>();
		const { driver, getKey, cleanup } = createDriverHost(items, { onVisibleKeysChange });
		cleanup();
		cleanup();
		expect(onVisibleKeysChange.mock.calls.map(([keys]) => keys)).toEqual([["item-0", "item-1"], []]);
		const remountCleanup = driver.mount();
		cleanupCallbacks.add(remountCleanup);
		driver.commit({ items, getKey, onVisibleKeysChange });
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(["item-0", "item-1"]);
		onVisibleKeysChange.mockClear();
		cleanup();
		expect(onVisibleKeysChange).not.toHaveBeenCalled();
		expect(environment.activeObservedTargets()).toBeGreaterThan(0);
	});

	it("reentrant commit из callback не повторяет текущую последовательность", () => {
		const { driver, getKey } = createDriverHost(items);
		const onVisibleKeysChange = vi.fn<NonNullable<CollectionVirtualizerOptions<string>["onVisibleKeysChange"]>>((keys) => {
			if (keys.length > 0) driver.commit({ items, getKey, onVisibleKeysChange });
		});
		driver.commit({ items, getKey, onVisibleKeysChange });
		expect(onVisibleKeysChange).toHaveBeenCalledExactlyOnceWith(["item-0", "item-1"]);
	});

	it("reentrant replacement при освобождении старого consumer не публикует уже отменённый callback", () => {
		const { driver, getKey } = createDriverHost(items);
		const replacement = vi.fn<NonNullable<CollectionVirtualizerOptions<string>["onVisibleKeysChange"]>>();
		const superseded = vi.fn<NonNullable<CollectionVirtualizerOptions<string>["onVisibleKeysChange"]>>();
		const first = vi.fn<NonNullable<CollectionVirtualizerOptions<string>["onVisibleKeysChange"]>>((keys) => {
			if (keys.length === 0) driver.commit({ items, getKey, onVisibleKeysChange: replacement });
		});
		driver.commit({ items, getKey, onVisibleKeysChange: first });
		driver.commit({ items, getKey, onVisibleKeysChange: superseded });
		expect(first.mock.calls.map(([keys]) => keys)).toEqual([["item-0", "item-1"], []]);
		expect(superseded).not.toHaveBeenCalled();
		expect(replacement).toHaveBeenCalledExactlyOnceWith(["item-0", "item-1"]);
	});

	it("cleanup из visible callback закрывает интерес до любых последующих событий core", () => {
		const { driver, viewport, getKey, cleanup } = createDriverHost(items);
		const onVisibleKeysChange = vi.fn<NonNullable<CollectionVirtualizerOptions<string>["onVisibleKeysChange"]>>((keys) => {
			if (keys.length > 0) cleanup();
		});
		driver.commit({ items, getKey, onVisibleKeysChange });
		expect(onVisibleKeysChange.mock.calls.map(([keys]) => keys)).toEqual([["item-0", "item-1"], []]);
		viewport.scrollTop = 120;
		viewport.dispatchEvent(new Event("scroll"));
		environment.flushResizeObservers();
		expect(onVisibleKeysChange).toHaveBeenCalledTimes(2);
		expect(environment.activeObservedTargets()).toBe(0);
	});

	it("empty, sentinel-only и reset/prepend не передают чужие или технические ключи", () => {
		const onVisibleKeysChange = vi.fn<NonNullable<CollectionVirtualizerOptions<string>["onVisibleKeysChange"]>>();
		const { viewport, commit } = createDriverHost(["-1"], { hasNextPage: true, onVisibleKeysChange });
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(["-1"]);
		viewport.scrollTop = 120;
		viewport.dispatchEvent(new Event("scroll"));
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith([]);
		commit([], { hasNextPage: false });
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith([]);
		commit(items, { hasNextPage: false, resetKey: "initial" });
		viewport.scrollTop = 1237;
		viewport.dispatchEvent(new Event("scroll"));
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(["item-10", "item-11", "item-12"]);
		onVisibleKeysChange.mockClear();
		commit(["new", ...items], { hasNextPage: false, resetKey: "initial" });
		expect(onVisibleKeysChange).not.toHaveBeenCalled();
		commit(["new", ...items], { hasNextPage: false, resetKey: "reset" });
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(["new", "item-0"]);
	});
});
