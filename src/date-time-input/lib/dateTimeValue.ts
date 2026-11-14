import { dateToIndexedSegmentValues, indexedSegmentsToDate, parseDateSegmentMask } from "@ryuzaki13/react-foundation-lib/date-segments";
import {
	createCalendarDate,
	type DateFormatPreset,
	formatDate,
	parseDate,
	parseDateByPattern
} from "@ryuzaki13/react-foundation-lib/formatters";

import { DATE_TIME_INPUT_MODE_DATE_TIME, DATE_TIME_INPUT_MODE_TIME } from "./dateTimeInputModes";

const MINUTES_PER_HOUR = 60;
const LAST_HOUR_OF_DAY = 23;
const LAST_MINUTE_OF_HOUR = 59;

export type DateTimeInputMode = typeof DATE_TIME_INPUT_MODE_DATE_TIME | typeof DATE_TIME_INPUT_MODE_TIME;

/**
 * Фиксированный формат нового поля даты-времени.
 */
export const DATE_TIME_INPUT_FORMAT = "dd.MM.yyyy HH:mm";
export const TIME_INPUT_FORMAT = "HH:mm";

const DATE_TIME_INPUT_PRESET_NAME = "__date_time_input__";
const TIME_INPUT_PRESET_NAME = "__time_input__";
const TIME_ONLY_BASE_YEAR = 1970;
const TIME_ONLY_BASE_MONTH = 0;
const TIME_ONLY_BASE_DAY = 1;
const TIME_SEGMENTS = parseDateSegmentMask(TIME_INPUT_FORMAT);

/**
 * Создаёт техническую базовую дату для режима выбора только времени.
 */
export function createTimeOnlyBaseDate(hours = 0, minutes = 0): Date {
	return createCalendarDate(TIME_ONLY_BASE_YEAR, TIME_ONLY_BASE_MONTH, TIME_ONLY_BASE_DAY, hours, minutes, 0, 0);
}

/**
 * Возвращает формат пользовательского ввода для выбранного режима.
 */
export function getDateTimeInputFormat(mode: DateTimeInputMode = DATE_TIME_INPUT_MODE_DATE_TIME): string {
	return mode === DATE_TIME_INPUT_MODE_TIME ? TIME_INPUT_FORMAT : DATE_TIME_INPUT_FORMAT;
}

/**
 * Создаёт временную предустановку форматирования для нового поля даты-времени.
 */
export function createDateTimeInputPreset(mode: DateTimeInputMode = DATE_TIME_INPUT_MODE_DATE_TIME): DateFormatPreset {
	return {
		name: mode === DATE_TIME_INPUT_MODE_TIME ? TIME_INPUT_PRESET_NAME : DATE_TIME_INPUT_PRESET_NAME,
		pattern: getDateTimeInputFormat(mode),
		locale: "ru-RU",
		invalidFallback: ""
	};
}

/**
 * Нормализует внешнее значение к валидному Date без timezone-сдвига.
 */
export function normalizeDateTimeValue(
	value: Date | null | undefined,
	mode: DateTimeInputMode = DATE_TIME_INPUT_MODE_DATE_TIME
): Date | null {
	if (value == null) return null;

	const parsedValue = parseDate(value);
	if (!parsedValue) return null;

	if (mode === DATE_TIME_INPUT_MODE_TIME) {
		return createTimeOnlyBaseDate(parsedValue.getHours(), parsedValue.getMinutes());
	}

	return parsedValue;
}

/**
 * Форматирует значение поля даты-времени в фиксированный пользовательский формат.
 */
export function formatDateTimeInputValue(value: Date | null | undefined, mode: DateTimeInputMode = DATE_TIME_INPUT_MODE_DATE_TIME): string {
	if (!value) return "";
	return formatDate(normalizeDateTimeValue(value, mode), createDateTimeInputPreset(mode));
}

/**
 * Строго парсит строку пользовательского ввода в Date.
 */
export function parseDateTimeInputValue(value: string, mode: DateTimeInputMode = DATE_TIME_INPUT_MODE_DATE_TIME): Date | null {
	if (mode === DATE_TIME_INPUT_MODE_TIME) {
		const match = /^\d{2}:\d{2}$/.exec(value.trim());
		if (!match) return null;

		const values = dateToIndexedSegmentValues(createTimeOnlyBaseDate(), TIME_SEGMENTS);
		values.set(0, value.slice(0, 2));
		values.set(2, value.slice(3, 5));

		return indexedSegmentsToDate(TIME_SEGMENTS, values, {
			defaultDate: createTimeOnlyBaseDate()
		});
	}

	const parsed = parseDateByPattern(value, DATE_TIME_INPUT_FORMAT);
	if (!parsed || parsed.kind !== "date-time") return null;

	return parsed.date;
}

/**
 * Проверяет, попадает ли дата-время в допустимый диапазон.
 */
export function isDateTimeWithinRange(
	value: Date,
	minDate?: Date,
	maxDate?: Date,
	mode: DateTimeInputMode = DATE_TIME_INPUT_MODE_DATE_TIME
): boolean {
	const normalizedValue = normalizeDateTimeValue(value, mode);
	if (!normalizedValue) return false;

	if (mode === DATE_TIME_INPUT_MODE_TIME) {
		const valueMinutes = normalizedValue.getHours() * MINUTES_PER_HOUR + normalizedValue.getMinutes();
		const normalizedMinDate = minDate ? normalizeDateTimeValue(minDate, DATE_TIME_INPUT_MODE_TIME) : null;
		const normalizedMaxDate = maxDate ? normalizeDateTimeValue(maxDate, DATE_TIME_INPUT_MODE_TIME) : null;

		if (normalizedMinDate) {
			const minMinutes = normalizedMinDate.getHours() * MINUTES_PER_HOUR + normalizedMinDate.getMinutes();
			if (valueMinutes < minMinutes) return false;
		}

		if (normalizedMaxDate) {
			const maxMinutes = normalizedMaxDate.getHours() * MINUTES_PER_HOUR + normalizedMaxDate.getMinutes();
			if (valueMinutes > maxMinutes) return false;
		}

		return true;
	}

	if (minDate && normalizedValue < minDate) return false;
	if (maxDate && normalizedValue > maxDate) return false;

	return true;
}

