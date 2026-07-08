import { describe, expect, it } from "vitest";

import { resolveDateInputPeriodRangeState } from "./dateInputCalendar";

describe("dateInputCalendar", () => {
	it("помечает месяц внутри выбранного range", () => {
		expect(
			resolveDateInputPeriodRangeState({
				date: new Date(2026, 3, 1),
				value: [new Date(2026, 2, 1), new Date(2026, 4, 31, 23, 59, 59)],
				selectsRange: true,
				selectionOptions: { selectionMode: "month" }
			})
		).toEqual({
			selected: false,
			range: true,
			rangeStart: false,
			rangeEnd: false
		});
	});

	it("помечает стартовый и конечный год выбранного range", () => {
		expect(
			resolveDateInputPeriodRangeState({
				date: new Date(2026, 0, 1),
				value: [new Date(2026, 0, 1), new Date(2027, 11, 31, 23, 59, 59)],
				selectsRange: true,
				selectionOptions: { selectionMode: "year" }
			})
		).toMatchObject({ rangeStart: true, rangeEnd: false });
		expect(
			resolveDateInputPeriodRangeState({
				date: new Date(2027, 0, 1),
				value: [new Date(2026, 0, 1), new Date(2027, 11, 31, 23, 59, 59)],
				selectsRange: true,
				selectionOptions: { selectionMode: "year" }
			})
		).toMatchObject({ rangeStart: false, rangeEnd: true });
	});

	it("показывает preview range при наведении после выбора первого периода", () => {
		expect(
			resolveDateInputPeriodRangeState({
				date: new Date(2026, 3, 1),
				value: [new Date(2026, 2, 1), null],
				hoveredDate: new Date(2026, 4, 1),
				selectsRange: true,
				selectionOptions: { selectionMode: "month" }
			})
		).toMatchObject({ range: true });
	});
});
