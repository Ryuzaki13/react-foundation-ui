import React, { useCallback, useMemo, useRef, useState } from "react";

import { dateToSegmentValues, EditableSegment, parseMask, segmentsToDate, SegmentType } from "./maskParser";

interface UseMaskedSegmentsOptions {
	mask: string;
	value: Date | undefined;
	onChange: (date: Date) => void;
	onClearError?: () => void;
	disabled?: boolean;
}

// Вычисляет Map<index, string> из Date и массива сегментов
function buildSegmentMap(date: Date | undefined, segments: ReturnType<typeof parseMask>): Map<number, string> {
	const typeValues = dateToSegmentValues(date, segments);
	const map = new Map<number, string>();

	segments.forEach((seg, i) => {
		if (seg.kind === "editable") {
			map.set(i, typeValues.get(seg.type) ?? "");
		}
	});

	return map;
}

// TODO: Duplicate date-time-input/model/useDateTimeSegments
function resolveEditableIndices(segments: ReturnType<typeof parseMask>): number[] {
	const indices: number[] = [];

	segments.forEach((segment, index) => {
		if (segment.kind === "editable") {
			indices.push(index);
		}
	});

	return indices;
}

export function useMaskedSegments({ mask, value, onChange, onClearError, disabled }: UseMaskedSegmentsOptions) {
	const segments = useMemo(() => parseMask(mask), [mask]);

	const editableIndices = useMemo(() => resolveEditableIndices(segments), [segments]);

	// Значения сегментов, вычисленные из пропса value (источник истины)
	const committedValues = useMemo(() => buildSegmentMap(value, segments), [value, segments]);

	// Локальные «грязные» значения при редактировании (null → используем committedValues)
	const [dirtyValues, setDirtyValues] = useState<Map<number, string> | null>(null);

	// Сброс грязного состояния при внешнем изменении value (паттерн «adjusting state during render»)
	const [prevValueTime, setPrevValueTime] = useState(() => value?.getTime());
	const currentValueTime = value?.getTime();
	if (currentValueTime !== prevValueTime) {
		setPrevValueTime(currentValueTime);
		setDirtyValues(null);
	}

	// Текущие отображаемые значения
	const segmentValues = dirtyValues ?? committedValues;

	const refsMap = useRef<Map<number, HTMLInputElement>>(new Map());
	const blurTimeout = useRef<number>(0);
	const [isFocused, setIsFocused] = useState(false);

	const tryFireOnChange = useCallback(
		(updatedValues: Map<number, string>) => {
			const typeValues = new Map<SegmentType, string>();

			segments.forEach((seg, i) => {
				if (seg.kind === "editable") {
					typeValues.set(seg.type, updatedValues.get(i) ?? "");
				}
			});

			const date = segmentsToDate(segments, typeValues);
			if (date !== null) {
				onChange(date);
			}
		},
		[segments, onChange]
	);

	const focusSegment = useCallback((index: number, selectAll = true) => {
		const el = refsMap.current.get(index);
		if (el) {
			el.focus();
			if (selectAll) {
				requestAnimationFrame(() => el.select());
			}
		}
	}, []);

	const getNextEditable = useCallback(
		(currentIndex: number): number | null => {
			const pos = editableIndices.indexOf(currentIndex);
			return pos < editableIndices.length - 1 ? editableIndices[pos + 1] : null;
		},
		[editableIndices]
	);

	const getPrevEditable = useCallback(
		(currentIndex: number): number | null => {
			const pos = editableIndices.indexOf(currentIndex);
			return pos > 0 ? editableIndices[pos - 1] : null;
		},
		[editableIndices]
	);

	const padValue = useCallback((val: string, segment: EditableSegment): string => {
		return val.padStart(segment.length, "0");
	}, []);

	const registerRef = useCallback(
		(index: number) => (el: HTMLInputElement | null) => {
			if (el) {
				refsMap.current.set(index, el);
			} else {
				refsMap.current.delete(index);
			}
		},
		[]
	);

	const handleInput = useCallback(
		(index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
			if (disabled) return;

			const segment = segments[index] as EditableSegment;
			const raw = e.target.value.replace(/\D/g, "");
			const clamped = raw.slice(0, segment.length);

			const updated = new Map(segmentValues);
			updated.set(index, clamped);
			setDirtyValues(updated);

			onClearError?.();

			// Авто-переход к следующему сегменту при заполнении текущего
			if (clamped.length === segment.length) {
				const next = getNextEditable(index);
				if (next !== null) {
					requestAnimationFrame(() => focusSegment(next));
				}
			}

			tryFireOnChange(updated);
		},
		[disabled, segments, segmentValues, onClearError, getNextEditable, focusSegment, tryFireOnChange]
	);

	const handleKeyDown = useCallback(
		(index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (disabled) return;

			const segment = segments[index] as EditableSegment;
			const currentVal = segmentValues.get(index) ?? "";
			const el = e.currentTarget;

			switch (e.key) {
				case "ArrowRight": {
					if (el.selectionStart === currentVal.length || currentVal === "") {
						e.preventDefault();
						const next = getNextEditable(index);
						if (next !== null) focusSegment(next);
					}
					break;
				}
				case "ArrowLeft": {
					if (el.selectionStart === 0 || currentVal === "") {
						e.preventDefault();
						const prev = getPrevEditable(index);
						if (prev !== null) focusSegment(prev);
					}
					break;
				}
				case "ArrowUp": {
					e.preventDefault();
					let num = currentVal === "" ? segment.min : parseInt(currentVal, 10) + 1;
					if (num > segment.max) num = segment.min;

					const padded = padValue(num.toString(), segment);
					const updated = new Map(segmentValues);
					updated.set(index, padded);
					setDirtyValues(updated);
					tryFireOnChange(updated);

					requestAnimationFrame(() => el.select());
					break;
				}
				case "ArrowDown": {
					e.preventDefault();
					let num = currentVal === "" ? segment.max : parseInt(currentVal, 10) - 1;
					if (num < segment.min) num = segment.max;

					const padded = padValue(num.toString(), segment);
					const updated = new Map(segmentValues);
					updated.set(index, padded);
					setDirtyValues(updated);
					tryFireOnChange(updated);

					requestAnimationFrame(() => el.select());
					break;
				}
				case "Backspace": {
					if (currentVal === "") {
						e.preventDefault();
						const prev = getPrevEditable(index);
						if (prev !== null) focusSegment(prev);
					}
					break;
				}
				case "Delete": {
					e.preventDefault();
					const updated = new Map(segmentValues);
					updated.set(index, "");
					setDirtyValues(updated);
					tryFireOnChange(updated);
					break;
				}
			}
		},
		[disabled, segments, segmentValues, getNextEditable, getPrevEditable, focusSegment, padValue, tryFireOnChange]
	);

	const handleFocus = useCallback(
		() => (e: React.FocusEvent<HTMLInputElement>) => {
			e.target.select();
		},
		[]
	);

	const handleContainerFocus = useCallback(() => {
		clearTimeout(blurTimeout.current);
		setIsFocused(true);
	}, []);

	const handleContainerBlur = useCallback(() => {
		blurTimeout.current = window.setTimeout(() => {
			setIsFocused(false);
			// Откат к последнему валидному значению (из пропса) при потере фокуса
			setDirtyValues(null);
		}, 0);
	}, []);

	const focusFirstEmpty = useCallback(() => {
		const firstEmpty = editableIndices.find((i) => !(segmentValues.get(i) ?? ""));
		const target = firstEmpty ?? editableIndices[editableIndices.length - 1];
		if (target !== undefined) focusSegment(target);
	}, [editableIndices, segmentValues, focusSegment]);

	return {
		segments,
		segmentValues,
		isFocused,
		registerRef,
		handleInput,
		handleKeyDown,
		handleFocus,
		handleContainerFocus,
		handleContainerBlur,
		focusFirstEmpty
	};
}