/**
 * Переносит дату выбранного дня, сохраняя часы и минуты базового значения.
 */
export function mergeDateWithTime(datePart: Date, timeSource?: Date | null): Date {
	const source = normalizeDateTimeValue(timeSource);
	const hours = source?.getHours() ?? 0;
	const minutes = source?.getMinutes() ?? 0;

	return createCalendarDate(datePart.getFullYear(), datePart.getMonth(), datePart.getDate(), hours, minutes, 0, 0);
}

/**
 * Переносит часы и минуты в базовую календарную дату.
 */
export function mergeTimeIntoDate(
	baseDate: Date,
	hours: number,
	minutes: number,
	mode: DateTimeInputMode = DATE_TIME_INPUT_MODE_DATE_TIME
): Date {
	if (mode === DATE_TIME_INPUT_MODE_TIME) {
		return createTimeOnlyBaseDate(hours, minutes);
	}

	return createCalendarDate(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hours, minutes, 0, 0);
}

/**
 * Создаёт рабочую дату для picker-сценариев без выбранного значения.
 */
export function resolvePickerBaseDate(
	value: Date | null | undefined,
	fallbackDate: Date,
	mode: DateTimeInputMode = DATE_TIME_INPUT_MODE_DATE_TIME
): Date {
	if (mode === DATE_TIME_INPUT_MODE_TIME) {
		return normalizeDateTimeValue(value, DATE_TIME_INPUT_MODE_TIME) ?? createTimeOnlyBaseDate();
	}

	return normalizeDateTimeValue(value, mode) ?? fallbackDate;
}

/**
 * Возвращает границы часов и минут для выбранного календарного дня.
 */
export function getTimeRangeForDay(
	day: Date,
	minDate?: Date,
	maxDate?: Date,
	mode: DateTimeInputMode = DATE_TIME_INPUT_MODE_DATE_TIME
): {
	disabled: boolean;
	minHour: number;
	maxHour: number;
	minMinuteByHour: (hour: number) => number;
	maxMinuteByHour: (hour: number) => number;
} {
	const normalizedDay = normalizeDateTimeValue(day, mode) ?? day;
	const normalizedMinDate = minDate ? normalizeDateTimeValue(minDate, mode) : null;
	const normalizedMaxDate = maxDate ? normalizeDateTimeValue(maxDate, mode) : null;
	const isSameMinDay =
		!!normalizedMinDate &&
		normalizedDay.getFullYear() === normalizedMinDate.getFullYear() &&
		normalizedDay.getMonth() === normalizedMinDate.getMonth() &&
		normalizedDay.getDate() === normalizedMinDate.getDate();
	const isSameMaxDay =
		!!normalizedMaxDate &&
		normalizedDay.getFullYear() === normalizedMaxDate.getFullYear() &&
		normalizedDay.getMonth() === normalizedMaxDate.getMonth() &&
		normalizedDay.getDate() === normalizedMaxDate.getDate();

	const minHour = isSameMinDay ? normalizedMinDate!.getHours() : 0;
	const maxHour = isSameMaxDay ? normalizedMaxDate!.getHours() : LAST_HOUR_OF_DAY;
	const minMinuteAtBoundary = isSameMinDay && minHour === maxHour ? normalizedMinDate!.getMinutes() : 0;
	const maxMinuteAtBoundary = isSameMaxDay && minHour === maxHour ? normalizedMaxDate!.getMinutes() : LAST_MINUTE_OF_HOUR;
	const disabled = minHour > maxHour || (minHour === maxHour && minMinuteAtBoundary > maxMinuteAtBoundary);

	return {
		disabled,
		minHour,
		maxHour,
		minMinuteByHour: (hour) => {
			if (disabled) return 0;
			return isSameMinDay && hour === minHour ? normalizedMinDate!.getMinutes() : 0;
		},
		maxMinuteByHour: (hour) => {
			if (disabled) return LAST_MINUTE_OF_HOUR;
			return isSameMaxDay && hour === maxHour ? normalizedMaxDate!.getMinutes() : LAST_MINUTE_OF_HOUR;
		}
	};
}

/**
 * Ограничивает часы и минуты допустимым диапазоном текущего дня.
 */
export function clampTimeForDay(
	day: Date,
	hours: number,
	minutes: number,
	minDate?: Date,
	maxDate?: Date,
	mode: DateTimeInputMode = DATE_TIME_INPUT_MODE_DATE_TIME
): { hours: number; minutes: number } {
	const range = getTimeRangeForDay(day, minDate, maxDate, mode);
	if (range.disabled) {
		return { hours: 0, minutes: 0 };
	}

	const clampedHour = Math.min(Math.max(hours, range.minHour), range.maxHour);
	const minMinute = range.minMinuteByHour(clampedHour);
	const maxMinute = range.maxMinuteByHour(clampedHour);
	const clampedMinute = Math.min(Math.max(minutes, minMinute), maxMinute);

	return {
		hours: clampedHour,
		minutes: clampedMinute
	};
}
