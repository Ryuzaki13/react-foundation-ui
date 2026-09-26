import { describe, expect, it, vi } from "vitest";

import { createFloatingWindowsStore } from "./createFloatingWindowsStore";

describe("createFloatingWindowsStore", () => {
	it("изолирует рабочие области и использует актуальные позиции при последовательном открытии", () => {
		const first = createFloatingWindowsStore();
		const second = createFloatingWindowsStore();
		const register = first.getState().register;
		register("first");
		register("second");
		second.getState().register("first");

		expect(first.getState().windows.get("first")?.position).toEqual({ x: 24, y: 24 });
		expect(first.getState().windows.get("second")?.position).toEqual({ x: 48, y: 48 });
		expect(first.getState().order).toEqual(["first", "second"]);
		expect(second.getState().windows.get("first")?.position).toEqual({ x: 24, y: 24 });
		expect(second.getState().order).toEqual(["first"]);
	});

	it("допускает Strict Mode register/unregister/register и отклоняет активный дубликат", () => {
		const store = createFloatingWindowsStore();
		const unregister = store.getState().register("window");
		const state = store.getState();
		expect(() => store.getState().register("window")).toThrow(/window/);
		expect(store.getState()).toBe(state);
		store.getState().setPosition("window", { x: 90, y: 80 });
		unregister();
		expect(store.getState().windows.size).toBe(0);
		expect(store.getState().positions.get("window")).toEqual({ x: 90, y: 80 });
		store.getState().register("window");
		const reopened = store.getState();
		unregister();
		expect(store.getState()).toBe(reopened);
		expect(reopened.windows.get("window")).toEqual({ position: { x: 90, y: 80 }, size: null, layer: 1 });
	});

	it.each(["", " \n\t", "a".repeat(257)])("отклоняет недопустимый ID при открытии и атомарном восстановлении: %j", (id) => {
		const store = createFloatingWindowsStore();
		store.getState().register("window");
		const before = store.getState();
		expect(() => store.getState().register(id)).toThrow(/Идентификатор/);
		expect(() =>
			store.getState().restorePositions(
				new Map([
					["window", { x: 50, y: 60 }],
					[id, { x: 20, y: 30 }]
				])
			)
		).toThrow(/Идентификатор/);
		expect(store.getState()).toBe(before);
	});

	it("принимает ID предельной длины и сохраняет значимые пробелы без переименования", () => {
		const store = createFloatingWindowsStore();
		const id = "a".repeat(256);
		store.getState().register(id);
		store.getState().register(" window ");
		store.getState().restorePositions(
			new Map([
				[id, { x: 50, y: 60 }],
				[" window ", { x: 20, y: 30 }]
			])
		);
		expect(store.getState().positions.get(id)).toEqual({ x: 50, y: 60 });
		expect(store.getState().positions.get(" window ")).toEqual({ x: 20, y: 30 });
		expect(store.getState().windows.has("window")).toBe(false);
	});

	it("игнорирует запоздалые события закрытого окна до валидации его устаревшей геометрии", () => {
		const store = createFloatingWindowsStore();
		const unregister = store.getState().register("window");
		unregister();
		const before = store.getState();
		const notify = vi.fn();
		store.subscribe(notify);
		expect(() => store.getState().setPosition("window", { x: NaN, y: Infinity })).not.toThrow();
		expect(() => store.getState().setSize("window", { width: NaN, height: -1 })).not.toThrow();
		expect(store.getState()).toBe(before);
		expect(notify).not.toHaveBeenCalled();
	});

	it("ограничивает позицию только после измерения обеих сторон и реагирует на их изменение", () => {
		const store = createFloatingWindowsStore();
		store.getState().setBounds({ width: 300, height: 200 });
		store.getState().register("window", { x: 500, y: 400 });
		expect(store.getState().windows.get("window")?.position).toEqual({ x: 500, y: 400 });
		store.getState().setSize("window", { width: 100, height: 80 });
		expect(store.getState().windows.get("window")?.position).toEqual({ x: 200, y: 120 });
		store.getState().setPosition("window", { x: -10, y: 500 });
		expect(store.getState().windows.get("window")?.position).toEqual({ x: 0, y: 120 });
		store.getState().setBounds({ width: 90, height: 50 });
		expect(store.getState().windows.get("window")?.position).toEqual({ x: 0, y: 0 });
		store.getState().setBounds({ width: 0, height: 50 });
		store.getState().setPosition("window", { x: 50, y: 40 });
		expect(store.getState().windows.get("window")?.position).toEqual({ x: 50, y: 40 });
	});

	it("сохраняет соседние snapshots и не уведомляет подписчиков о повторных значениях", () => {
		const store = createFloatingWindowsStore();
		store.getState().register("first");
		store.getState().register("second");
		store.getState().setSize("first", { width: 100, height: 100 });
		store.getState().setBounds({ width: 500, height: 400 });
		const second = store.getState().windows.get("second");
		store.getState().setPosition("first", { x: 100, y: 120 });
		expect(store.getState().windows.get("second")).toBe(second);

		const state = store.getState();
		const notify = vi.fn();
		store.subscribe(notify);
		store.getState().setPosition("first", { x: 100, y: 120 });
		store.getState().setSize("first", { width: 100, height: 100 });
		store.getState().setBounds({ width: 500, height: 400 });
		store.getState().bringToFront("second");
		store.getState().restorePositions(new Map(state.positions));
		store.getState().setPosition("closed", { x: 100, y: 120 });
		store.getState().setSize("closed", { width: 100, height: 100 });
		store.getState().bringToFront("closed");
		expect(store.getState()).toBe(state);
		expect(notify).not.toHaveBeenCalled();
	});

	it("меняет identity только у слоёв, реально затронутых фокусом и закрытием", () => {
		const store = createFloatingWindowsStore();
		store.getState().register("first");
		const unregisterSecond = store.getState().register("second");
		store.getState().register("third");
		const first = store.getState().windows.get("first");
		const positions = store.getState().positions;
		store.getState().bringToFront("second");
		expect(store.getState().order).toEqual(["first", "third", "second"]);
		expect(Array.from(store.getState().order, (id) => store.getState().windows.get(id)?.layer)).toEqual([1, 2, 3]);
		expect(store.getState().windows.get("first")).toBe(first);
		expect(store.getState().positions).toBe(positions);
		const third = store.getState().windows.get("third");
		unregisterSecond();
		expect(store.getState().order).toEqual(["first", "third"]);
		expect(store.getState().windows.get("first")).toBe(first);
		expect(store.getState().windows.get("third")).toBe(third);
		expect(store.getState().positions).toBe(positions);
	});

	it("закрывает среднее окно и сдвигает только расположенные над ним слои", () => {
		const store = createFloatingWindowsStore();
		store.getState().register("first");
		const unregister = store.getState().register("middle");
		store.getState().register("last");
		const before = store.getState();
		unregister();
		const after = store.getState();
		expect(after.order).toEqual(["first", "last"]);
		expect(after.windows.get("first")).toBe(before.windows.get("first"));
		expect(after.windows.get("last")?.layer).toBe(2);
		expect(after.windows.get("last")?.position).toBe(before.windows.get("last")?.position);
		expect(after.positions).toBe(before.positions);
	});

	it("восстанавливает позиции с ограничением, заменяет cache и сохраняет размеры и порядок открытых окон", () => {
		const store = createFloatingWindowsStore();
		const unregister = store.getState().register("old");
		unregister();
		store.getState().register("first");
		store.getState().register("second");
		store.getState().setSize("first", { width: 100, height: 80 });
		store.getState().setBounds({ width: 300, height: 200 });
		const before = store.getState();
		store.getState().restorePositions(
			new Map([
				["first", { x: 500, y: 500 }],
				["next", { x: 10, y: 20 }]
			])
		);
		const after = store.getState();
		expect(after.positions.has("old")).toBe(false);
		expect(after.positions.get("first")).toEqual({ x: 200, y: 120 });
		expect(after.windows.get("first")?.size).toBe(before.windows.get("first")?.size);
		expect(after.windows.get("second")).toBe(before.windows.get("second"));
		expect(after.order).toBe(before.order);
		expect(after.bounds).toBe(before.bounds);
		store.getState().register("next");
		expect(store.getState().windows.get("next")?.position).toEqual({ x: 10, y: 20 });
	});

	it("не пересоздаёт окна при изменении bounds без перемещения и при эквивалентном восстановлении", () => {
		const store = createFloatingWindowsStore();
		store.getState().register("window");
		store.getState().setSize("window", { width: 100, height: 80 });
		const before = store.getState();
		store.getState().setBounds({ width: 500, height: 400 });
		expect(store.getState().windows).toBe(before.windows);
		expect(store.getState().positions).toBe(before.positions);
		const measured = store.getState();
		store.getState().restorePositions(new Map([["window", { x: 24, y: 24 }]]));
		expect(store.getState()).toBe(measured);
	});

	it("явно отклоняет неверные числа и применяет restore атомарно", () => {
		expect(() => createFloatingWindowsStore({ cascadeOffset: -1 })).toThrow(RangeError);
		expect(() => createFloatingWindowsStore({ cascadeOffset: Infinity })).toThrow(RangeError);
		const store = createFloatingWindowsStore();
		store.getState().register("window");
		const before = store.getState();
		expect(() => store.getState().register("bad", { x: NaN, y: 0 })).toThrow(RangeError);
		expect(() => store.getState().setPosition("window", { x: NaN, y: 0 })).toThrow(RangeError);
		expect(() => store.getState().setSize("window", { width: -1, height: 80 })).toThrow(RangeError);
		expect(() => store.getState().setBounds({ width: Infinity, height: 100 })).toThrow(RangeError);
		expect(() =>
			store.getState().restorePositions(
				new Map([
					["window", { x: 50, y: 60 }],
					["bad", { x: 0, y: NaN }]
				])
			)
		).toThrow(RangeError);
		expect(store.getState()).toBe(before);
	});
});
