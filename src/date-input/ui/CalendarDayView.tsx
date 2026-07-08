import { useState } from "react";

import {
	createCalendarDate,
	getCalendarPeriod,
	getStartOfDay,
	isCalendarPeriodWithinDateBounds,
	isDateInsideCalendarPeriod,
	isSameCalendarDay,
	type CalendarPeriodOptions,
	type DateRangeInput
} from "@ryuzaki13/react-foundation-lib/formatters";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "./CalendarDayView.module.scss";

import type { DateInputSelectionMode, DateInputWeekEndDay } from "../lib";

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const dayLabelFormatter = new Intl.DateTimeFormat("ru-RU", {
	weekday: "long",
	year: "numeric",
	month: "long",
	day: "numeric"
});

interface DayViewProps {
	now: Date;
	currentDate: Date;
	value: DateRangeInput;
	onChange: (date: Date) => void;
	minDate?: Date;
	maxDate?: Date;
	selectsRange?: boolean;
	selectionMode?: DateInputSelectionMode;
	weekEndDay?: DateInputWeekEndDay;
}

/**
 * Отображает сетку дней месяца в календарной семантике без timezone-сдвига.
 */
export const CalendarDayView: React.FC<DayViewProps> = ({
	now,
	currentDate,
	value,
	onChange,
	minDate,
	maxDate,
	selectsRange,
	selectionMode = "day",
	weekEndDay = "sunday"
}) => {
	const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
	const selectionOptions: CalendarPeriodOptions = {
		selectionMode,
		weekEndDay
	};

	/**
	 * Генерирует недели для текущего месяца с учётом дней соседних месяцев.
	 */
	const generateCalendarDays = () => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();

		const firstDay = createCalendarDate(year, month, 1);
		const lastDay = createCalendarDate(year, month + 1, 0);
		const prevMonthDays = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
		const nextMonthDays = 6 * 7 - (prevMonthDays + lastDay.getDate());

		const days: Date[] = [];
		const prevMonthLastDay = createCalendarDate(year, month, 0).getDate();

		for (let index = prevMonthDays; index > 0; index -= 1) {
			days.push(createCalendarDate(year, month - 1, prevMonthLastDay - index + 1));
		}

		for (let day = 1; day <= lastDay.getDate(); day += 1) {
			days.push(createCalendarDate(year, month, day));
		}

		for (let day = 1; day <= nextMonthDays; day += 1) {
			days.push(createCalendarDate(year, month + 1, day));
		}

		const weeks: Date[][] = [];
		for (let index = 0; index < days.length; index += 7) {
			weeks.push(days.slice(index, index + 7));
		}

		return weeks;
	};

	const weeks = generateCalendarDays();
	const selectedStartDate = selectsRange && Array.isArray(value) ? value[0] : null;
	const selectedEndDate = selectsRange && Array.isArray(value) ? value[1] : null;
	const selectedDate = !selectsRange ? (value as Date | null) : null;
	const selectedSinglePeriod = getCalendarPeriod(selectedDate, selectionOptions);
	const hoveredPeriod = getCalendarPeriod(hoveredDate, selectionOptions);
	const previewEndDate = selectedEndDate ?? (selectedStartDate ? (hoveredPeriod?.end ?? null) : null);

	/**
	 * Проверяет, лежит ли день внутри выбранного или preview-диапазона.
	 */
	const isInRange = (date: Date) => {
		if (!selectsRange || !selectedStartDate || !previewEndDate) return false;

		const dateMs = getStartOfDay(date).getTime();
		const startMs = selectedStartDate.getTime();
		const endMs = previewEndDate.getTime();

		return dateMs >= Math.min(startMs, endMs) && dateMs <= Math.max(startMs, endMs);
	};

	/**
	 * Проверяет ограничения на выбор даты.
	 */
	const isDisabled = (date: Date) => {
		return !isCalendarPeriodWithinDateBounds(getCalendarPeriod(date, selectionOptions), { minDate, maxDate });
	};

	/**
	 * Обновляет preview-конец диапазона при движении мыши.
	 */
	const handleDayHover = (date: Date, disabled: boolean) => {
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
		<div className={styles.dayView}>
			<div className={styles.weekdays}>
				{weekDays.map((day) => (
					<div key={day} className={styles.weekday}>
						{day}
					</div>
				))}
			</div>

			<div className={styles.daysGrid} onMouseLeave={handleGridLeave}>
				{weeks.map((week, weekIndex) => (
					<div key={weekIndex} className={styles.week}>
						{week.map((day, dayIndex) => {
							const isCurrentMonth = day.getMonth() === currentDate.getMonth();
							const isSelected = isDateInsideCalendarPeriod(day, selectedSinglePeriod);
							const isRange = isInRange(day);
							const isStart = isSameCalendarDay(day, selectedStartDate);
							const isEnd = isSameCalendarDay(day, previewEndDate);
							const isNow = isSameCalendarDay(day, now);
							const disabled = isDisabled(day);

							return (
								<button
									key={`${weekIndex}-${dayIndex}`}
									type="button"
									onClick={() => !disabled && onChange(day)}
									onMouseEnter={() => handleDayHover(day, disabled)}
									disabled={disabled}
									data-ui="calendar-day-button"
									data-action="select-calendar-day"
									className={cn(styles.day, {
										[styles.outsideMonth]: !isCurrentMonth,
										[styles.selected]: isSelected,
										[styles.range]: isRange && !isStart && !isEnd,
										[styles.rangeStart]: isStart,
										[styles.rangeEnd]: isEnd,
										[styles.disabled]: disabled,
										[styles.weekend]: dayIndex > 4,
										[styles.now]: isNow
									})}
									aria-label={dayLabelFormatter.format(day)}
									aria-pressed={isSelected || isRange || isStart || isEnd}>
									{day.getDate()}
								</button>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);
};
