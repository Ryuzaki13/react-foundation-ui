import { describe, expect, it } from "vitest";

import { type ListVirtualizerSnapshot } from "../model/listVirtualizerTypes";

import { selectListVisibleKeys } from "./selectListVisibleKeys";

const virtualItems = Object.freeze([
	Object.freeze({ key: "before", index: 0, start: 0, end: 120, size: 120, lane: 0 }),
	Object.freeze({ key: "partially-visible", index: 1, start: 120, end: 240, size: 120, lane: 0 }),
	Object.freeze({ key: "inside", index: 2, start: 240, end: 360, size: 120, lane: 0 }),
	Object.freeze({ key: "after", index: 3, start: 360, end: 480, size: 120, lane: 0 }),
	Object.freeze({ key: "zero-height", index: 4, start: 240, end: 240, size: 0, lane: 0 }),
	Object.freeze({ key: -1, index: 5, start: 240, end: 360, size: 120, lane: 0 })
]) satisfies ListVirtualizerSnapshot["virtualItems"];

describe("selectListVisibleKeys", () => {
	it("оставляет только положительное пересечение, исключая overscan, нулевую строку и sentinel", () => {
		const keys = selectListVisibleKeys(virtualItems, 150, 180);
		expect(keys).toEqual(["partially-visible", "inside"]);
		expect(Object.isFrozen(keys)).toBe(true);
		expect(Object.isFrozen(virtualItems)).toBe(true);
	});

	it("касание границы без пересечения не считает видимостью", () => {
		expect(selectListVisibleKeys(virtualItems, 120, 240)).toEqual(["partially-visible", "inside"]);
		expect(selectListVisibleKeys(virtualItems, 240, 120)).toEqual(["inside"]);
	});

	it.each([0, -1])("нулевой или скрытый viewport высоты %s не публикует строки", (height) => {
		expect(selectListVisibleKeys(virtualItems, 120, height)).toEqual([]);
	});
});
