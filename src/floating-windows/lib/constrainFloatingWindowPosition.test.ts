import { describe, expect, it } from "vitest";

import { constrainFloatingWindowPosition } from "./constrainFloatingWindowPosition";

describe("constrainFloatingWindowPosition", () => {
	it("сохраняет позицию и её identity внутри измеренных границ", () => {
		const position = { x: 24, y: 32 };
		expect(constrainFloatingWindowPosition(position, { width: 100, height: 80 }, { width: 400, height: 300 })).toBe(position);
	});

	it("ограничивает все края окна, а слишком большое окно привязывает к началу области", () => {
		expect(constrainFloatingWindowPosition({ x: -20, y: 500 }, { width: 100, height: 80 }, { width: 400, height: 300 })).toEqual({
			x: 0,
			y: 220
		});
		expect(constrainFloatingWindowPosition({ x: 100, y: 100 }, { width: 800, height: 400 }, { width: 400, height: 300 })).toEqual({
			x: 0,
			y: 0
		});
	});

	it("не сдвигает окно до измерения размера или ненулевой рабочей области", () => {
		const position = { x: 500, y: -20 };
		expect(constrainFloatingWindowPosition(position, null, { width: 100, height: 100 })).toBe(position);
		expect(constrainFloatingWindowPosition(position, { width: 100, height: 100 }, null)).toBe(position);
		expect(constrainFloatingWindowPosition(position, { width: 100, height: 100 }, { width: 0, height: 100 })).toBe(position);
		expect(constrainFloatingWindowPosition(position, { width: 100, height: 100 }, { width: 100, height: 0 })).toBe(position);
	});

	it("явно отклоняет нечисловую геометрию до проверки отсутствующих измерений", () => {
		expect(() => constrainFloatingWindowPosition({ x: NaN, y: 0 }, null, null)).toThrow(RangeError);
		expect(() => constrainFloatingWindowPosition({ x: 0, y: Infinity }, null, null)).toThrow(RangeError);
		expect(() => constrainFloatingWindowPosition({ x: 0, y: 0 }, { width: -1, height: 20 }, null)).toThrow(RangeError);
		expect(() => constrainFloatingWindowPosition({ x: 0, y: 0 }, null, { width: 100, height: Infinity })).toThrow(RangeError);
	});
});
