import { describe, expect, it } from "vitest";

import {
	createPeriodSelectOptions,
	DEFAULT_PERIOD_SELECT_PRESET_IDS,
	normalizePeriodSelectDateRangeConnectors,
	normalizePeriodSelectPresetIds,
	PERIOD_SELECT_OPTIONS,
	resolvePeriodSelectAvailableValue,
	resolvePeriodSelectDefaultValue,
	resolvePeriodSelectOptionsByIds
} from "./periodSelect";

describe("periodSelect", () => {
	it("содержит год в полном каноническом каталоге", () => {
		expect(PERIOD_SELECT_OPTIONS).toEqual([
			{ id: "day", label: "по дням" },
			{ id: "week", label: "по неделям" },
			{ id: "month", label: "по месяцам" },
			{ id: "year", label: "по годам" }
		]);
		expect(DEFAULT_PERIOD_SELECT_PRESET_IDS).toEqual(["day", "week", "month", "year"]);
	});

	it("создает опции с порогами диапазона", () => {
		const options = createPeriodSelectOptions({
			maxDayRangeDays: 31,
			maxWeekRangeWeeks: 12
		});

		expect(options).toEqual([
			{ id: "day", label: "по дням", maxRangeDays: 31 },
			{ id: "week", label: "по неделям", maxRangeDays: 84 },
			{ id: "month", label: "по месяцам" },
			{ id: "year", label: "по годам" }
		]);
	});

	it("ограничивает встроенные опции без изменения канонического порядка и порогов", () => {
		const presetIds = normalizePeriodSelectPresetIds(["year", "week", "unknown", "week", "month"]);
		const options = resolvePeriodSelectOptionsByIds(
			presetIds,
			createPeriodSelectOptions({
				maxDayRangeDays: 31,
				maxWeekRangeWeeks: 12
			})
		);

		expect(presetIds).toEqual(["week", "month", "year"]);
		expect(options).toEqual([
			{ id: "week", label: "по неделям", maxRangeDays: 84 },
			{ id: "month", label: "по месяцам" },
			{ id: "year", label: "по годам" }
		]);
	});

	it("поддерживает allow-list month/year и day/week/month", () => {
		expect(normalizePeriodSelectPresetIds(["year", "month"])).toEqual(["month", "year"]);
		expect(normalizePeriodSelectPresetIds(["month", "day", "week"])).toEqual(["day", "week", "month"]);
	});

	it("заменяет пустой или полностью невалидный allow-list полным набором", () => {
		expect(normalizePeriodSelectPresetIds([])).toEqual(DEFAULT_PERIOD_SELECT_PRESET_IDS);
		expect(normalizePeriodSelectPresetIds(["unknown", "unknown"])).toEqual(DEFAULT_PERIOD_SELECT_PRESET_IDS);
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

	it("выбирает первый разрешенный вариант, если текущее значение исключено", () => {
		const options = resolvePeriodSelectOptionsByIds(["month", "year"]);

		expect(resolvePeriodSelectAvailableValue("day", options, undefined)).toBe("month");
	});

	it("возвращает undefined, если диапазон блокирует все разрешенные варианты", () => {
		const options = resolvePeriodSelectOptionsByIds(
			["day", "week"],
			createPeriodSelectOptions({ maxDayRangeDays: 1, maxWeekRangeWeeks: 1 })
		);

		expect(resolvePeriodSelectAvailableValue("day", options, [new Date(2026, 2, 1), new Date(2026, 2, 10)])).toBeUndefined();
	});

	it("нормализует сохраненные id и default value", () => {
		expect(normalizePeriodSelectPresetIds(["week", "unknown", "week", "day"])).toEqual(["day", "week"]);
		expect(resolvePeriodSelectDefaultValue("year")).toBe("year");
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
