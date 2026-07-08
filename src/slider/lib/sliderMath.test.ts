import { describe, expect, it } from "vitest";

import { snapNumberScaleValueToMarks, snapNumberScaleValueToStep } from "@ryuzaki13/react-foundation-lib/number-scale";
import {
	getRangeSliderVisualValue,
	normalizeRangeSliderValue,
	normalizeSingleSliderValue,
	prepareSliderMarks,
	resolveSliderRangeOutputValue,
	valueToSliderVisualPercent,
	visualValueToRangeEndpoint
} from ".";

describe("sliderMath", () => {
	it("single нормализуется через shared number scale", () => {
		expect(snapNumberScaleValueToStep(16, 0, 100, 5)).toBe(15);
		expect(snapNumberScaleValueToStep(16.24, 0, 100, 0.25)).toBe(16.25);
		expect(normalizeSingleSliderValue(undefined, { min: 10, max: 30, step: 2 })).toBe(10);
	});

	it("marks фильтруются, сортируются и дедуплицируются", () => {
		const marks = prepareSliderMarks(
			[
				{ value: 75, label: "75" },
				{ value: 25, label: "25" },
				{ value: 25, label: "dup" },
				{ value: 200, label: "200" }
			],
			0,
			100
		);

		expect(marks.map((mark) => mark.value)).toEqual([25, 75]);
	});

	it("range сохраняет null как открытую границу и сортирует finite значения", () => {
		const marks = [
			{ value: 0, label: "До", outputValue: null },
			{ value: 3, label: "3" },
			{ value: 6, label: "6" },
			{ value: 12, label: "От", outputValue: null }
		] as const;

		expect(snapNumberScaleValueToMarks(4, marks, 0, 12)).toBe(3);
		expect(normalizeRangeSliderValue(undefined, { min: 0, max: 12, marks })).toEqual([null, null]);
		expect(normalizeRangeSliderValue([12, 3], { min: 0, max: 12, step: 1 })).toEqual([3, 12]);
		expect(normalizeRangeSliderValue([null, 6], { min: 0, max: 12, marks })).toEqual([null, 6]);
		expect(getRangeSliderVisualValue([null, 6], { min: 0, max: 12, marks })).toEqual([0, 6]);
	});

	it("визуальный percent значения совпадает с равномерной позицией mark", () => {
		const marks = [
			{ value: 1, label: "1" },
			{ value: 3, label: "3" },
			{ value: 6, label: "6" },
			{ value: 9, label: "9" },
			{ value: 12, label: "12" },
			{ value: 18, label: "18" },
			{ value: 24, label: "24" }
		] as const;

		expect(valueToSliderVisualPercent(9, { min: 1, max: 24, marks, marksPosition: "index" })).toBe(50);
	});

	it("range mapping использует outputValue как публичное значение, а value как координату шкалы", () => {
		const marks = [
			{ value: 0, label: "Без нижней границы", outputValue: null },
			{ value: 1, label: "1 месяц", outputValue: 30 },
			{ value: 3, label: "3 месяца", outputValue: 90 },
			{ value: 6, label: "6 месяцев", outputValue: 180 },
			{ value: 12, label: "12 месяцев", outputValue: 360 },
			{ value: 24, label: "24 месяца", outputValue: 720 },
			{ value: 25, label: "Без верхней границы", outputValue: null }
		] as const;
		const options = { min: 0, max: 25, marks, marksPosition: "index" } as const;

		expect(normalizeRangeSliderValue([30, 720], options)).toEqual([30, 720]);
		expect(normalizeRangeSliderValue([100, 700], options)).toEqual([90, 720]);
		expect(getRangeSliderVisualValue([30, 720], options)).toEqual([1, 24]);
		expect(getRangeSliderVisualValue([null, null], options)).toEqual([0, 25]);
		expect(visualValueToRangeEndpoint(3, options)).toBe(90);
		expect(visualValueToRangeEndpoint(25, options)).toBeNull();
		expect(valueToSliderVisualPercent(24, options)).toBeCloseTo(83.333);
	});

	it("готовит range output к сериализации без изменения null-контракта onChange", () => {
		const value = [null, 6] satisfies [number | null, number | null];

		expect(resolveSliderRangeOutputValue(value, { start: 0, end: 12 })).toEqual([0, 6]);
		expect(value).toEqual([null, 6]);
		expect(resolveSliderRangeOutputValue([null, null], { end: 12 })).toEqual([null, 12]);
		expect(resolveSliderRangeOutputValue([null, null], undefined)).toEqual([null, null]);
	});
});
