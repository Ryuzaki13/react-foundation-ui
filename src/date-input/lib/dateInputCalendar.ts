import {
	getCalendarPeriod,
	isDateInsideCalendarPeriod,
	type CalendarPeriod,
	type CalendarPeriodOptions,
	type DateRangeInput,
	type NullableDateRange
} from "@ryuzaki13/react-foundation-lib/formatters";

import type { DateInputSelectionMode, DateInputWeekEndDay, DatePickerLevel } from "./types";

export const DATE_PICKER_LEVELS = ["day", "month", "year"] as const satisfies readonly DatePickerLevel[];
export const DATE_INPUT_SELECTION_MODES = ["day", "week", "month", "year"] as const satisfies readonly DateInputSelectionMode[];
export const DATE_INPUT_WEEK_END_DAYS = ["friday", "saturday", "sunday"] as const satisfies readonly DateInputWeekEndDay[];

/**
 * Возвращает календарный вид, который удобнее всего открывать для выбранного размера периода.
 */
export function getDatePickerLevelForSelectionMode(selectionMode: DateInputSelectionMode): DatePickerLevel {
	if (selectionMode === "month") return "month";
	if (selectionMode === "year") return "year";

	return "day";
}

/**
 * Проверяет, разрешён ли календарный вид относительно минимального уровня навигации.
 */
export function isDatePickerLevelAvailable(level: DatePickerLevel, minLevel: DatePickerLevel): boolean {
	return DATE_PICKER_LEVELS.indexOf(level) >= DATE_PICKER_LEVELS.indexOf(minLevel);
}

/**
 * Подбирает вид календаря для режима выбора с учётом ограничения `datePickerLevel`.
 */
export function resolveAvailableDatePickerLevel(selectionMode: DateInputSelectionMode, minLevel: DatePickerLevel): DatePickerLevel {
	const preferredLevel = getDatePickerLevelForSelectionMode(selectionMode);

	return isDatePickerLevelAvailable(preferredLevel, minLevel) ? preferredLevel : minLevel;
}

export interface DateInputPeriodRangeStateOptions {
	readonly date: Date;
	readonly value: DateRangeInput;
	readonly hoveredDate?: Date | null;
	readonly selectsRange?: boolean;
	readonly selectionOptions?: CalendarPeriodOptions;
}

export interface DateInputPeriodRangeState {
	readonly selected: boolean;
	readonly range: boolean;
	readonly rangeStart: boolean;
	readonly rangeEnd: boolean;
}

function isSameCalendarPeriod(left: CalendarPeriod | null, right: CalendarPeriod | null): boolean {
	if (!left || !right) return false;

	return left.start.getTime() === right.start.getTime() && left.end.getTime() === right.end.getTime();
}

function isCalendarPeriodInsideRange(
	period: CalendarPeriod | null,
	startPeriod: CalendarPeriod | null,
	endPeriod: CalendarPeriod | null
): boolean {
	if (!period || !startPeriod || !endPeriod) return false;

	const startTime = Math.min(startPeriod.start.getTime(), endPeriod.start.getTime());
	const endTime = Math.max(startPeriod.end.getTime(), endPeriod.end.getTime());

	return period.start.getTime() >= startTime && period.end.getTime() <= endTime;
}

/**
 * Рассчитывает visual-state ячейки календарного периода для single/range режима.
 */
export function resolveDateInputPeriodRangeState({
	date,
	value,
	hoveredDate,
	selectsRange,
	selectionOptions
}: DateInputPeriodRangeStateOptions): DateInputPeriodRangeState {
	const period = getCalendarPeriod(date, selectionOptions);
	const selectedDate = !selectsRange && value instanceof Date ? value : null;
	const selectedSinglePeriod = getCalendarPeriod(selectedDate, selectionOptions);

	if (!selectsRange || !Array.isArray(value)) {
		return {
			selected: isDateInsideCalendarPeriod(date, selectedSinglePeriod),
			range: false,
			rangeStart: false,
			rangeEnd: false
		};
	}

	const [selectedStartDate, selectedEndDate] = value as NullableDateRange;
	const selectedStartPeriod = getCalendarPeriod(selectedStartDate, selectionOptions);
	const previewEndPeriod = getCalendarPeriod(selectedEndDate ?? (selectedStartDate ? hoveredDate : null), selectionOptions);
	const rangeStart = isSameCalendarPeriod(period, selectedStartPeriod);
	const rangeEnd = isSameCalendarPeriod(period, previewEndPeriod);
	const range = isCalendarPeriodInsideRange(period, selectedStartPeriod, previewEndPeriod);

	return {
		selected: false,
		range: range && !rangeStart && !rangeEnd,
		rangeStart,
		rangeEnd
	};
}
