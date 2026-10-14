import {
	getCalendarPeriod,
	isCalendarPeriodWithinDateBounds,
	isDateRangeTuple,
	type CalendarPeriodDateBounds,
	type CalendarPeriodOptions,
	type NullableDateRange
} from "@ryuzaki13/react-foundation-lib/formatters";

/**
 * Текстовый ввод проходит те же включительные границы полного периода, что
 * и календарь. У незавершённого range проверяется только заполненный конец;
 * недопустимый второй конец не должен незаметно публиковать весь диапазон.
 * Helper остаётся внутренней частью date-input, без нового public API.
 */
export function isDateInputValueWithinDateBounds(
	value: Date | NullableDateRange,
	options: CalendarPeriodOptions,
	bounds: CalendarPeriodDateBounds
): boolean {
	if (!bounds.minDate && !bounds.maxDate) return true;
	const acceptsDate = (date: Date | null) => date === null || isCalendarPeriodWithinDateBounds(getCalendarPeriod(date, options), bounds);
	return isDateRangeTuple(value) ? acceptsDate(value[0]) && acceptsDate(value[1]) : acceptsDate(value);
}
