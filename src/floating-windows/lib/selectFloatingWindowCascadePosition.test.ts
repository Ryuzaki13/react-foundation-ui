import { describe, expect, it } from "vitest";

import { selectFloatingWindowCascadePosition } from "./selectFloatingWindowCascadePosition";

describe("selectFloatingWindowCascadePosition", () => {
	it("сохраняет свободную начальную позицию без создания новой записи", () => {
		const position = { x: 24, y: 24 };
		expect(selectFloatingWindowCascadePosition(position, [{ x: 100, y: 100 }])).toBe(position);
	});

	it("последовательно пропускает занятые шаги каскада", () => {
		const occupied = [
			{ x: 24, y: 24 },
			{ x: 48, y: 48 },
			{ x: 72, y: 72 }
		];
		expect(selectFloatingWindowCascadePosition({ x: 24, y: 24 }, occupied)).toEqual({ x: 96, y: 96 });
		expect(occupied[0]).toEqual({ x: 24, y: 24 });
	});

	it("поддерживает заданный шаг и нулевое смещение без поиска", () => {
		const position = { x: 10, y: 20 };
		expect(selectFloatingWindowCascadePosition(position, [position], 8)).toEqual({ x: 18, y: 28 });
		expect(selectFloatingWindowCascadePosition(position, [position], 0)).toBe(position);
	});

	it("завершает поиск при множественных одинаковых позициях", () => {
		expect(
			selectFloatingWindowCascadePosition(
				{ x: 24, y: 24 },
				Array.from({ length: 100 }, () => ({ x: 24, y: 24 }))
			)
		).toEqual({
			x: 48,
			y: 48
		});
	});

	it("отклоняет неверный шаг, позиции и арифметическое переполнение", () => {
		expect(() => selectFloatingWindowCascadePosition({ x: 0, y: 0 }, [], -1)).toThrow(RangeError);
		expect(() => selectFloatingWindowCascadePosition({ x: 0, y: 0 }, [], NaN)).toThrow(RangeError);
		expect(() => selectFloatingWindowCascadePosition({ x: 0, y: 0 }, [{ x: Infinity, y: 0 }])).toThrow(RangeError);
		expect(() => selectFloatingWindowCascadePosition({ x: Infinity, y: 0 }, [])).toThrow(RangeError);
		const position = { x: Number.MAX_VALUE, y: Number.MAX_VALUE };
		expect(() => selectFloatingWindowCascadePosition(position, [position], Number.MAX_VALUE)).toThrow(RangeError);
	});
});
