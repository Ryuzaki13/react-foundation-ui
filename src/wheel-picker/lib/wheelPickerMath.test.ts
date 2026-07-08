import { describe, expect, it } from "vitest";

import {
	clampWheelIndex,
	resolveClosestWheelIndex,
	resolveWheelEdgePadding,
	resolveWheelItemHeight,
	resolveWheelScrollTop,
	resolveWheelViewportHeight
} from "./wheelPickerMath";

describe("wheelPickerMath", () => {
	it("ограничивает индекс границами списка", () => {
		expect(clampWheelIndex(-3, 5)).toBe(0);
		expect(clampWheelIndex(2, 5)).toBe(2);
		expect(clampWheelIndex(99, 5)).toBe(4);
		expect(clampWheelIndex(0, 0)).toBe(0);
	});

	it("вычисляет высоту viewport с минимальным fallback", () => {
		expect(resolveWheelViewportHeight(0, 180)).toBe(180);
		expect(resolveWheelViewportHeight(120, 180)).toBe(180);
		expect(resolveWheelViewportHeight(240, 180)).toBe(240);
	});

	it("вычисляет высоту строки и padding для центрирования", () => {
		expect(resolveWheelItemHeight(180, 5)).toBe(36);
		expect(resolveWheelEdgePadding(180, 36)).toBe(72);
	});

	it("возвращает scrollTop для центрирования выбранного индекса", () => {
		expect(resolveWheelScrollTop(0, 36)).toBe(0);
		expect(resolveWheelScrollTop(3, 36)).toBe(108);
	});

	it("определяет ближайший индекс по scrollTop", () => {
		expect(resolveClosestWheelIndex(0, 36, 24)).toBe(0);
		expect(resolveClosestWheelIndex(17, 36, 24)).toBe(0);
		expect(resolveClosestWheelIndex(19, 36, 24)).toBe(1);
		expect(resolveClosestWheelIndex(4000, 36, 24)).toBe(23);
	});
});
