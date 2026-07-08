import { describe, expect, it } from "vitest";

import {
	createPeriodSelectOptions,
	normalizePeriodSelectDateRangeConnectors,
	normalizePeriodSelectPresetIds,
	resolvePeriodSelectAvailableValue,
	resolvePeriodSelectDefaultValue
} from "./periodSelect";

describe("periodSelect", () => {
	it("создает опции с порогами диапазона", () => {
		const options = createPeriodSelectOptions({
			maxDayRangeDays: 31,
			maxWeekRangeWeeks: 12
		});

		expect(options).toEqual([
			{ id: "day", label: "по дням", maxRangeDays: 31 },
			{ id: "week", label: "по неделям", maxRangeDays: 84 },
			{ id: "month", label: "по месяцам" }
		]);
	});

	it("переключает недоступный день на неделю", () => {
		const options = createPeriodSelectOptions({
			maxDayRangeDays: 7,
			maxWeekRangeWeeks: 8
		});

		expect(resolvePeriodSelectAvailableValue("day", options, [new Date(2026, 2, 1), new Date(2026, 2, 8)])).toBe("week");
	});

	it("переключает недоступную неделю на месяц", () => {
		const options = createPeriodSelectOptions({
			maxDayRangeDays: 7,
			maxWeekRangeWeeks: 2
		});

		expect(resolvePeriodSelectAvailableValue("week", options, [new Date(2026, 2, 1), new Date(2026, 2, 16)])).toBe("month");
	});

	it("оставляет текущую опцию, если диапазон не превышает порог", () => {
		const options = createPeriodSelectOptions({
			maxDayRangeDays: 7,
			maxWeekRangeWeeks: 2
		});

		expect(resolvePeriodSelectAvailableValue("day", options, [new Date(2026, 2, 1), new Date(2026, 2, 7)])).toBe("day");
		expect(resolvePeriodSelectAvailableValue("week", options, [new Date(2026, 2, 1), new Date(2026, 2, 14)])).toBe("week");
	});

	it("нормализует сохраненные id и default value", () => {
		expect(normalizePeriodSelectPresetIds(["week", "unknown", "week", "day"])).toEqual(["week", "day"]);
		expect(resolvePeriodSelectDefaultValue("month")).toBe("month");
		expect(resolvePeriodSelectDefaultValue("unknown")).toBe("day");
	});

	it("нормализует connector-ы связанного диапазона дат", () => {
		expect(normalizePeriodSelectDateRangeConnectors({ start: " P_DATE ", end: "P_DATE_TO" })).toEqual({
			start: "P_DATE",
			end: "P_DATE_TO"
		});
		expect(normalizePeriodSelectDateRangeConnectors({ start: "P_DATE" })).toBeUndefined();
		expect(normalizePeriodSelectDateRangeConnectors({ start: "P_DATE", end: " " })).toBeUndefined();
	});
});
