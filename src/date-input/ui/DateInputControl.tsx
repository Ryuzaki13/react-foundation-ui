import { useCallback, useRef, useState, type KeyboardEvent } from "react";

import { isDateRangeTuple, type NullableDateRange } from "@ryuzaki13/react-foundation-lib/formatters";
import { CalendarDaysIcon } from "lucide-react";

import { InputText } from "../../input";
import { Popover } from "../../popover";
import { RadioGroup } from "../../radio-group";
import uiStyles from "../../ui.module.scss";
import {
	DATE_INPUT_SELECTION_MODES,
	isDatePickerLevelAvailable,
	normalizeDateInputSelectionModes,
	resolveAvailableDatePickerLevel,
	type DateInputSelectionMode,
	type DatePickerLevel
} from "../lib";
import { type DateInputControlProps } from "../lib/dateInputProps";
import { resolveDateInputSelectionModeOptions } from "../lib/resolveDateInputSelectionModeOptions";
import { useDateInput } from "../model";
import { type DateInputCalendarState } from "../model/dateInputCalendarState";

import { CalendarView } from "./CalendarView";
import styles from "./DateInput.module.scss";

export function DateInputControl({
	clearable = false,
	placeholder,
	disabled,
	error,
	onClearError,
	minDate,
	maxDate,
	datePreset,
	datePickerLevel,
	selectionMode: controlledSelectionMode,
	weekEndDay = "sunday",
	allowSelectionModeChange,
	selectionModeOptions,
	selectionModeDatePresets,
	onSelectionModeChange,
	...props
}: DateInputControlProps) {
	const [open, setOpen] = useState(false);

	const configuredSelectionModes = normalizeDateInputSelectionModes(selectionModeOptions, DATE_INPUT_SELECTION_MODES);
	const [uncontrolledSelectionMode, setUncontrolledSelectionMode] = useState<DateInputSelectionMode>(
		() => controlledSelectionMode ?? configuredSelectionModes[0] ?? "day"
	);

	const selectionMode = controlledSelectionMode ?? uncontrolledSelectionMode;
	const activeDatePreset = allowSelectionModeChange ? (selectionModeDatePresets?.[selectionMode] ?? datePreset) : datePreset;

	const minDatePickerLevel = datePickerLevel ?? "day";
	const preferredCalendarType = resolveAvailableDatePickerLevel(selectionMode, minDatePickerLevel);
	const [calendarTypeState, setCalendarTypeState] = useState<DateInputCalendarState>(() => ({
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

	const inputRef = useRef<HTMLInputElement>(null);
	const {
		inputValue,
		setInputValue,
		selectedDate,
		setSelectedDate,
		handleSelect,
		handleInputBlur,
		formatDate,
		clearValue,
		restoreExternalValue
	} = useDateInput({
		...props,
		clearable,
		disabled,
		minDate,
		maxDate,
		datePreset: activeDatePreset,
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

	const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
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
				if (clearable) {
					restoreExternalValue();
					return;
				}

				const initialValue = props.value;
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
	}, [clearable, rangeOnChange, selectedDate, setSelectedDate, setInputValue, formatDate, props.value, restoreExternalValue]);

	const availableSelectionModeOptions = resolveDateInputSelectionModeOptions(selectionModeOptions, selectionMode);
	const showSelectionModeControl = allowSelectionModeChange && availableSelectionModeOptions.length > 1;

	const handleClear = () => {
		if (disabled || !clearable) {
			return;
		}

		clearValue();
		setOpen(false);

		inputRef.current?.focus();
	};

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
				ref={inputRef}
				onClear={clearable ? handleClear : undefined}
				label={props.label}
				description={props.description}
				size={props.size}
				value={inputValue}
				onChange={setInputValue}
				onBlur={handleInputBlur}
				onKeyUp={handleKeyUp}
				placeholder={placeholder}
				disabled={disabled}
				error={error}
				onClearError={onClearError}
				endAdornment={
					<div className={uiStyles.uiToggleButtonContainer}>
						<Popover.Trigger>
							<button
								type="button"
								disabled={disabled}
								data-action="open-calendar"
								aria-label="Открыть календарь"
								aria-haspopup="dialog"
								className={uiStyles.uiToggleButton}>
								<CalendarDaysIcon />
							</button>
						</Popover.Trigger>
					</div>
				}
			/>

			<Popover.Content role="dialog" aria-label={props.selectsRange ? "Выбор диапазона дат" : "Выбор даты"}>
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
							{availableSelectionModeOptions.map((option) => (
								<RadioGroup.Option key={option.id} value={option.id} label={option.label} />
							))}
						</RadioGroup>
					</div>
				)}
			</Popover.Content>
		</Popover>
	);
}
