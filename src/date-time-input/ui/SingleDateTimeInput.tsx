import { JSX, useEffect, useEffectEvent, useMemo, useState } from "react";

import { CalendarDaysIcon, Clock3Icon } from "lucide-react";

import { getStartOfDay, isDateRangeTuple, NullableDateRange } from "@ryuzaki13/react-foundation-lib/formatters";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { Button } from "../../button";
import { CalendarView } from "../../date-input/ui";
import { InputControl, InputUI, useInputFieldIds } from "../../input";
import { Popover } from "../../popover";
import { UiBaseProps } from "../../types";
import uiStyles from "../../ui.module.scss";
import {
	clampTimeForDay,
	isDateTimeWithinRange,
	mergeDateWithTime,
	mergeTimeIntoDate,
	normalizeDateTimeValue,
	resolvePickerBaseDate
} from "../lib";
import { useDateTimeSegments } from "../model";

import styles from "./SingleDateTimeInput.module.scss";
import { TimePanel } from "./TimePanel";

import type { DateTimeInputMode } from "../lib";

interface BaseSingleDateTimeInputProps {
	error?: string;
	onClearError?: () => void;
	minDate?: Date;
	maxDate?: Date;
	timePanelPlacement?: "bottom" | "right";
	mode?: DateTimeInputMode;
}

export interface SingleDateTimeInputProps extends BaseSingleDateTimeInputProps, UiBaseProps<Date | null> {}

/**
 * Поле выбора даты-времени со строгой сегментной маской и popover-пикером.
 */
