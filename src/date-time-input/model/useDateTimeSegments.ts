import type { ChangeEvent, FocusEvent, KeyboardEvent } from "react";
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

import {
	areAllDateSegmentsEmpty,
	dateToIndexedSegmentValues,
	type EditableDateSegment,
	indexedSegmentsToDate,
	parseDateSegmentMask
} from "@ryuzaki13/react-foundation-lib/date-segments";

import { createTimeOnlyBaseDate, getDateTimeInputFormat, isDateTimeWithinRange, normalizeDateTimeValue } from "../lib";

import type { DateTimeInputMode } from "../lib";

interface UseDateTimeSegmentsOptions {
	value: Date | null | undefined;
	onChange: (value: Date | null) => void;
	onClearError?: () => void;
	disabled?: boolean;
	minDate?: Date;
	maxDate?: Date;
	mode?: DateTimeInputMode;
}

function resolveEditableIndices(segments: readonly { kind: string }[]): number[] {
	const indices: number[] = [];

	segments.forEach((segment, index) => {
		if (segment.kind === "editable") {
			indices.push(index);
		}
	});

	return indices;
}

/**
 * Управляет сегментным вводом фиксированного формата даты-времени или только времени.
 */
export function useDateTimeSegments({
	value,
	onChange,
	onClearError,
	disabled,
	minDate,
	maxDate,
	mode = "date-time"
}: UseDateTimeSegmentsOptions) {
	const inputFormat = useMemo(() => getDateTimeInputFormat(mode), [mode]);
	const segments = useMemo(() => parseDateSegmentMask(inputFormat), [inputFormat]);
	const editableIndices = useMemo(() => resolveEditableIndices(segments), [segments]);
	const committedValues = useMemo(() => dateToIndexedSegmentValues(value ?? null, segments), [segments, value]);
	const [dirtyValues, setDirtyValues] = useState<Map<number, string> | null>(null);
	const currentValueTime = value?.getTime() ?? null;

	const syncDirtyValues = useEffectEvent((values: Map<number, string> | null) => setDirtyValues(values));

	useEffect(() => {
		syncDirtyValues(null);
	}, [currentValueTime, mode]);

	const segmentValues = dirtyValues ?? committedValues;
	const refsMap = useRef<Map<number, HTMLInputElement>>(new Map());
	const blurTimeout = useRef<number>(0);

	/**
	 * Пытается собрать и отдать наружу новое значение поля.
	 */
	const tryCommit = useCallback(
		(updatedValues: Map<number, string>) => {
			if (areAllDateSegmentsEmpty(segments, updatedValues)) {
				onChange(null);
				return null;
			}

			const nextDate = indexedSegmentsToDate(segments, updatedValues, {
				defaultDate: mode === "time" ? (normalizeDateTimeValue(value, "time") ?? createTimeOnlyBaseDate()) : undefined
			});
			if (!nextDate) return null;
			if (!isDateTimeWithinRange(nextDate, minDate, maxDate, mode)) return null;

			onChange(nextDate);
			return nextDate;
		},
		[maxDate, minDate, mode, onChange, segments, value]
	);

	/**
	 * Фокусирует конкретный редактируемый сегмент.
	 */
	const focusSegment = useCallback((index: number, selectAll = true) => {
		const element = refsMap.current.get(index);
		if (!element) return;

		element.focus();
		if (selectAll) {
			requestAnimationFrame(() => element.select());
		}
	}, []);

	/**
	 * Возвращает индекс следующего редактируемого сегмента.
	 */
	const getNextEditable = useCallback(
		(currentIndex: number): number | null => {
			const position = editableIndices.indexOf(currentIndex);
			return position < editableIndices.length - 1 ? editableIndices[position + 1] : null;
		},
		[editableIndices]
	);

	/**
	 * Возвращает индекс предыдущего редактируемого сегмента.
	 */
	const getPreviousEditable = useCallback(
		(currentIndex: number): number | null => {
			const position = editableIndices.indexOf(currentIndex);
			return position > 0 ? editableIndices[position - 1] : null;
		},
		[editableIndices]
	);

	/**
	 * Дополняет неполный сегмент ведущими нулями.
	 */
	const padValue = useCallback((valueToPad: string, segment: EditableDateSegment) => valueToPad.padStart(segment.length, "0"), []);

	/**
	 * Регистрирует DOM-ссылку сегмента по индексу.
	 */
	const registerRef = useCallback(
		(index: number) => (element: HTMLInputElement | null) => {
			if (element) {
				refsMap.current.set(index, element);
				return;
			}

			refsMap.current.delete(index);
		},
		[]
	);

	/**
	 * Обрабатывает печать внутри отдельного сегмента.
	 */
	const handleInput = useCallback(
		(index: number) => (event: ChangeEvent<HTMLInputElement>) => {
			if (disabled) return;

			const segment = segments[index];
			if (segment.kind !== "editable") return;

			const rawValue = event.target.value.replace(/\D/g, "");
			const clampedValue = rawValue.slice(0, segment.length);
			const updatedValues = new Map(segmentValues);
			updatedValues.set(index, clampedValue);
			setDirtyValues(updatedValues);
			onClearError?.();

			if (clampedValue.length === segment.length) {
				const nextIndex = getNextEditable(index);
				if (nextIndex !== null) {
					requestAnimationFrame(() => focusSegment(nextIndex));
				}
			}

			tryCommit(updatedValues);
		},
		[disabled, focusSegment, getNextEditable, onClearError, segmentValues, segments, tryCommit]
	);

	/**
	 * Обрабатывает клавиатурную навигацию и шаговые изменения сегментов.
	 */
	const handleKeyDown = useCallback(
		(index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
			if (disabled) return;

			const segment = segments[index];
			if (segment.kind !== "editable") return;

			const currentValue = segmentValues.get(index) ?? "";
			const element = event.currentTarget;

			switch (event.key) {
				case "ArrowRight": {
					if (element.selectionStart === currentValue.length || currentValue === "") {
						event.preventDefault();
						const nextIndex = getNextEditable(index);
						if (nextIndex !== null) focusSegment(nextIndex);
					}
					break;
				}
				case "ArrowLeft": {
					if (element.selectionStart === 0 || currentValue === "") {
						event.preventDefault();
						const previousIndex = getPreviousEditable(index);
						if (previousIndex !== null) focusSegment(previousIndex);
					}
					break;
				}
				case "ArrowUp": {
					event.preventDefault();
					let numericValue = currentValue === "" ? segment.min : Number.parseInt(currentValue, 10) + 1;
					if (numericValue > segment.max) numericValue = segment.min;

					const updatedValues = new Map(segmentValues);
					updatedValues.set(index, padValue(String(numericValue), segment));
					setDirtyValues(updatedValues);
					tryCommit(updatedValues);
					requestAnimationFrame(() => element.select());
					break;
				}
				case "ArrowDown": {
					event.preventDefault();
					let numericValue = currentValue === "" ? segment.max : Number.parseInt(currentValue, 10) - 1;
					if (numericValue < segment.min) numericValue = segment.max;

					const updatedValues = new Map(segmentValues);
					updatedValues.set(index, padValue(String(numericValue), segment));
					setDirtyValues(updatedValues);
					tryCommit(updatedValues);
					requestAnimationFrame(() => element.select());
					break;
				}
				case "Backspace": {
					if (currentValue === "") {
						event.preventDefault();
						const previousIndex = getPreviousEditable(index);
						if (previousIndex !== null) focusSegment(previousIndex);
					}
					break;
				}
				case "Delete": {
					event.preventDefault();
					const updatedValues = new Map(segmentValues);
					updatedValues.set(index, "");
					setDirtyValues(updatedValues);
					tryCommit(updatedValues);
					break;
				}
			}
		},
		[disabled, focusSegment, getNextEditable, getPreviousEditable, padValue, segmentValues, segments, tryCommit]
	);

	/**
	 * Выделяет содержимое сегмента при фокусе.
	 */
	const handleFocus = useCallback(
		() => (event: FocusEvent<HTMLInputElement>) => {
			event.target.select();
		},
		[]
	);

	/**
	 * Сбрасывает таймер blur, когда контейнер получает фокус.
	 */
	const handleContainerFocus = useCallback(() => {
		clearTimeout(blurTimeout.current);
	}, []);

	/**
	 * На blur оставляет только committed-значение либо полностью пустое состояние.
	 */
	const handleContainerBlur = useCallback(() => {
		const currentValues = new Map(segmentValues);

		blurTimeout.current = window.setTimeout(() => {
			if (areAllDateSegmentsEmpty(segments, currentValues)) {
				onChange(null);
				setDirtyValues(currentValues);
				return;
			}

			const nextDate = indexedSegmentsToDate(segments, currentValues, {
				defaultDate: mode === "time" ? (normalizeDateTimeValue(value, "time") ?? createTimeOnlyBaseDate()) : undefined
			});
			if (!nextDate || !isDateTimeWithinRange(nextDate, minDate, maxDate, mode)) {
				setDirtyValues(null);
				return;
			}

			setDirtyValues(currentValues);
		}, 0);
	}, [maxDate, minDate, mode, onChange, segmentValues, segments, value]);

	/**
	 * Фокусирует первый пустой сегмент либо последний редактируемый.
	 */
	const focusFirstEmpty = useCallback(() => {
		const firstEmpty = editableIndices.find((index) => !(segmentValues.get(index) ?? ""));
		const targetIndex = firstEmpty ?? editableIndices[editableIndices.length - 1];
		if (targetIndex !== undefined) {
			focusSegment(targetIndex);
		}
	}, [editableIndices, focusSegment, segmentValues]);

	return {
		segments,
		segmentValues,
		registerRef,
		handleInput,
		handleKeyDown,
		handleFocus,
		handleContainerFocus,
		handleContainerBlur,
		focusFirstEmpty
	};
}
