import { useState } from "react";

import {
	createCalendarDate,
	getCalendarPeriod,
	isCalendarPeriodWithinDateBounds,
	type CalendarPeriodOptions,
	type DateRangeInput
} from "@ryuzaki13/react-foundation-lib/formatters";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { resolveDateInputPeriodRangeState } from "../lib";
import {
	CALENDAR_LAST_HOUR,
	CALENDAR_LAST_MINUTE,
	CALENDAR_LAST_SECOND,
	DATE_INPUT_WEEK_END_SUNDAY,
	DATE_INPUT_SELECTION_MODE_DAY
} from "../lib/dateInputCalendarConstants";

import styles from "./CalendarMonthView.module.scss";

import type { DateInputSelectionMode, DateInputWeekEndDay } from "../lib";

const MONTHS_PER_YEAR = 12;

const monthLabelFormatter = new Intl.DateTimeFormat("ru-RU", { month: "short" });
const monthAriaFormatter = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" });

interface MonthViewProps {
	currentDate: Date;
	value: DateRangeInput;
	onChange: (date: Date) => void;
	minDate?: Date;
	maxDate?: Date;
	selectsRange?: boolean;
	selectsPeriod?: boolean;
	selectionMode?: DateInputSelectionMode;
	weekEndDay?: DateInputWeekEndDay;
}

/**
 * Отображает выбор месяца в календарной семантике без timezone-сдвига.
 */
export function CalendarMonthView({
	currentDate,
	value,
	onChange,
	minDate,
	maxDate,
	selectsRange,
	selectsPeriod,
	selectionMode = DATE_INPUT_SELECTION_MODE_DAY,
	weekEndDay = DATE_INPUT_WEEK_END_SUNDAY
}: MonthViewProps) {
	const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
	const months = Array.from({ length: MONTHS_PER_YEAR }, (_, index) => index);
	const currentYear = currentDate.getFullYear();
	const selectionOptions: CalendarPeriodOptions = {
		selectionMode,
		weekEndDay
	};
	const selectedStartDate = selectsRange && Array.isArray(value) ? value[0] : null;
	const selectedEndDate = selectsRange && Array.isArray(value) ? value[1] : null;

	/**
	 * Возвращает сокращённое имя месяца.
	 */
	const getMonthName = (monthIndex: number) => monthLabelFormatter.format(createCalendarDate(currentYear, monthIndex, 1));

	/**
	 * Проверяет, запрещён ли выбор месяца по ограничениям.
	 */
	const isDisabled = (monthIndex: number) => {
		if (!minDate && !maxDate) return false;

		const monthStart = createCalendarDate(currentYear, monthIndex, 1);
		const monthEnd = createCalendarDate(currentYear, monthIndex + 1, 0, CALENDAR_LAST_HOUR, CALENDAR_LAST_MINUTE, CALENDAR_LAST_SECOND);

		if (selectsPeriod) {
			return !isCalendarPeriodWithinDateBounds(getCalendarPeriod(monthStart, selectionOptions), { minDate, maxDate });
		}

		if (minDate && monthEnd < minDate) return true;
		if (maxDate && monthStart > maxDate) return true;

		return false;
	};

	/**
	 * Обновляет preview-конец диапазона при движении мыши.
	 */
	const handleMonthHover = (date: Date, disabled: boolean) => {
		if (!selectsRange || !selectedStartDate || selectedEndDate || disabled) return;
		setHoveredDate(date);
	};

	/**
	 * Сбрасывает preview незавершённого диапазона при уходе курсора.
	 */
	const handleGridLeave = () => {
		if (!selectedEndDate) {
			setHoveredDate(null);
		}
	};

	return (
		<div className={styles.monthView}>
			<div className={styles.monthsGrid} onMouseLeave={handleGridLeave}>
				{months.map((monthIndex) => {
					const disabled = isDisabled(monthIndex);
					const monthDate = createCalendarDate(currentYear, monthIndex, 1);
					const rangeState = resolveDateInputPeriodRangeState({
						date: monthDate,
						value,
						hoveredDate,
						selectsRange,
						selectionOptions
					});

					return (
						<button
							key={monthIndex}
							type="button"
							onClick={() => !disabled && onChange(monthDate)}
							onMouseEnter={() => handleMonthHover(monthDate, disabled)}
							disabled={disabled}
							data-ui="calendar-month-button"
							data-action="select-calendar-month"
							className={cn(styles.month, {
								[styles.selected]: rangeState.selected,
								[styles.range]: rangeState.range,
								[styles.rangeStart]: rangeState.rangeStart,
								[styles.rangeEnd]: rangeState.rangeEnd,
								[styles.disabled]: disabled
							})}
							aria-label={monthAriaFormatter.format(monthDate)}
							aria-pressed={rangeState.selected || rangeState.range || rangeState.rangeStart || rangeState.rangeEnd}>
							{getMonthName(monthIndex)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
