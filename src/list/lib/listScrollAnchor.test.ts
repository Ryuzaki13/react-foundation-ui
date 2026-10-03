import { describe, expect, it } from "vitest";

import { captureListScrollAnchor } from "./captureListScrollAnchor";
import { resolveListScrollAnchor } from "./resolveListScrollAnchor";

describe("якорь виртуального списка", () => {
	const keys = ["a", "b", "c", "d", "e"];
	const anchor = captureListScrollAnchor(keys, { key: "c", index: 2, start: 240 }, 277);

	it("сохраняет stable key и внутристочное смещение вместо абсолютного scroll offset", () => {
		expect(anchor).toEqual({ type: "item", key: "c", index: 2, offset: 37, previousKeys: keys });
		expect(resolveListScrollAnchor(anchor, ["new", ...keys])).toEqual({ index: 3, offset: 37 });
	});

	it("переносит якорь при перестановке без привязки к прежнему индексу", () => {
		expect(resolveListScrollAnchor(anchor, ["c", "a", "e", "b", "d"])).toEqual({ index: 0, offset: 37 });
	});

	it("при удалении якоря выбирает следующий ключ на равном расстоянии", () => {
		expect(resolveListScrollAnchor(anchor, ["a", "b", "d", "e"])).toEqual({ index: 2, offset: 37 });
	});

	it("выбирает ближайший предыдущий ключ, а не любой последующий", () => {
		expect(resolveListScrollAnchor(anchor, ["a", "b", "e"])).toEqual({ index: 1, offset: 37 });
	});

	it("учитывает новый порядок ближайшего surviving key", () => {
		expect(resolveListScrollAnchor(anchor, ["e", "d", "a"])).toEqual({ index: 1, offset: 37 });
	});

	it("сохраняет предыдущую строку при удалении хвоста", () => {
		const lastAnchor = captureListScrollAnchor(keys, { key: "e", index: 4, start: 480 }, 492);
		expect(resolveListScrollAnchor(lastAnchor, ["a", "b"])).toEqual({ index: 1, offset: 12 });
	});

	it("сбрасывает позицию, если прежние ключи полностью исчезли", () => {
		expect(resolveListScrollAnchor(anchor, ["x", "y"])).toBeNull();
		expect(resolveListScrollAnchor(anchor, [])).toBeNull();
	});

	it.each([0, -20])("оставляет верх списка на нуле при browser offset %s", (offset) => {
		const top = captureListScrollAnchor(keys, { key: "a", index: 0, start: 0 }, offset);
		expect(top).toEqual({ type: "start" });
		expect(resolveListScrollAnchor(top, ["new", ...keys])).toBeNull();
	});

	it("не считает служебную строку загрузки пользовательским якорем", () => {
		expect(captureListScrollAnchor(keys, { key: -1, index: 5, start: 600 }, 620)).toEqual({ type: "start" });
		expect(captureListScrollAnchor([], undefined, 0)).toEqual({ type: "start" });
	});

	it("не мутирует исходный порядок при поиске соседей", () => {
		const previousKeys = Object.freeze([...keys]);
		const currentKeys = Object.freeze(["a", "b", "e"]);
		const captured = captureListScrollAnchor(previousKeys, { key: "c", index: 2, start: 240 }, 245);
		expect(resolveListScrollAnchor(captured, currentKeys)).toEqual({ index: 1, offset: 5 });
		expect(previousKeys).toEqual(keys);
		expect(currentKeys).toEqual(["a", "b", "e"]);
	});
});
