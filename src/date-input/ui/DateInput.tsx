import { JSX, useCallback, useEffect, useRef, useState } from "react";

import { CalendarDaysIcon } from "lucide-react";

import { isDateRangeTuple, type NullableDateRange } from "@ryuzaki13/react-foundation-lib/formatters";

import { Button } from "../../button";
import { InputText } from "../../input";
import { Popover } from "../../popover";
import { RadioGroup } from "../../radio-group";
import { UiBaseProps } from "../../types";
import {
	areRangeDateValuesEqual,
	areSingleDateValuesEqual,
	DATE_INPUT_SELECTION_MODES,
	isDatePickerLevelAvailable,
	resolveAvailableDatePickerLevel,
	type DateInputSelectionMode,
	type DateInputWeekEndDay,
	type DatePickerLevel
} from "../lib";
import { useDateInput } from "../model";

import { CalendarView } from "./CalendarView";
import styles from "./DateInput.module.scss";

interface BaseDateInputProps {
	error?: string;
	onClearError?: () => void;

	minDate?: Date;
	maxDate?: Date;

	datePreset?: string;
	/**
	 * @deprecated Используйте `datePreset`.
	 */
	dateFormat?: string;

	/**
	 * Минимальный уровень календарной навигации. Размер выбранного периода задаёт `selectionMode`.
	 */
	datePickerLevel?: DatePickerLevel;
	/**
	 * Размер периода, который выбирает поле: день, неделя, месяц или год.
	 */
	selectionMode?: DateInputSelectionMode;
	/**
	 * Последний включённый день недели для `selectionMode="week"`.
	 */
	weekEndDay?: DateInputWeekEndDay;
	/**
	 * Показывает переключатель `selectionMode` под календарём.
	 */
	allowSelectionModeChange?: boolean;
	/**
	 * Ограничивает набор режимов в runtime-переключателе.
	 */
	selectionModeOptions?: readonly DateInputSelectionMode[];
	/**
	 * Сообщает наружу о runtime-смене режима выбора.
	 */
	onSelectionModeChange?: (selectionMode: DateInputSelectionMode) => void;
}

export interface DateSingleInputProps extends BaseDateInputProps, UiBaseProps<Date | null> {
	selectsRange?: false;
}
export interface DateRangeInputProps extends BaseDateInputProps, UiBaseProps<NullableDateRange | null> {
	selectsRange: true;
}

type DateInputProps = DateSingleInputProps | DateRangeInputProps;

interface CalendarTypeState {
	readonly view: DatePickerLevel;
	readonly selectionMode: DateInputSelectionMode;
	readonly minDatePickerLevel: DatePickerLevel;
}

const selectionModeLabels: Record<DateInputSelectionMode, string> = {
	day: "День",
	week: "Неделя",
	month: "Месяц",
	year: "Год"
};

function resolveSelectionModeOptions(
	selectionModeOptions: readonly DateInputSelectionMode[] | undefined,
	selectionMode: DateInputSelectionMode
): readonly DateInputSelectionMode[] {
	const enabledModes = new Set(selectionModeOptions?.length ? selectionModeOptions : DATE_INPUT_SELECTION_MODES);
	enabledModes.add(selectionMode);

	return DATE_INPUT_SELECTION_MODES.filter((mode) => enabledModes.has(mode));
}

