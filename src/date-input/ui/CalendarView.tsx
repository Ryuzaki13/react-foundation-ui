import { useState } from "react";

import {
	addCalendarMonths,
	addCalendarYears,
	getCalendarPeriod,
	getStartOfDay,
	isCalendarPeriodWithinDateBounds,
	isDateRangeTuple,
	type CalendarPeriodOptions,
	type NullableDateRange
} from "@ryuzaki13/react-foundation-lib/formatters";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "../../button";
import { isDatePickerLevelAvailable, type CalendarType, type DateInputSelectionMode, type DateInputWeekEndDay } from "../lib";

import { CalendarDayView } from "./CalendarDayView";
import { CalendarMonthView } from "./CalendarMonthView";
import styles from "./CalendarView.module.scss";
import { CalendarYearView } from "./CalendarYearView";

interface BaseCalendarViewProps {
	view: CalendarType;
	datePickerLevel: CalendarType;
	selectionMode?: DateInputSelectionMode;
	weekEndDay?: DateInputWeekEndDay;
	onViewChange: (view: CalendarType) => void;
}

interface CalendarViewProps extends BaseCalendarViewProps {
	selectsRange?: boolean;
	value: Date | NullableDateRange | null;
	onChange: (date: Date | NullableDateRange) => void;
	minDate?: Date;
	maxDate?: Date;
	currentDate?: Date;
	onCurrentDateChange?: (date: Date) => void;
}

/** Возвращает дату, к периоду которой должен перейти uncontrolled-календарь после внешней смены value. */
function resolveValueCurrentDate(value: Date | NullableDateRange | null, selectsRange?: boolean): Date | undefined {
	if (selectsRange && isDateRangeTuple(value) && value[0] instanceof Date) {
		return value[0];
	}

	if (!selectsRange && value instanceof Date) {
		return value;
	}

	return undefined;
}

/**
 * Отображает календарь выбора даты в календарной семантике без timezone-сдвига.
 */
