import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { installListTestEnvironment } from "../test-fixtures/installListTestEnvironment";

import { createListVirtualizerDriver } from "./createListVirtualizerDriver";
import { type ListVirtualizerOptions } from "./listVirtualizerTypes";

let environment: ReturnType<typeof installListTestEnvironment>;
const cleanupCallbacks = new Set<() => void>();

beforeEach(() => {
	environment = installListTestEnvironment();
});
afterEach(() => {
	for (const cleanup of cleanupCallbacks) cleanup();
	cleanupCallbacks.clear();
	document.body.replaceChildren();
	environment.restore();
});

/** Изолированный DOM-host проверяет настоящий core без подмены его ключей/измерений. */
function createDriverHost(items: readonly string[], options: Partial<ListVirtualizerOptions<string>> = {}) {
	const viewport = document.createElement("div");
	viewport.setAttribute("role", "region");
	document.body.append(viewport);
	const getKey = (item: string) => item;
	const driver = createListVirtualizerDriver({ items, getKey, ...options });
	driver.attachScrollElement(viewport);
	const cleanup = driver.mount();
	cleanupCallbacks.add(cleanup);
	const rowsByKey = new Map<string, HTMLElement>();

	function commit(nextItems: readonly string[], nextOptions: Partial<ListVirtualizerOptions<string>> = {}) {
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

describe("createListVirtualizerDriver", () => {
	const items = Array.from({ length: 30 }, (_, index) => `item-${index}`);

	it("имеет детерминированный cached SSR snapshot без доступа к DOM", () => {
		const driver = createListVirtualizerDriver({ items, getKey: (item) => item });
		expect(driver.getSnapshot()).toBe(driver.getServerSnapshot());
		expect(driver.getServerSnapshot()).toBe(driver.getServerSnapshot());
		expect(driver.getServerSnapshot()).toEqual({ virtualItems: [], totalSize: 3600 });
		expect(Object.isFrozen(driver.getServerSnapshot())).toBe(true);
		expect(Object.isFrozen(driver.getServerSnapshot().virtualItems)).toBe(true);
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
		const driver = createListVirtualizerDriver({ items, getKey });
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
});
