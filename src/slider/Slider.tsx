import React, { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

import { offsetNumberScaleValue, percentToNumberScaleValue, resolveNumberScaleBounds } from "@ryuzaki13/react-foundation-lib/number-scale";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { InputUI, useInputFieldIds } from "../input";
import { FloatingPopover } from "../popover";
import { UiBaseProps, UiSize } from "../types";

import {
	getClosestSliderMarkByPercent,
	getClosestSliderThumb,
	getRangeSliderVisualValue,
	getSliderMarkPercent,
	normalizeRangeSliderValue,
	normalizeSingleSliderValue,
	prepareSliderMarks,
	resolveSliderFillRange,
	valueToSliderVisualPercent,
	visualValueToRangeEndpoint,
	type SliderMark,
	type SliderMarksPosition,
	type SliderRangeMark,
	type SliderRangeValue
} from "./lib";
import styles from "./Slider.module.scss";

type SliderMarksDisplay = "compact" | "full";

interface SliderCommonProps<TMark extends SliderMark> {
	/**
	 * Минимальная координата шкалы. Marks вне этой границы отбрасываются.
	 */
	min: number;
	/**
	 * Максимальная координата шкалы. Marks вне этой границы отбрасываются.
	 */
	max: number;
	/**
	 * Шаг изменения, когда `marks` не заданы или после фильтрации не осталось валидных marks.
	 */
	step?: number;
	/**
	 * Дискретные точки выбора. Если заданы, бегунок всегда ходит только по marks.
	 */
	marks?: readonly TMark[];
	/**
	 * Способ визуального размещения marks и бегунка: по числовой координате `value` или равномерно по индексу.
	 */
	marksPosition?: SliderMarksPosition;
	/**
	 * Внешний CSS-класс контейнера поля.
	 */
	className?: string;
	/**
	 * Текст внешней ошибки, отображается через общую `InputUI`-обёртку.
	 */
	error?: string;
	/**
	 * Вызывается после успешного изменения значения, чтобы потребитель мог сбросить внешнюю ошибку.
	 */
	onClearError?: () => void;
}

/**
 * Single-value slider. Возвращает координату шкалы, потому что single marks не используют `outputValue`.
 */
export interface SliderProps extends Omit<UiBaseProps<number, number | undefined>, "placeholder">, SliderCommonProps<SliderMark> {}

/**
 * Range slider. Возвращает бизнес-значения `SliderRangeMark.outputValue`, если они заданы, иначе координаты `value`.
 */
export interface SliderRangeProps
	extends Omit<UiBaseProps<SliderRangeValue, SliderRangeValue | undefined>, "placeholder">, SliderCommonProps<SliderRangeMark> {}

interface SliderBaseCommonProps<TMark extends SliderMark> extends SliderCommonProps<TMark> {
	/**
	 * Подпись поля в общей `InputUI`-обёртке.
	 */
	label?: React.ReactNode;
	/**
	 * Описание поля под подписью.
	 */
	description?: string;
	/**
	 * Блокирует pointer, keyboard и click-взаимодействие.
	 */
	disabled?: boolean;
	/**
	 * Размер общей `InputUI`-обёртки.
	 */
	size?: UiSize;
	/**
	 * Compact показывает только ticks/tooltip внутри высоты control, full добавляет строку labels для popover.
	 */
	marksDisplay?: SliderMarksDisplay;
}

interface SliderBaseSingleProps extends SliderBaseCommonProps<SliderMark> {
	mode: "single";
	value: number | undefined;
	onChange: (value: number) => void;
}

interface SliderBaseRangeProps extends SliderBaseCommonProps<SliderRangeMark> {
	mode: "range";
	value: SliderRangeValue | undefined;
	onChange: (value: SliderRangeValue) => void;
}

export type SliderBaseProps = SliderBaseSingleProps | SliderBaseRangeProps;

function resolveKeyboardOffset(eventKey: string) {
	if (eventKey === "ArrowLeft" || eventKey === "ArrowDown") {
		return -1;
	}

	if (eventKey === "ArrowRight" || eventKey === "ArrowUp") {
		return 1;
	}

	if (eventKey === "PageDown") {
		return -10;
	}

	if (eventKey === "PageUp") {
		return 10;
	}

	return null;
}

function areRangeValuesEqual(left: SliderRangeValue | undefined, right: SliderRangeValue) {
	return !!left && left[0] === right[0] && left[1] === right[1];
}

function formatRangeEndpoint(value: number | null, thumbIndex: number) {
	if (value === null) {
		return thumbIndex === 0 ? "-∞" : "∞";
	}

	return String(value);
}

function getMarkLabelByValue<TMark extends SliderMark>(value: number, marks: readonly TMark[]) {
	return marks.find((mark) => mark.value === value)?.label ?? String(value);
}

function renderTooltipContent(content: React.ReactNode) {
	return typeof content === "string" || typeof content === "number" ? <span className="textNoWrap">{content}</span> : content;
}

export function SliderBase(props: SliderBaseProps) {
	const {
		min: rawMin,
		max: rawMax,
		step,
		marks,
		marksPosition = "value",
		marksDisplay = "compact",
		className,
		error,
		onClearError,
		label,
		description,
		disabled,
		size
	} = props;
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

	const isRange = props.mode === "range";
	const currentSingleValue = !isRange ? normalizeSingleSliderValue(props.value, sliderOptions) : undefined;
	const currentRangeValue = isRange ? normalizeRangeSliderValue(props.value, sliderOptions) : undefined;
	const visualRangeValue = isRange ? getRangeSliderVisualValue(props.value, sliderOptions) : undefined;
	const thumbValues = isRange ? visualRangeValue! : [currentSingleValue!];
	const fillRange = resolveSliderFillRange(isRange ? visualRangeValue! : currentSingleValue!, sliderOptions);

	const trackRef = useRef<HTMLDivElement | null>(null);
	const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);
	const dragThumbIndexRef = useRef<number | null>(null);
	const dragPointerIdRef = useRef<number | null>(null);
	const [dragThumbIndex, setDragThumbIndex] = useState<number | null>(null);

	const { controlId, labelId, descriptionId, errorId, describedBy } = useInputFieldIds({
		hasLabel: label !== undefined && label !== null,
		hasDescription: !!description,
		hasError: !!error
	});

	const emitSingleValue = (nextValue: number) => {
		if (disabled || props.mode !== "single") {
			return;
		}

		if (props.value !== undefined && props.value === nextValue) {
			return;
		}

		props.onChange(nextValue);
		onClearError?.();
	};

	const emitRangeValue = (nextValue: SliderRangeValue) => {
		if (disabled || props.mode !== "range") {
			return;
		}

		if (areRangeValuesEqual(props.value, nextValue)) {
			return;
		}

		props.onChange(nextValue);
		onClearError?.();
	};

	const applySliderValue = (rawValue: number, thumbIndex: number) => {
		if (disabled) {
			return;
		}

		if (props.mode === "range") {
			const [startVisualValue, endVisualValue] = visualRangeValue!;
			const [startValue, endValue] = currentRangeValue!;
			const nextValue =
				thumbIndex === 0
					? normalizeRangeSliderValue(
							[visualValueToRangeEndpoint(Math.min(rawValue, endVisualValue), sliderOptions), endValue],
							sliderOptions
						)
					: normalizeRangeSliderValue(
							[startValue, visualValueToRangeEndpoint(Math.max(rawValue, startVisualValue), sliderOptions)],
							sliderOptions
						);

			emitRangeValue(nextValue);
			return;
		}

		emitSingleValue(normalizeSingleSliderValue(rawValue, sliderOptions));
	};

	const resolveValueFromPointer = (clientX: number) => {
		const bounds = trackRef.current?.getBoundingClientRect();
		if (!bounds) {
			return min;
		}

		const percent = ((clientX - bounds.left) / bounds.width) * 100;
		const closestMark = normalizedMarks.length > 0 ? getClosestSliderMarkByPercent(percent, sliderOptions) : undefined;

		return closestMark?.value ?? percentToNumberScaleValue(percent, min, max);
	};
	const applySliderValueRef = useRef(applySliderValue);
	const resolveValueFromPointerRef = useRef(resolveValueFromPointer);

	useEffect(() => {
		applySliderValueRef.current = applySliderValue;
		resolveValueFromPointerRef.current = resolveValueFromPointer;
	});

	useEffect(() => {
		const onPointerUp = (event?: PointerEvent) => {
			if (dragPointerIdRef.current !== null && event && event.pointerId !== dragPointerIdRef.current) {
				return;
			}

			dragPointerIdRef.current = null;
			dragThumbIndexRef.current = null;
			setDragThumbIndex(null);
		};

		const onPointerMove = (event: PointerEvent) => {
			if (dragThumbIndexRef.current === null) {
				return;
			}

			if (dragPointerIdRef.current !== null && event.pointerId !== dragPointerIdRef.current) {
				return;
			}

			applySliderValueRef.current(resolveValueFromPointerRef.current(event.clientX), dragThumbIndexRef.current);
		};

		window.addEventListener("pointermove", onPointerMove);
		window.addEventListener("pointerup", onPointerUp);
		window.addEventListener("pointercancel", onPointerUp);

		return () => {
			window.removeEventListener("pointermove", onPointerMove);
			window.removeEventListener("pointerup", onPointerUp);
			window.removeEventListener("pointercancel", onPointerUp);
		};
	}, []);

	const beginPointerDrag = (pointerId: number, thumbIndex: number) => {
		dragPointerIdRef.current = pointerId;
		dragThumbIndexRef.current = thumbIndex;
		setDragThumbIndex(thumbIndex);
		thumbRefs.current[thumbIndex]?.focus();
	};

	const handleTrackPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		if (disabled) {
			return;
		}

		event.preventDefault();

		const rawValue = resolveValueFromPointer(event.clientX);
		const thumbIndex = isRange ? getClosestSliderThumb(rawValue, visualRangeValue!) : 0;

		applySliderValue(rawValue, thumbIndex);
		beginPointerDrag(event.pointerId, thumbIndex);
	};

	const handleThumbPointerDown = (thumbIndex: number) => (event: React.PointerEvent<HTMLButtonElement>) => {
		if (disabled) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		beginPointerDrag(event.pointerId, thumbIndex);
	};

	const handleThumbKeyDown = (thumbIndex: number) => (event: KeyboardEvent<HTMLButtonElement>) => {
		if (disabled) {
			return;
		}

		const lowerBound = isRange && thumbIndex === 1 ? visualRangeValue![0] : min;
		const upperBound = isRange && thumbIndex === 0 ? visualRangeValue![1] : max;
		const keyboardOffset = resolveKeyboardOffset(event.key);

		if (event.key === "Home") {
			event.preventDefault();
			applySliderValue(lowerBound, thumbIndex);
			return;
		}

		if (event.key === "End") {
			event.preventDefault();
			applySliderValue(upperBound, thumbIndex);
			return;
		}

		if (keyboardOffset === null) {
			return;
		}

		event.preventDefault();
		const baseValue = thumbValues[thumbIndex];
		const nextValue = offsetNumberScaleValue(baseValue, keyboardOffset, sliderOptions, lowerBound, upperBound);
		applySliderValue(nextValue, thumbIndex);
	};

	const handleMarkSelect = (markValue: number) => {
		if (disabled) {
			return;
		}

		const thumbIndex = isRange ? getClosestSliderThumb(markValue, visualRangeValue!) : 0;
		applySliderValue(markValue, thumbIndex);
		thumbRefs.current[thumbIndex]?.focus();
	};

	const getThumbValueText = (thumbValue: number, thumbIndex: number) => {
		if (isRange) {
			const publicValue = currentRangeValue![thumbIndex];
			const exactMark = normalizedMarks.find((mark) => mark.value === thumbValue);

			return exactMark?.label ?? formatRangeEndpoint(publicValue, thumbIndex);
		}

		return getMarkLabelByValue(thumbValue, normalizedMarks);
	};

	return (
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
			<div id={controlId} className={cn(styles.slider, marksDisplay === "compact" && styles.sliderCompact)}>
				<div className={styles.trackShell}>
					<div
						ref={trackRef}
						data-slot="track"
						className={styles.track}
						role="presentation"
						onPointerDown={handleTrackPointerDown}>
						<div className={styles.rail} />
						<div
							data-slot="fill"
							className={styles.fill}
							style={{
								left: `${fillRange.startPercent}%`,
								width: `${fillRange.endPercent - fillRange.startPercent}%`
							}}
						/>

						{marksDisplay === "compact" &&
							normalizedMarks.map((mark) => {
								const markPercent = getSliderMarkPercent(mark, normalizedMarks, sliderOptions);
								const isActive = isRange
									? mark.value >= visualRangeValue![0] && mark.value <= visualRangeValue![1]
									: mark.value <= currentSingleValue!;

								return (
									<FloatingPopover key={mark.value} tooltip placement="top" content={renderTooltipContent(mark.label)}>
										<button
											type="button"
											data-slot="mark"
											data-active={isActive ? "" : undefined}
											className={styles.compactMark}
											style={{ left: `${markPercent}%` }}
											aria-label={mark.ariaLabel}
											disabled={disabled}
											onClick={() => handleMarkSelect(mark.value)}>
											<span className={styles.markDot} aria-hidden="true" />
										</button>
									</FloatingPopover>
								);
							})}

						{thumbValues.map((thumbValue, thumbIndex) => {
							const thumbLabel = getThumbValueText(thumbValue, thumbIndex);

							return (
								<FloatingPopover
									key={thumbIndex}
									tooltip
									placement="top"
									content={renderTooltipContent(thumbLabel)}
									openDelay={0}
									closeDelay={100}>
									<button
										ref={(node) => {
											thumbRefs.current[thumbIndex] = node;
										}}
										type="button"
										role="slider"
										data-slot="thumb"
										data-thumb-index={thumbIndex}
										data-dragging={dragThumbIndex === thumbIndex ? "" : undefined}
										className={styles.thumb}
										disabled={disabled}
										style={{ left: `${valueToSliderVisualPercent(thumbValue, sliderOptions)}%` }}
										aria-disabled={disabled || undefined}
										aria-orientation="horizontal"
										aria-valuemin={isRange && thumbIndex === 1 ? visualRangeValue![0] : min}
										aria-valuemax={isRange && thumbIndex === 0 ? visualRangeValue![1] : max}
										aria-valuenow={thumbValue}
										aria-valuetext={
											typeof thumbLabel === "string" || typeof thumbLabel === "number"
												? String(thumbLabel)
												: undefined
										}
										aria-labelledby={labelId}
										aria-describedby={describedBy}
										aria-label={
											labelId
												? undefined
												: isRange
													? thumbIndex === 0
														? "Минимальное значение"
														: "Максимальное значение"
													: "Значение"
										}
										onPointerDown={handleThumbPointerDown(thumbIndex)}
										onKeyDown={handleThumbKeyDown(thumbIndex)}
									/>
								</FloatingPopover>
							);
						})}
					</div>
				</div>

				{marksDisplay === "full" && normalizedMarks.length > 0 && (
					<div className={styles.marks}>
						{normalizedMarks.map((mark) => {
							const isActive = isRange
								? mark.value >= visualRangeValue![0] && mark.value <= visualRangeValue![1]
								: mark.value <= currentSingleValue!;

							return (
								<button
									key={mark.value}
									type="button"
									data-slot="mark"
									data-active={isActive ? "" : undefined}
									className={styles.mark}
									style={{ left: `${getSliderMarkPercent(mark, normalizedMarks, sliderOptions)}%` }}
									aria-label={mark.ariaLabel}
									disabled={disabled}
									onClick={() => handleMarkSelect(mark.value)}>
									<span className={styles.markDot} aria-hidden="true" />
									<span className={styles.markLabel}>{mark.label}</span>
								</button>
							);
						})}
					</div>
				)}
			</div>
		</InputUI>
	);
}

export function Slider(props: SliderProps) {
	return <SliderBase {...props} mode="single" marksDisplay="compact" />;
}

export function SliderRange(props: SliderRangeProps) {
	return <SliderBase {...props} mode="range" marksDisplay="compact" />;
}
