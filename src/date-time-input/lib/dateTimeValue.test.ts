import { describe, expect, it } from "vitest";

import {
	clampTimeForDay,
	createTimeOnlyBaseDate,
	formatDateTimeInputValue,
	getTimeRangeForDay,
	isDateTimeWithinRange,
	mergeDateWithTime,
	mergeTimeIntoDate,
	parseDateTimeInputValue
} from "./dateTimeValue";

describe("dateTimeValue helpers", () => {
	it("строго форматирует и парсит дату-время в формате dd.MM.yyyy HH:mm", () => {
		const value = new Date(2026, 2, 3, 18, 3, 0, 0);

		expect(formatDateTimeInputValue(value)).toBe("03.03.2026 18:03");
		expect(parseDateTimeInputValue("03.03.2026 18:03")).toEqual(value);
	});

	it("отклоняет невалидные календарные даты и время", () => {
		expect(parseDateTimeInputValue("31.02.2026 10:00")).toBeNull();
		expect(parseDateTimeInputValue("03.03.2026 24:00")).toBeNull();
		expect(parseDateTimeInputValue("29.02.2025 10:00")).toBeNull();
	});

	it("строго форматирует и парсит время в режиме time", () => {
		const value = new Date(2035, 7, 19, 6, 5, 47, 123);

		expect(formatDateTimeInputValue(value, "time")).toBe("06:05");
		expect(parseDateTimeInputValue("06:05", "time")).toEqual(createTimeOnlyBaseDate(6, 5));
	});

	it("отклоняет невалидное время в режиме time", () => {
		expect(parseDateTimeInputValue("24:00", "time")).toBeNull();
		expect(parseDateTimeInputValue("12:60", "time")).toBeNull();
		expect(parseDateTimeInputValue("6:05", "time")).toBeNull();
	});

	it("сохраняет время при переносе выбранного дня", () => {
		expect(mergeDateWithTime(new Date(2026, 2, 10, 0, 0, 0, 0), new Date(2026, 2, 3, 18, 3, 50, 0))).toEqual(
			new Date(2026, 2, 10, 18, 3, 0, 0)
		);
	});

	it("переносит часы и минуты в базовую дату", () => {
		expect(mergeTimeIntoDate(new Date(2026, 2, 10, 0, 0, 0, 0), 9, 15)).toEqual(new Date(2026, 2, 10, 9, 15, 0, 0));
		expect(mergeTimeIntoDate(new Date(2026, 2, 10, 0, 0, 0, 0), 9, 15, "time")).toEqual(createTimeOnlyBaseDate(9, 15));
	});

	it("ограничивает время внутри диапазона того же дня", () => {
		const day = new Date(2026, 2, 10, 0, 0, 0, 0);
		const minDate = new Date(2026, 2, 10, 9, 15, 0, 0);
		const maxDate = new Date(2026, 2, 10, 18, 30, 0, 0);
		const range = getTimeRangeForDay(day, minDate, maxDate);

		expect(range.minHour).toBe(9);
		expect(range.maxHour).toBe(18);
		expect(range.minMinuteByHour(9)).toBe(15);
		expect(range.maxMinuteByHour(18)).toBe(30);
		expect(clampTimeForDay(day, 8, 0, minDate, maxDate)).toEqual({ hours: 9, minutes: 15 });
		expect(clampTimeForDay(day, 20, 59, minDate, maxDate)).toEqual({ hours: 18, minutes: 30 });
	});

	it("помечает день недоступным, если границы одного часа не пересекаются по минутам", () => {
		const day = new Date(2026, 2, 10, 0, 0, 0, 0);
		const range = getTimeRangeForDay(day, new Date(2026, 2, 10, 9, 45, 0, 0), new Date(2026, 2, 10, 9, 15, 0, 0));

		expect(range.disabled).toBe(true);
	});

	it("сравнивает диапазон только по времени суток в режиме time", () => {
		const minDate = new Date(2026, 2, 10, 9, 15, 45, 999);
		const maxDate = new Date(2026, 11, 24, 18, 30, 10, 500);

		expect(isDateTimeWithinRange(new Date(2030, 5, 1, 12, 0, 0, 0), minDate, maxDate, "time")).toBe(true);
		expect(isDateTimeWithinRange(new Date(2030, 5, 1, 8, 59, 0, 0), minDate, maxDate, "time")).toBe(false);
		expect(isDateTimeWithinRange(new Date(2030, 5, 1, 18, 31, 0, 0), minDate, maxDate, "time")).toBe(false);
	});

	it("ограничивает время по диапазону суток в режиме time", () => {
		const value = new Date(2030, 5, 1, 12, 0, 0, 0);
		const minDate = new Date(2026, 2, 10, 9, 15, 45, 999);
		const maxDate = new Date(2026, 11, 24, 18, 30, 10, 500);
		const range = getTimeRangeForDay(value, minDate, maxDate, "time");

		expect(range.minHour).toBe(9);
		expect(range.maxHour).toBe(18);
		expect(range.minMinuteByHour(9)).toBe(15);
		expect(range.maxMinuteByHour(18)).toBe(30);
		expect(clampTimeForDay(value, 8, 0, minDate, maxDate, "time")).toEqual({ hours: 9, minutes: 15 });
		expect(clampTimeForDay(value, 20, 59, minDate, maxDate, "time")).toEqual({ hours: 18, minutes: 30 });
	});

	it("проверяет вхождение даты-времени в диапазон", () => {
		const minDate = new Date(2026, 2, 10, 9, 15, 0, 0);
		const maxDate = new Date(2026, 2, 10, 18, 30, 0, 0);

		expect(isDateTimeWithinRange(new Date(2026, 2, 10, 12, 0, 0, 0), minDate, maxDate)).toBe(true);
		expect(isDateTimeWithinRange(new Date(2026, 2, 10, 8, 59, 0, 0), minDate, maxDate)).toBe(false);
		expect(isDateTimeWithinRange(new Date(2026, 2, 10, 18, 31, 0, 0), minDate, maxDate)).toBe(false);
	});
});