export function SingleDateTimeInput({
	value,
	onChange,
	label,
	description,
	placeholder,
	disabled,
	size,
	error,
	onClearError,
	minDate,
	maxDate,
	timePanelPlacement = "right",
	mode = "date-time"
}: SingleDateTimeInputProps): JSX.Element {
	const normalizedValue = normalizeDateTimeValue(value, mode);
	const normalizedValueTime = normalizedValue?.getTime() ?? null;

	const fallbackPickerDate = useMemo(() => getStartOfDay(new Date()), []);

	const [open, setOpen] = useState(false);
	const [draftValue, setDraftValue] = useState<Date | null>(normalizedValue ?? null);
	const [calendarView, setCalendarView] = useState<"day" | "month" | "year">("day");
	const [pickerDate, setPickerDate] = useState<Date>(() => resolvePickerBaseDate(normalizedValue, fallbackPickerDate, mode));

	const { controlId, labelId, descriptionId, errorId, describedBy } = useInputFieldIds({
		hasLabel: label !== undefined && label !== null,
		hasDescription: !!description,
		hasError: !!error
	});

	const syncDraftDate = useEffectEvent((date: Date | null) => setDraftValue(date));
	const syncPickerDate = useEffectEvent((date: Date) => setPickerDate(date));

	useEffect(() => {
		if (!open) {
			syncDraftDate(normalizedValue ?? null);
		}

		if (normalizedValue) {
			syncPickerDate(normalizedValue);
		}
	}, [normalizedValue, normalizedValueTime, open]);

	useEffect(() => {
		if (!normalizedValue) return;
		syncPickerDate(normalizedValue);
	}, [normalizedValue, normalizedValueTime]);

	const {
		segments,
		segmentValues,
		registerRef,
		handleInput,
		handleKeyDown,
		handleFocus,
		handleContainerFocus,
		handleContainerBlur,
		focusFirstEmpty
	} = useDateTimeSegments({
		value: normalizedValue,
		onChange,
		onClearError,
		disabled,
		minDate,
		maxDate,
		mode
	});

	/**
	 * Выбирает дату в календаре и сохраняет текущее время.
	 */
	const handleCalendarSelect = (nextDate: Date | NullableDateRange) => {
		if (mode === "time" || isDateRangeTuple(nextDate) || disabled) return;

		const baseValue = draftValue ?? normalizedValue ?? pickerDate;
		const mergedDate = mergeDateWithTime(nextDate, baseValue);
		const { hours, minutes } = clampTimeForDay(nextDate, mergedDate.getHours(), mergedDate.getMinutes(), minDate, maxDate, mode);
		const nextValue = mergeTimeIntoDate(nextDate, hours, minutes);

		if (!isDateTimeWithinRange(nextValue, minDate, maxDate, mode)) return;

		onClearError?.();
		setDraftValue(nextValue);
		setPickerDate(nextValue);
	};

	/**
	 * Выбирает время для текущего рабочего дня picker-а.
	 */
	const handleTimeChange = (hours: number, minutes: number) => {
		if (disabled) return;

		const baseDate = draftValue ?? normalizedValue ?? pickerDate;
		const clampedTime = clampTimeForDay(baseDate, hours, minutes, minDate, maxDate, mode);
		const nextValue = mergeTimeIntoDate(baseDate, clampedTime.hours, clampedTime.minutes, mode);

		if (!isDateTimeWithinRange(nextValue, minDate, maxDate, mode)) return;

		onClearError?.();
		setDraftValue(nextValue);
		setPickerDate(nextValue);
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			setDraftValue(normalizedValue ?? null);
			setPickerDate(resolvePickerBaseDate(normalizedValue, fallbackPickerDate, mode));
		}

		setOpen(nextOpen);
	};

	const handlePopoverClose = () => {
		const prevTime = normalizedValue?.getTime() ?? null;
		const draftTime = draftValue?.getTime() ?? null;

		if (prevTime !== draftTime) {
			onChange(draftValue);
		}
	};

	const panelPlacementClass = timePanelPlacement === "right" ? styles.timePanelPaneRight : styles.timePanelPaneBottom;
	const buttonAriaLabel = mode === "time" ? "Открыть выбор времени" : "Открыть календарь даты и времени";
	const inputPlaceholder = placeholder ?? (mode === "time" ? "чч:мм" : "дд.мм.гггг чч:мм");
	const pickerValue = draftValue ?? normalizedValue ?? pickerDate;

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<InputUI
				label={label}
				description={description}
				disabled={disabled}
				size={size}
				error={error}
				controlId={controlId}
				labelId={labelId}
				descriptionId={descriptionId}
				errorId={errorId}>
				<InputControl
					endAdornmentWidth="var(--control-height)"
					endAdornment={
						<Popover.Trigger>
							<Button
								variant="transparent"
								disabled={disabled}
								className={styles.calendarButton}
								icon={mode === "time" ? <Clock3Icon /> : <CalendarDaysIcon />}
								aria-label={buttonAriaLabel}
							/>
						</Popover.Trigger>
					}>
					{({ controlClassName }) => (
						<div
							id={controlId}
							className={cn(uiStyles.uiInputControlFake, controlClassName)}
							data-disabled={disabled || undefined}
							data-invalid={error ? "" : undefined}
							role="group"
							aria-invalid={!!error || undefined}
							aria-placeholder={inputPlaceholder}
							aria-labelledby={labelId}
							aria-describedby={describedBy}
							onFocus={handleContainerFocus}
							onBlur={handleContainerBlur}
							onClick={(event) => {
								if (event.target === event.currentTarget) {
									focusFirstEmpty();
								}
							}}>
							{segments.map((segment, index) => {
								if (segment.kind === "literal") {
									return (
										<span key={index} className={styles.separator} data-disabled={disabled || undefined}>
											{segment.text}
										</span>
									);
								}

								return (
									<input
										key={index}
										ref={registerRef(index)}
										type="text"
										inputMode="numeric"
										className={styles.segmentInput}
										style={{ width: `${segment.length + 0.5}ch` }}
										value={segmentValues.get(index) ?? ""}
										placeholder={segment.placeholder}
										maxLength={segment.length}
										disabled={disabled}
										aria-label={segment.ariaLabel}
										autoComplete="off"
										onChange={handleInput(index)}
										onKeyDown={handleKeyDown(index)}
										onFocus={handleFocus()}
									/>
								);
							})}
						</div>
					)}
				</InputControl>
			</InputUI>

			<Popover.Content background="primary" onClose={handlePopoverClose}>
				{mode === "time" ? (
					<div className={styles.timeOnlyPopoverContent}>
						<TimePanel
							value={pickerValue}
							disabled={disabled}
							minDate={minDate}
							maxDate={maxDate}
							mode={mode}
							onChange={handleTimeChange}
						/>
					</div>
				) : (
					<div className={cn(styles.popoverContent, styles[timePanelPlacement])}>
						<div className={styles.calendarPane}>
							<CalendarView
								view={calendarView}
								datePickerLevel="day"
								selectionMode="day"
								onViewChange={setCalendarView}
								value={pickerValue}
								onChange={handleCalendarSelect}
								minDate={minDate}
								maxDate={maxDate}
								currentDate={pickerDate}
								onCurrentDateChange={setPickerDate}
							/>
						</div>

						<div className={cn(styles.timePanelPane, panelPlacementClass)}>
							<TimePanel
								value={pickerValue}
								disabled={disabled}
								minDate={minDate}
								maxDate={maxDate}
								mode={mode}
								onChange={handleTimeChange}
							/>
						</div>
					</div>
				)}
			</Popover.Content>
		</Popover>
	);
}
