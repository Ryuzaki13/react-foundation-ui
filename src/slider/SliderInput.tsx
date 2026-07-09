import { KeyboardEvent, useCallback, useEffect, useEffectEvent, useMemo, useState } from "react";

import { toFiniteNumber } from "@ryuzaki13/react-foundation-lib/formatters";
import { resolveNumberScaleBounds } from "@ryuzaki13/react-foundation-lib/number-scale";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { InputControl, InputText, InputUI, useInputFieldIds } from "../input";
import { PickerTriggerActions } from "../picker";
import { Popover } from "../popover";
import { UiBaseProps } from "../types";
import uiStyles from "../ui.module.scss";

import {
	getRangeMarkOutputValue,
	normalizeRangeSliderValue,
	normalizeSingleSliderValue,
	prepareSliderMarks,
	type SliderMark,
	type SliderMarksPosition,
	type SliderRangeMark,
	type SliderRangeValue
} from "./lib";
import { SliderBase } from "./Slider";
import styles from "./Slider.module.scss";

interface SliderInputCommonProps {
	/**
	 * Минимальная координата шкалы. Marks вне этой границы не участвуют в выборе.
	 */
	min: number;
	/**
	 * Максимальная координата шкалы. Marks вне этой границы не участвуют в выборе.
	 */
	max: number;
	/**
	 * Шаг ручного ввода и слайдера, если не заданы marks.
	 */
	step?: number;
	/**
	 * Способ визуального размещения marks и бегунка в popover.
	 */
	marksPosition?: SliderMarksPosition;
	/**
	 * Внешний CSS-класс общей обёртки поля.
	 */
	className?: string;
	/**
	 * Текст внешней ошибки.
	 */
	error?: string;
	/**
	 * Сбрасывает внешнюю ошибку после успешного commit или выбора в popover.
	 */
	onClearError?: () => void;
}

export interface SliderInputProps extends UiBaseProps<number>, SliderInputCommonProps {
	/**
	 * Marks single-слайдера. Single-компонент отдаёт наружу `mark.value`.
	 */
	marks?: readonly SliderMark[];
}

export interface SliderRangeInputProps extends UiBaseProps<SliderRangeValue>, SliderInputCommonProps {
	/**
	 * Marks range-слайдера. `value` задаёт координату на шкале, `outputValue` задаёт публичное значение для потребителя.
	 */
	marks?: readonly SliderRangeMark[];
	/**
	 * Показывает вместо ручных сегментов готовый текст по выбранным marks.
	 * Popover остаётся единственным способом изменить значение через слайдер, а потребитель получает изменение при закрытии popover.
	 */
	readonlyValueText?: boolean;
}

function createSliderToggle({
	open,
	disabled,
	setOpen
}: {
	open: boolean;
	disabled?: boolean;
	setOpen: (nextOpen: boolean | ((prev: boolean) => boolean)) => void;
}) {
	return (
		<Popover.Trigger passive>
			<div>
				<PickerTriggerActions
					open={open}
					disabled={disabled}
					openAriaLabel="Открыть слайдер"
					closeAriaLabel="Закрыть слайдер"
					onToggleMouseDown={(event) => event.preventDefault()}
					onToggleClick={() => setOpen((prev) => !prev)}
				/>
			</div>
		</Popover.Trigger>
	);
}

function formatRangeDraft(
	value: SliderRangeValue | undefined,
	options: {
		min: number;
		max: number;
		step?: number;
		marks?: readonly SliderRangeMark[];
		marksPosition?: SliderMarksPosition;
	}
) {
	const normalized = normalizeRangeSliderValue(value, options);

	return {
		start: normalized[0] === null ? "-∞" : String(normalized[0]),
		end: normalized[1] === null ? "∞" : String(normalized[1])
	};
}

function parseRangeDraftSegment(value: string, infinityText: string) {
	const trimmed = value.trim();
	if (trimmed === "" || trimmed === infinityText) {
		return null;
	}

	return toFiniteNumber(trimmed);
}