export function CalendarView({
	view,
	datePickerLevel,
	selectionMode = "day",
	weekEndDay = "sunday",
	onViewChange,
	...props
}: CalendarViewProps) {
	const [dateNow] = useState(() => getStartOfDay(new Date()));
	const valueCurrentDate = resolveValueCurrentDate(props.value, props.selectsRange);
	const valueCurrentDateTime = valueCurrentDate?.getTime() ?? null;
	const [uncontrolledState, setUncontrolledState] = useState(() => ({
		sourceValueTime: valueCurrentDateTime,
		currentDate: valueCurrentDate ?? getStartOfDay(new Date())
	}));
	const uncontrolledCurrentDate =
		valueCurrentDate && uncontrolledState.sourceValueTime !== valueCurrentDateTime ? valueCurrentDate : uncontrolledState.currentDate;
	const currentDate = props.currentDate ?? uncontrolledCurrentDate;
	const selectionOptions: CalendarPeriodOptions = {
		selectionMode,
		weekEndDay
	};

	/**
	 * Обновляет видимую календарную дату в управляемом или неуправляемом режиме.
	 */
	const setCurrentDate = (value: Date | ((prevValue: Date) => Date)) => {
		const nextValue = typeof value === "function" ? value(currentDate) : value;

		if (props.currentDate === undefined) {
			setUncontrolledState({
				sourceValueTime: valueCurrentDateTime,
				currentDate: nextValue
			});
		}

		props.onCurrentDateChange?.(nextValue);
	};

	/**
	 * Переключает видимую область календаря назад.
	 */
	const goToPrevious = () => {
		if (view === "day") {
			setCurrentDate((prev) => addCalendarMonths(prev, -1));
			return;
		}

		if (view === "month") {
			setCurrentDate((prev) => addCalendarYears(prev, -1));
			return;
		}

		setCurrentDate((prev) => addCalendarYears(prev, -12));
	};

	/**
	 * Переключает видимую область календаря вперёд.
	 */
	const goToNext = () => {
		if (view === "day") {
			setCurrentDate((prev) => addCalendarMonths(prev, 1));
			return;
		}

		if (view === "month") {
			setCurrentDate((prev) => addCalendarYears(prev, 1));
			return;
		}

		setCurrentDate((prev) => addCalendarYears(prev, 12));
	};

	/**
	 * Возвращает заголовок текущего календарного вида.
	 */
	const renderHeader = () => {
		let title = "";
		if (view === "day") {
			title = currentDate.toLocaleDateString("ru-RU", {
				month: "long",
				year: "numeric"
			});
		} else if (view === "month") {
			title = currentDate.getFullYear().toString();
		} else {
			const startYear = Math.floor(currentDate.getFullYear() / 12) * 12;
			const endYear = startYear + 11;
			title = `${startYear} - ${endYear}`;
		}

		return (
			<div className={styles.calendarHeader}>
				<Button
					icon={<ChevronLeft />}
					onClick={goToPrevious}
					variant="ghost"
					aria-label="Предыдущий"
					data-action="calendar-previous"
				/>

				<Button
					onClick={() => {
						if (view === "day") onViewChange("month");
						else if (view === "month") onViewChange("year");
					}}
					variant="ghost"
					className="flex1"
					data-ui="calendar-view-switch-button"
					data-action="calendar-switch-view">
					{title}
				</Button>

				<Button
					icon={<ChevronRight />}
					onClick={goToNext}
					variant="ghost"
					aria-label="Следующий"
					data-ui="calendar-next-button"
					data-action="calendar-next"
				/>
			</div>
		);
	};

	/**
	 * Отрисовывает активный режим календаря.
	 */
	const renderView = () => {
		const handleDateSelect = (date: Date) => {
			const selectedPeriod = getCalendarPeriod(date, selectionOptions);
			if (!selectedPeriod || !isCalendarPeriodWithinDateBounds(selectedPeriod, { minDate: props.minDate, maxDate: props.maxDate }))
				return;

			if (props.selectsRange) {
				let selectedStartDate: Date | null = null;
				let selectedEndDate: Date | null = null;

				if (Array.isArray(props.value)) {
					[selectedStartDate, selectedEndDate] = props.value;
				}

				if (!selectedStartDate || selectedEndDate) {
					props.onChange([selectedPeriod.start, null]);
					return;
				}

				const startPeriod = getCalendarPeriod(selectedStartDate, selectionOptions);
				if (!startPeriod) return;

				if (selectedPeriod.start < startPeriod.start) {
					props.onChange([selectedPeriod.start, startPeriod.end]);
					return;
				}

				props.onChange([startPeriod.start, selectedPeriod.end]);
				return;
			}

			props.onChange(selectedPeriod.start);
		};

		const handleMonthSelect = (date: Date) => {
			setCurrentDate(date);

			if (selectionMode === "month" || !isDatePickerLevelAvailable("day", datePickerLevel)) {
				handleDateSelect(date);
				return;
			}

			onViewChange("day");
		};

		const handleYearSelect = (date: Date) => {
			setCurrentDate(date);

			if (selectionMode === "year" || !isDatePickerLevelAvailable("month", datePickerLevel)) {
				handleDateSelect(date);
				return;
			}

			onViewChange("month");
		};

		switch (view) {
			case "day":
				return (
					<CalendarDayView
						now={dateNow}
						currentDate={currentDate}
						value={props.value}
						onChange={handleDateSelect}
						minDate={props.minDate}
						maxDate={props.maxDate}
						selectsRange={props.selectsRange}
						selectionMode={selectionMode}
						weekEndDay={weekEndDay}
					/>
				);
			case "month":
				return (
					<CalendarMonthView
						currentDate={currentDate}
						value={props.value}
						onChange={handleMonthSelect}
						minDate={props.minDate}
						maxDate={props.maxDate}
						selectsRange={props.selectsRange}
						selectsPeriod={selectionMode === "month" || !isDatePickerLevelAvailable("day", datePickerLevel)}
						selectionMode={selectionMode}
						weekEndDay={weekEndDay}
					/>
				);
			case "year":
				return (
					<CalendarYearView
						currentDate={currentDate}
						value={props.value}
						onChange={handleYearSelect}
						minDate={props.minDate}
						maxDate={props.maxDate}
						selectsRange={props.selectsRange}
						selectsPeriod={selectionMode === "year" || !isDatePickerLevelAvailable("month", datePickerLevel)}
						selectionMode={selectionMode}
						weekEndDay={weekEndDay}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className={styles.calendarView}>
			{renderHeader()}
			{renderView()}
		</div>
	);
}