function DateInput(props: DateSingleInputProps): JSX.Element;
function DateInput(props: DateRangeInputProps): JSX.Element;
function DateInput({
	placeholder,
	disabled,
	error,
	onClearError,
	minDate,
	maxDate,
	datePickerLevel,
	selectionMode: controlledSelectionMode,
	weekEndDay = "sunday",
	allowSelectionModeChange,
	selectionModeOptions,
	onSelectionModeChange,
	...props
}: DateInputProps) {
	const [open, setOpen] = useState(false);
	const [uncontrolledSelectionMode, setUncontrolledSelectionMode] = useState<DateInputSelectionMode>(controlledSelectionMode ?? "day");
	const selectionMode = controlledSelectionMode ?? uncontrolledSelectionMode;
	const minDatePickerLevel = datePickerLevel ?? "day";
	const preferredCalendarType = resolveAvailableDatePickerLevel(selectionMode, minDatePickerLevel);
	const [calendarTypeState, setCalendarTypeState] = useState<CalendarTypeState>(() => ({
		view: preferredCalendarType,
		selectionMode,
		minDatePickerLevel
	}));
	const calendarType =
		calendarTypeState.selectionMode === selectionMode &&
		calendarTypeState.minDatePickerLevel === minDatePickerLevel &&
		isDatePickerLevelAvailable(calendarTypeState.view, minDatePickerLevel)
			? calendarTypeState.view
			: preferredCalendarType;

	const initialDateRef = useRef(props.value);
	const dateInputValueOptions = {
		selectionMode,
		weekEndDay
	};

	const { inputValue, setInputValue, selectedDate, setSelectedDate, handleSelect, formatDate, parseDate } = useDateInput({
		...props,
		datePickerLevel: minDatePickerLevel,
		selectionMode,
		weekEndDay
	});
	const rangeOnChange = props.selectsRange ? props.onChange : undefined;

	const updateCalendarType = useCallback(
		(calendarType: DatePickerLevel) => {
			if (isDatePickerLevelAvailable(calendarType, minDatePickerLevel)) {
				setCalendarTypeState({
					view: calendarType,
					selectionMode,
					minDatePickerLevel
				});
			}
		},
		[minDatePickerLevel, selectionMode]
	);

	useEffect(() => {
		initialDateRef.current = props.value;
	}, [props.value]);

	const handleInputBlur = () => {
		if (inputValue) {
			const parsedDate = parseDate(inputValue);
			if (parsedDate) {
				setInputValue(formatDate(parsedDate));

				if (props.selectsRange && isDateRangeTuple(parsedDate)) {
					const selectedRange = isDateRangeTuple(selectedDate) ? selectedDate : null;

					if (areRangeDateValuesEqual(parsedDate, selectedRange, dateInputValueOptions)) return;

					setSelectedDate(parsedDate);
					props.onChange(parsedDate);
				} else if (!props.selectsRange && parsedDate instanceof Date) {
					const selectedSingleDate = selectedDate instanceof Date ? selectedDate : null;

					if (areSingleDateValuesEqual(parsedDate, selectedSingleDate, dateInputValueOptions)) return;

					setSelectedDate(parsedDate);
					props.onChange(parsedDate);
				}
			}
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			event.preventDefault();
			handleInputBlur();
		}
	};

	const handleCalendarDateSelect = useCallback(
		(value: Date | NullableDateRange) => {
			if (handleSelect(value)) {
				setOpen(false);
			}
		},
		[handleSelect]
	);

	const handleSelectionModeChange = useCallback(
		(nextSelectionMode: DateInputSelectionMode) => {
			if (controlledSelectionMode === undefined) {
				setUncontrolledSelectionMode(nextSelectionMode);
			}

			onSelectionModeChange?.(nextSelectionMode);
			setCalendarTypeState({
				view: resolveAvailableDatePickerLevel(nextSelectionMode, minDatePickerLevel),
				selectionMode: nextSelectionMode,
				minDatePickerLevel
			});
		},
		[controlledSelectionMode, minDatePickerLevel, onSelectionModeChange]
	);

	const handleCancel = useCallback(() => {
		// Восстановить исходное состояние при отмене
		if (rangeOnChange) {
			const [, selectedEndDate] = isDateRangeTuple(selectedDate) ? selectedDate : [null, null];

			if (!selectedEndDate) {
				// Восстановить исходное состояние диапазона
				const initialValue = initialDateRef.current;
				const initialRange = Array.isArray(initialValue) ? initialValue : null;
				const initialStart = initialRange?.[0] ?? null;
				const initialEnd = initialRange?.[1] ?? null;

				if (initialStart && initialEnd) {
					const initialSelectedDate: NullableDateRange = [initialStart, initialEnd];
					setSelectedDate(initialSelectedDate);
					setInputValue(formatDate(initialSelectedDate));

					rangeOnChange(initialSelectedDate);
				} else {
					// Если начального диапазона нет, очистить всё
					setSelectedDate([null, null]);
					setInputValue("");

					rangeOnChange([null, null]);
				}
			}
		}
	}, [rangeOnChange, selectedDate, setSelectedDate, setInputValue, formatDate]);

	const availableSelectionModes = resolveSelectionModeOptions(selectionModeOptions, selectionMode);
	const showSelectionModeControl = allowSelectionModeChange && availableSelectionModes.length > 1;

	return (
		<Popover
			open={open}
			onOpenChange={(value) => {
				setOpen(value);
				if (!value) {
					handleCancel();
				}
			}}>
			<InputText
				label={props.label}
				description={props.description}
				size={props.size}
				value={inputValue}
				onChange={setInputValue}
				onBlur={handleInputBlur}
				onKeyUp={handleKeyDown}
				placeholder={placeholder}
				disabled={disabled}
				error={error}
				onClearError={onClearError}
				endAdornmentWidth="var(--control-height)"
				endAdornment={
					<Popover.Trigger>
						<Button
							variant="transparent"
							disabled={disabled}
							className={styles.calendarButton}
							icon={<CalendarDaysIcon />}
							aria-label="Открыть календарь"
						/>
					</Popover.Trigger>
				}
			/>

			<Popover.Content background="primary">
				<CalendarView
					view={calendarType}
					datePickerLevel={minDatePickerLevel}
					selectionMode={selectionMode}
					weekEndDay={weekEndDay}
					onViewChange={updateCalendarType}
					value={selectedDate ?? null}
					onChange={handleCalendarDateSelect}
					minDate={minDate}
					maxDate={maxDate}
					selectsRange={!!props.selectsRange}
				/>
				{showSelectionModeControl && (
					<div className={styles.selectionModeControl}>
						<RadioGroup<DateInputSelectionMode>
							value={selectionMode}
							onChange={handleSelectionModeChange}
							noWrap
							aria-label="Режим выбора даты">
							{availableSelectionModes.map((mode) => (
								<RadioGroup.Option key={mode} value={mode} label={selectionModeLabels[mode]} />
							))}
						</RadioGroup>
					</div>
				)}
			</Popover.Content>
		</Popover>
	);
}

export function SingleDateInput(props: Omit<DateSingleInputProps, "selectsRange">) {
	return <DateInput {...props} />;
}

export function RangeDateInput(props: Omit<DateRangeInputProps, "selectsRange">) {
	return <DateInput {...props} selectsRange={true} />;
}