function getRangeMarkByOutputValue(value: number | null, marks: readonly SliderRangeMark[], endpoint: "start" | "end") {
	const matchingMarks = marks.filter((mark) => getRangeMarkOutputValue(mark) === value);

	if (!matchingMarks.length) {
		return undefined;
	}

	return value === null && endpoint === "end" ? matchingMarks[matchingMarks.length - 1] : matchingMarks[0];
}

function getRangeMarkReadonlyLabel(mark: SliderRangeMark | undefined, value: number | null) {
	if (mark?.readonlyLabel?.trim()) {
		return mark.readonlyLabel.trim();
	}

	if (typeof mark?.label === "string" || typeof mark?.label === "number") {
		return String(mark.label);
	}
	// SHARE: lib/formatters/string.toSafeString
	return value === null ? "" : String(value);
}

function getRangeEndpointLabel(value: number | null, marks: readonly SliderRangeMark[], endpoint: "start" | "end") {
	const mark = getRangeMarkByOutputValue(value, marks, endpoint);
	return getRangeMarkReadonlyLabel(mark, value);
}

function getRangeReadonlyText(value: SliderRangeValue, marks: readonly SliderRangeMark[], placeholder?: string) {
	const [start, end] = value;
	const isStartOpen = start === null;
	const isEndOpen = end === null;

	if (isStartOpen && isEndOpen) {
		return placeholder ?? "";
	}

	if (isStartOpen) {
		return `Меньше ${getRangeEndpointLabel(end, marks, "end")}`;
	}

	if (isEndOpen) {
		return `Больше ${getRangeEndpointLabel(start, marks, "start")}`;
	}

	if (start === end) {
		return `Равно ${getRangeEndpointLabel(start, marks, "start")}`;
	}

	return `От ${getRangeEndpointLabel(start, marks, "start")} до ${getRangeEndpointLabel(end, marks, "end")}`;
}

export function SliderInput({
	value,
	onChange,
	min: rawMin,
	max: rawMax,
	step,
	marks,
	marksPosition = "value",
	className,
	error,
	onClearError,
	label,
	description,
	placeholder,
	disabled,
	size
}: SliderInputProps) {
	const { min, max } = useMemo(() => resolveNumberScaleBounds(rawMin, rawMax), [rawMin, rawMax]);
	const normalizedMarks = useMemo(() => prepareSliderMarks(marks, min, max), [marks, min, max]);
	const sliderOptions = useMemo(
		() => ({
			min,
			max,
			step,
			marks: normalizedMarks,
			marksPosition
		}),
		[min, max, step, normalizedMarks, marksPosition]
	);
	const normalizedValue = normalizeSingleSliderValue(value, sliderOptions);

	const [open, setOpen] = useState(false);
	const [draftValue, setDraftValue] = useState(String(normalizedValue));

	const syncDraftValue = useEffectEvent((nextValue: string) => {
		setDraftValue(nextValue);
	});

	useEffect(() => {
		syncDraftValue(String(normalizedValue));
	}, [normalizedValue]);

	const commitDraftValue = useCallback(() => {
		if (disabled) {
			setDraftValue(String(normalizedValue));
			return;
		}

		const parsedValue = toFiniteNumber(draftValue);
		if (parsedValue === undefined) {
			setDraftValue(String(normalizedValue));
			return;
		}

		const nextValue = normalizeSingleSliderValue(parsedValue, sliderOptions);
		if (value !== nextValue) {
			onChange(nextValue);
			onClearError?.();
		}

		setDraftValue(String(nextValue));
	}, [disabled, draftValue, normalizedValue, onChange, onClearError, sliderOptions, value]);

	const handleDraftKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Enter") {
			return;
		}

		event.preventDefault();
		commitDraftValue();
	};

	const handleSliderChange = (nextValue: number) => {
		onChange(nextValue);
		setDraftValue(String(nextValue));
		onClearError?.();
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<InputText
				label={label}
				description={description}
				placeholder={placeholder}
				disabled={disabled}
				size={size}
				className={className}
				error={error}
				value={draftValue}
				onChange={setDraftValue}
				onBlur={commitDraftValue}
				onKeyDown={handleDraftKeyDown}
				endAdornmentWidth="var(--control-height)"
				endAdornment={createSliderToggle({ open, disabled, setOpen })}
			/>

			<Popover.Content background="primary">
				<div className={styles.popoverContent}>
					<SliderBase
						mode="single"
						min={min}
						max={max}
						step={step}
						marks={normalizedMarks}
						marksPosition={marksPosition}
						marksDisplay="full"
						value={value}
						onChange={handleSliderChange}
						disabled={disabled}
					/>
				</div>
			</Popover.Content>
		</Popover>
	);
}

