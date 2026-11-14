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
import { UI_APPEARANCE_GHOST } from "../../uiSchemeConstants";
import { isDatePickerLevelAvailable, type CalendarType, type DateInputSelectionMode, type DateInputWeekEndDay } from "../lib";
import {
	DATE_INPUT_WEEK_END_SUNDAY,
	DATE_INPUT_SELECTION_MODE_DAY,
	DATE_INPUT_SELECTION_MODE_MONTH,
	DATE_INPUT_SELECTION_MODE_YEAR,
	DATE_PICKER_LEVEL_DAY,
	DATE_PICKER_LEVEL_MONTH,
	DATE_PICKER_LEVEL_YEAR,
	CALENDAR_YEAR_PAGE_SIZE
} from "../lib/dateInputCalendarConstants";

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
	selectionMode = DATE_INPUT_SELECTION_MODE_DAY,
	weekEndDay = DATE_INPUT_WEEK_END_SUNDAY,
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
		if (view === DATE_PICKER_LEVEL_DAY) {
			setCurrentDate((prev) => addCalendarMonths(prev, -1));
			return;
		}

		if (view === DATE_PICKER_LEVEL_MONTH) {
			setCurrentDate((prev) => addCalendarYears(prev, -1));
			return;
		}

		setCurrentDate((prev) => addCalendarYears(prev, -CALENDAR_YEAR_PAGE_SIZE));
	};

	/**
	 * Переключает видимую область календаря вперёд.
	 */
	const goToNext = () => {
		if (view === DATE_PICKER_LEVEL_DAY) {
			setCurrentDate((prev) => addCalendarMonths(prev, 1));
			return;
		}

		if (view === DATE_PICKER_LEVEL_MONTH) {
			setCurrentDate((prev) => addCalendarYears(prev, 1));
			return;
		}

		setCurrentDate((prev) => addCalendarYears(prev, CALENDAR_YEAR_PAGE_SIZE));
	};

	/**
	 * Возвращает заголовок текущего календарного вида.
	 */
	const renderHeader = () => {
		let title = "";
		let previousLabel = "Предыдущий период лет";
		let nextLabel = "Следующий период лет";
		if (view === DATE_PICKER_LEVEL_DAY) {
			title = currentDate.toLocaleDateString("ru-RU", {
				month: "long",
				year: "numeric"
			});
			previousLabel = "Предыдущий месяц";
			nextLabel = "Следующий месяц";
		} else if (view === DATE_PICKER_LEVEL_MONTH) {
			title = currentDate.getFullYear().toString();
			previousLabel = "Предыдущий год";
			nextLabel = "Следующий год";
		} else {
			const startYear = Math.floor(currentDate.getFullYear() / CALENDAR_YEAR_PAGE_SIZE) * CALENDAR_YEAR_PAGE_SIZE;
			const endYear = startYear + CALENDAR_YEAR_PAGE_SIZE - 1;
			title = `${startYear} - ${endYear}`;
		}

		return (
			<div className={styles.calendarHeader}>
				<Button
					icon={<ChevronLeft />}
					onClick={goToPrevious}
					appearance={UI_APPEARANCE_GHOST}
					aria-label={previousLabel}
					data-action="calendar-previous"
				/>

				<Button
					onClick={() => {
						if (view === DATE_PICKER_LEVEL_DAY) onViewChange(DATE_PICKER_LEVEL_MONTH);
						else if (view === DATE_PICKER_LEVEL_MONTH) onViewChange(DATE_PICKER_LEVEL_YEAR);
					}}
					appearance={UI_APPEARANCE_GHOST}
					className="flex1"
					aria-label={
						view === DATE_PICKER_LEVEL_DAY
							? `Выбрать месяц, сейчас ${title}`
							: view === DATE_PICKER_LEVEL_MONTH
								? `Выбрать год, сейчас ${title}`
								: title
					}
					aria-disabled={view === DATE_PICKER_LEVEL_YEAR || undefined}
					data-ui="calendar-view-switch-button"
					data-action="calendar-switch-view">
					{title}
				</Button>

				<Button
					icon={<ChevronRight />}
					onClick={goToNext}
					appearance={UI_APPEARANCE_GHOST}
					aria-label={nextLabel}
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

			if (selectionMode === DATE_INPUT_SELECTION_MODE_MONTH || !isDatePickerLevelAvailable(DATE_PICKER_LEVEL_DAY, datePickerLevel)) {
				handleDateSelect(date);
				return;
			}

			onViewChange(DATE_PICKER_LEVEL_DAY);
		};

		const handleYearSelect = (date: Date) => {
			setCurrentDate(date);

			if (selectionMode === DATE_INPUT_SELECTION_MODE_YEAR || !isDatePickerLevelAvailable(DATE_PICKER_LEVEL_MONTH, datePickerLevel)) {
				handleDateSelect(date);
				return;
			}

			onViewChange(DATE_PICKER_LEVEL_MONTH);
		};

		switch (view) {
			case DATE_PICKER_LEVEL_DAY:
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
			case DATE_PICKER_LEVEL_MONTH:
				return (
					<CalendarMonthView
						currentDate={currentDate}
						value={props.value}
						onChange={handleMonthSelect}
						minDate={props.minDate}
						maxDate={props.maxDate}
						selectsRange={props.selectsRange}
						selectsPeriod={
							selectionMode === DATE_INPUT_SELECTION_MODE_MONTH ||
							!isDatePickerLevelAvailable(DATE_PICKER_LEVEL_DAY, datePickerLevel)
						}
						selectionMode={selectionMode}
						weekEndDay={weekEndDay}
					/>
				);
			case DATE_PICKER_LEVEL_YEAR:
				return (
					<CalendarYearView
						currentDate={currentDate}
						value={props.value}
						onChange={handleYearSelect}
						minDate={props.minDate}
						maxDate={props.maxDate}
						selectsRange={props.selectsRange}
						selectsPeriod={
							selectionMode === DATE_INPUT_SELECTION_MODE_YEAR ||
							!isDatePickerLevelAvailable(DATE_PICKER_LEVEL_MONTH, datePickerLevel)
						}
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
