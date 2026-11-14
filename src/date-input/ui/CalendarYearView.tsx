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
	DATE_INPUT_SELECTION_MODE_DAY,
	CALENDAR_YEAR_PAGE_SIZE
} from "../lib/dateInputCalendarConstants";

import styles from "./CalendarYearView.module.scss";

import type { DateInputSelectionMode, DateInputWeekEndDay } from "../lib";

const LAST_MONTH_INDEX = 11;
const LAST_DAY_OF_YEAR = 31;

interface YearViewProps {
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
 * Отображает выбор года в календарной семантике без timezone-сдвига.
 */
export function CalendarYearView({
	currentDate,
	value,
	onChange,
	minDate,
	maxDate,
	selectsRange,
	selectsPeriod,
	selectionMode = DATE_INPUT_SELECTION_MODE_DAY,
	weekEndDay = DATE_INPUT_WEEK_END_SUNDAY
}: YearViewProps) {
	const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
	const startYear = Math.floor(currentDate.getFullYear() / CALENDAR_YEAR_PAGE_SIZE) * CALENDAR_YEAR_PAGE_SIZE;
	const years = Array.from({ length: CALENDAR_YEAR_PAGE_SIZE }, (_, index) => startYear + index);
	const selectionOptions: CalendarPeriodOptions = {
		selectionMode,
		weekEndDay
	};
	const selectedStartDate = selectsRange && Array.isArray(value) ? value[0] : null;
	const selectedEndDate = selectsRange && Array.isArray(value) ? value[1] : null;

	/**
	 * Проверяет ограничения на выбор года.
	 */
	const isDisabled = (year: number) => {
		if (!minDate && !maxDate) return false;

		const yearStart = createCalendarDate(year, 0, 1);
		const yearEnd = createCalendarDate(
			year,
			LAST_MONTH_INDEX,
			LAST_DAY_OF_YEAR,
			CALENDAR_LAST_HOUR,
			CALENDAR_LAST_MINUTE,
			CALENDAR_LAST_SECOND
		);

		if (selectsPeriod) {
			return !isCalendarPeriodWithinDateBounds(getCalendarPeriod(yearStart, selectionOptions), { minDate, maxDate });
		}

		if (minDate && yearEnd < minDate) return true;
		if (maxDate && yearStart > maxDate) return true;

		return false;
	};

	/**
	 * Обновляет preview-конец диапазона при движении мыши.
	 */
	const handleYearHover = (date: Date, disabled: boolean) => {
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
		<div className={styles.yearView}>
			<div className={styles.yearsGrid} onMouseLeave={handleGridLeave}>
				{years.map((year) => {
					const disabled = isDisabled(year);
					const yearDate = createCalendarDate(year, 0, 1);
					const rangeState = resolveDateInputPeriodRangeState({
						date: yearDate,
						value,
						hoveredDate,
						selectsRange,
						selectionOptions
					});

					return (
						<button
							key={year}
							type="button"
							onClick={() => !disabled && onChange(yearDate)}
							onMouseEnter={() => handleYearHover(yearDate, disabled)}
							disabled={disabled}
							data-ui="calendar-year-button"
							data-action="select-calendar-year"
							className={cn(styles.year, {
								[styles.selected]: rangeState.selected,
								[styles.range]: rangeState.range,
								[styles.rangeStart]: rangeState.rangeStart,
								[styles.rangeEnd]: rangeState.rangeEnd,
								[styles.disabled]: disabled
							})}
							aria-label={year.toString()}
							aria-pressed={rangeState.selected || rangeState.range || rangeState.rangeStart || rangeState.rangeEnd}>
							{year}
						</button>
					);
				})}
			</div>
		</div>
	);
}