export function SliderRangeInput({
	value,
	onChange,
	min: rawMin,
	max: rawMax,
	step,
	marks,
	marksPosition = "value",
	className,
	error,
	onClearError,
	label,
	description,
	readonlyValueText,
	placeholder,
	disabled,
	size
}: SliderRangeInputProps) {
	const { min, max } = useMemo(() => resolveNumberScaleBounds(rawMin, rawMax), [rawMin, rawMax]);
	const normalizedMarks = useMemo(() => prepareSliderMarks(marks, min, max), [marks, min, max]);
	const sliderOptions = useMemo(
		() => ({
			min,
			max,
			step,
			marks: normalizedMarks,
			marksPosition
		}),
		[min, max, step, normalizedMarks, marksPosition]
	);
	const normalizedValue = useMemo(() => normalizeRangeSliderValue(value, sliderOptions), [sliderOptions, value]);
	const formattedValue = useMemo(() => formatRangeDraft(normalizedValue, sliderOptions), [normalizedValue, sliderOptions]);

	const [open, setOpen] = useState(false);
	const [draftStart, setDraftStart] = useState(formattedValue.start);
	const [draftEnd, setDraftEnd] = useState(formattedValue.end);
	const [popoverValue, setPopoverValue] = useState<SliderRangeValue>(normalizedValue);

	const syncDraftValue = useEffectEvent((start: string, end: string) => {
		setDraftStart(start);
		setDraftEnd(end);
	});

	useEffect(() => {
		if (open) {
			return;
		}

		syncDraftValue(formattedValue.start, formattedValue.end);
	}, [formattedValue.start, formattedValue.end, normalizedValue, open]);

	const { controlId, labelId, descriptionId, errorId, describedBy } = useInputFieldIds({
		hasLabel: label !== undefined && label !== null,
		hasDescription: !!description,
		hasError: !!error
	});

	const rollbackDraftValue = useCallback(() => {
		setDraftStart(formattedValue.start);
		setDraftEnd(formattedValue.end);
	}, [formattedValue.end, formattedValue.start]);

	const commitDraftValue = useCallback(() => {
		if (disabled) {
			rollbackDraftValue();
			return;
		}

		const parsedStart = parseRangeDraftSegment(draftStart, "-∞");
		const parsedEnd = parseRangeDraftSegment(draftEnd, "∞");

		if (parsedStart === undefined || parsedEnd === undefined) {
			rollbackDraftValue();
			return;
		}

		const nextValue = normalizeRangeSliderValue([parsedStart, parsedEnd], sliderOptions);
		if (!areRangeDraftValuesEqual(normalizedValue, nextValue)) {
			onChange(nextValue);
			onClearError?.();
		}

		const nextDraft = formatRangeDraft(nextValue, sliderOptions);
		setDraftStart(nextDraft.start);
		setDraftEnd(nextDraft.end);
		setPopoverValue(nextValue);
	}, [disabled, draftEnd, draftStart, normalizedValue, onChange, onClearError, rollbackDraftValue, sliderOptions]);

	const commitPopoverValue = useCallback(
		(nextValue: SliderRangeValue) => {
			const normalizedNextValue = normalizeRangeSliderValue(nextValue, sliderOptions);
			if (!areRangeDraftValuesEqual(normalizedValue, normalizedNextValue)) {
				onChange(normalizedNextValue);
				onClearError?.();
			}

			const nextDraft = formatRangeDraft(normalizedNextValue, sliderOptions);
			setDraftStart(nextDraft.start);
			setDraftEnd(nextDraft.end);
			setPopoverValue(normalizedNextValue);
		},
		[normalizedValue, onChange, onClearError, sliderOptions]
	);

	const handleOpenChange = (nextOpen: boolean) => {
		if (!open && nextOpen) {
			setPopoverValue(normalizedValue);
			setDraftStart(formattedValue.start);
			setDraftEnd(formattedValue.end);
		}

		if (open && !nextOpen && !disabled) {
			commitPopoverValue(popoverValue);
		}

		setOpen(nextOpen);
	};

	const handleDraftKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Enter") {
			return;
		}

		event.preventDefault();
		commitDraftValue();
	};

	const handleSliderChange = (nextValue: SliderRangeValue) => {
		const normalizedNextValue = normalizeRangeSliderValue(nextValue, sliderOptions);
		setPopoverValue(normalizedNextValue);
		const nextDraft = formatRangeDraft(normalizedNextValue, sliderOptions);
		setDraftStart(nextDraft.start);
		setDraftEnd(nextDraft.end);
	};
	const displayValue = open ? popoverValue : normalizedValue;
	const readonlyTextValue = readonlyValueText ? getRangeReadonlyText(displayValue, normalizedMarks, placeholder) : undefined;
	const setRangeOpen = (nextOpen: boolean | ((prev: boolean) => boolean)) => {
		handleOpenChange(typeof nextOpen === "function" ? nextOpen(open) : nextOpen);
	};

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<InputUI
				label={label}
				description={description}
				disabled={disabled}
				className={className}
				size={size}
				error={error}
				controlId={controlId}
				labelId={labelId}
				descriptionId={descriptionId}
				errorId={errorId}>
				<InputControl
					endAdornmentWidth="var(--control-height)"
					endAdornment={createSliderToggle({ open, disabled, setOpen: setRangeOpen })}>
					{({ controlClassName }) => (
						<div
							id={controlId}
							className={cn(uiStyles.uiInputControlFake, styles.rangeInputControl, controlClassName)}
							data-invalid={error ? "" : undefined}
							data-disabled={disabled || undefined}
							role="group"
							aria-invalid={!!error || undefined}
							aria-label={typeof label === "string" ? label : "Диапазон"}
							aria-labelledby={typeof label === "string" ? undefined : labelId}
							aria-describedby={describedBy}>
							{readonlyValueText ? (
								<span className={cn("flexEllipsis", !readonlyTextValue && uiStyles.uiPlaceholder)}>
									{readonlyTextValue || placeholder}
								</span>
							) : (
								<>
									<input
										type="text"
										inputMode="decimal"
										className={styles.rangeSegmentInput}
										value={draftStart}
										disabled={disabled}
										aria-label="Начало диапазона"
										onChange={(event) => setDraftStart(event.target.value)}
										onBlur={commitDraftValue}
										onKeyDown={handleDraftKeyDown}
									/>
									<span className={styles.rangeSeparator} data-disabled={disabled || undefined}>
										-
									</span>
									<input
										type="text"
										inputMode="decimal"
										className={styles.rangeSegmentInput}
										value={draftEnd}
										disabled={disabled}
										aria-label="Конец диапазона"
										onChange={(event) => setDraftEnd(event.target.value)}
										onBlur={commitDraftValue}
										onKeyDown={handleDraftKeyDown}
									/>
								</>
							)}
						</div>
					)}
				</InputControl>
			</InputUI>

			<Popover.Content background="primary">
				<div className={styles.popoverContent}>
					<SliderBase
						mode="range"
						min={min}
						max={max}
						step={step}
						marks={normalizedMarks}
						marksPosition={marksPosition}
						marksDisplay="full"
						value={popoverValue}
						onChange={handleSliderChange}
						disabled={disabled}
					/>
				</div>
			</Popover.Content>
		</Popover>
	);
}

function areRangeDraftValuesEqual(left: SliderRangeValue, right: SliderRangeValue) {
	return left[0] === right[0] && left[1] === right[1];
}
