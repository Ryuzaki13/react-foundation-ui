import { afterEach, describe, expect, it, vi } from "vitest";

import {
	areRangeDateValuesEqual,
	areSingleDateValuesEqual,
	formatRangeDateValue,
	formatSingleDateValue,
	normalizeRangeDateValue,
	normalizeSingleDateValue,
	parseRangeDateValue,
	parseSingleDateValue
} from "./dateInputValue";

afterEach(() => {
	vi.useRealTimers();
});

describe("dateInputValue", () => {
	const baseDate = new Date(2026, 2, 3, 12, 30, 0);

	it("форматирует дату через пресеты", () => {
		expect(formatSingleDateValue(baseDate, { datePreset: "date-short" })).toBe("03.03.2026");
		expect(formatSingleDateValue(baseDate, { datePreset: "date-medium" })).toBe("3 мар. 2026 г.");
		expect(formatSingleDateValue(baseDate, { datePreset: "date-long" })).toBe("3 марта 2026 г.");
	});

	it("форматирует диапазон через именованный пресет библиотеки", () => {
		expect(formatRangeDateValue([baseDate, new Date(2026, 2, 5, 12, 30, 0)], { datePreset: "date-long" })).toBe(
			"3 марта 2026 г. - 5 марта 2026 г."
		);
	});

	it("отображает одиночную неделю как включительный диапазон", () => {
		expect(formatSingleDateValue(new Date(2026, 6, 2), { selectionMode: "week", weekEndDay: "saturday" })).toBe(
			"29.06.2026 - 04.07.2026"
		);
	});

	it("отображает начало незавершённого диапазона недель без второй границы", () => {
		expect(formatRangeDateValue([new Date(2026, 5, 29), null], { selectionMode: "week", weekEndDay: "saturday" })).toBe(
			"29.06.2026 - "
		);
	});

	it("учитывает уровень выбора месяца при форматировании", () => {
		expect(formatSingleDateValue(baseDate, { datePreset: "date-long", datePickerLevel: "month" })).toBe("март 2026 г.");
		expect(formatSingleDateValue(baseDate, { dateFormat: "dd.MM.yyyy", datePickerLevel: "month" })).toBe("03.2026");
		expect(
			formatRangeDateValue([baseDate, new Date(2026, 4, 5, 12, 30, 0)], { datePreset: "date-long", datePickerLevel: "month" })
		).toBe("март 2026 г. - май 2026 г.");
	});

	it("учитывает уровень выбора года при форматировании", () => {
		expect(formatSingleDateValue(baseDate, { datePreset: "date-long", datePickerLevel: "year" })).toBe("2026");
		expect(formatSingleDateValue(baseDate, { dateFormat: "dd.MM.yyyy", datePickerLevel: "year" })).toBe("2026");
	});

	it("нормализует одиночное значение к началу выбранного периода", () => {
		expect(normalizeSingleDateValue(new Date(2026, 6, 2, 12, 0), { selectionMode: "week" })).toEqual(new Date(2026, 5, 29));
		expect(normalizeSingleDateValue(new Date(2026, 6, 2, 12, 0), { selectionMode: "month" })).toEqual(new Date(2026, 6, 1));
		expect(normalizeSingleDateValue(new Date(2026, 6, 2, 12, 0), { selectionMode: "year" })).toEqual(new Date(2026, 0, 1));
	});

	it("нормализует диапазон к началу первого периода и концу второго периода", () => {
		expect(
			normalizeRangeDateValue([new Date(2026, 6, 2, 12, 0), new Date(2026, 6, 15, 12, 0)], {
				selectionMode: "week",
				weekEndDay: "friday"
			})
		).toEqual([new Date(2026, 5, 29), new Date(2026, 6, 17, 23, 59, 59)]);
		expect(normalizeRangeDateValue([new Date(2026, 1, 15, 12, 0), new Date(2026, 2, 3, 12, 0)], { selectionMode: "month" })).toEqual([
			new Date(2026, 1, 1),
			new Date(2026, 2, 31, 23, 59, 59)
		]);
	});

	it("сохраняет deprecated-поддержку пользовательских шаблонов через dateFormat", () => {
		expect(formatSingleDateValue(baseDate, { datePreset: "yyyy/MM/dd" })).toBe("03.03.2026");
		expect(formatSingleDateValue(baseDate, { dateFormat: "yyyy/MM/dd" })).toBe("2026/03/03");
		expect(parseSingleDateValue("2026/03/03", { dateFormat: "yyyy/MM/dd" })).toEqual(new Date(2026, 2, 3, 0, 0, 0));
	});

	it("парсит человекочитаемые ru-RU даты из пресетов", () => {
		expect(parseSingleDateValue("3 мар. 2026 г.", { datePreset: "date-medium" })).toEqual(new Date(2026, 2, 3, 0, 0, 0));
		expect(parseSingleDateValue("3 марта 2026 г.", { datePreset: "date-long" })).toEqual(new Date(2026, 2, 3, 0, 0, 0));
	});

	it("парсит отображаемый диапазон одиночной недели в её начало", () => {
		expect(
			parseSingleDateValue("29.06.2026 - 04.07.2026", {
				selectionMode: "week",
				weekEndDay: "saturday"
			})
		).toEqual(new Date(2026, 5, 29, 0, 0, 0));
	});

	it("форматирует и парсит day+month пресеты", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0));

		expect(formatSingleDateValue(new Date(2026, 4, 25), { datePreset: "month-long" })).toBe("25 мая");
		expect(formatSingleDateValue(new Date(2026, 5, 25), { datePreset: "month-short" })).toBe("25 июн.");
		expect(parseSingleDateValue("25 июня", { datePreset: "month-long" })).toEqual(new Date(2026, 5, 25, 0, 0, 0));
		expect(parseRangeDateValue("25 мая - 25 июн.", { datePreset: "month-short" })).toEqual([
			new Date(2026, 4, 25, 0, 0, 0),
			new Date(2026, 5, 25, 23, 59, 59)
		]);
	});

	it("парсит day+month пресеты с опорной датой", () => {
		expect(parseSingleDateValue("25 июня", { datePreset: "month-long", referenceDate: new Date(2027, 0, 15) })).toEqual(
			new Date(2027, 5, 25, 0, 0, 0)
		);
	});

	it("парсит диапазон с человекочитаемым пресетом", () => {
		expect(parseRangeDateValue("3 мар. 2026 г. - 5 мар. 2026 г.", { datePreset: "date-medium" })).toEqual([
			new Date(2026, 2, 3, 0, 0, 0),
			new Date(2026, 2, 5, 23, 59, 59)
		]);
	});

	it("парсит месяц и год с учётом уровня выбора", () => {
		expect(parseSingleDateValue("март 2026 г.", { datePreset: "date-long", datePickerLevel: "month" })).toEqual(
			new Date(2026, 2, 1, 0, 0, 0)
		);
		expect(parseSingleDateValue("2026 г.", { datePreset: "date-long", datePickerLevel: "year" })).toEqual(
			new Date(2026, 0, 1, 0, 0, 0)
		);
		expect(parseRangeDateValue("март 2026 г. - май 2026 г.", { datePreset: "date-long", datePickerLevel: "month" })).toEqual([
			new Date(2026, 2, 1, 0, 0, 0),
			new Date(2026, 4, 1, 23, 59, 59)
		]);
		expect(
			parseRangeDateValue("март 2026 г. - май 2026 г.", {
				datePreset: "date-long",
				selectionMode: "month"
			})
		).toEqual([new Date(2026, 2, 1, 0, 0, 0), new Date(2026, 4, 31, 23, 59, 59)]);
	});

	it("сохраняет старый позиционный вызов", () => {
		expect(formatSingleDateValue(baseDate, "date-long", "month")).toBe("март 2026 г.");
		expect(parseSingleDateValue("3 марта 2026 г.", "date-long")).toEqual(new Date(2026, 2, 3, 0, 0, 0));
	});

	it("сравнивает одиночные даты после нормализации времени", () => {
		expect(areSingleDateValuesEqual(baseDate, new Date(2026, 2, 3, 0, 0, 0))).toBe(true);
		expect(areSingleDateValuesEqual(baseDate, new Date(2026, 2, 4, 0, 0, 0))).toBe(false);
	});

	it("сравнивает диапазоны после нормализации границ суток", () => {
		expect(
			areRangeDateValuesEqual(
				[baseDate, new Date(2026, 2, 5, 12, 30, 0)],
				[new Date(2026, 2, 3, 0, 0, 0), new Date(2026, 2, 5, 23, 59, 59)]
			)
		).toBe(true);
		expect(areRangeDateValuesEqual([baseDate, null], [baseDate, new Date(2026, 2, 5, 23, 59, 59)])).toBe(false);
	});
});
