import {
	findClosestNumberScaleMark,
	findClosestNumberScaleMarkByPercent,
	getNumberScaleMarkPercent,
	prepareNumberScaleMarks,
	resolveNumberScaleBounds,
	snapNumberScaleValue,
	snapNumberScaleValueToStep,
	valueToNumberScalePercent
} from "@ryuzaki13/react-foundation-lib/number-scale";
import { resolveRangeOutputValue } from "@ryuzaki13/react-foundation-lib/range-output";

import { SliderFillRange, SliderMark, SliderMathOptions, SliderRangeMark, SliderRangeOutputValueFallback, SliderRangeValue } from "./types";

export function prepareSliderMarks<TMark extends SliderMark>(marks: readonly TMark[] | undefined, min: number, max: number): TMark[] {
	return prepareNumberScaleMarks(marks, min, max);
}

export function getSliderMarkPercent<TMark extends SliderMark>(mark: TMark, marks: readonly TMark[], options: SliderMathOptions<TMark>) {
	const markIndex = marks.findIndex((item) => item.value === mark.value);
	return getNumberScaleMarkPercent(Math.max(0, markIndex), marks, options.min, options.max, options.marksPosition);
}

/**
 * Возвращает визуальную позицию значения: по шкале min/max или по позиции ближайшей mark.
 */
export function valueToSliderVisualPercent<TMark extends SliderMark>(value: number, options: SliderMathOptions<TMark>) {
	const { min, max } = resolveNumberScaleBounds(options.min, options.max);
	const marks = prepareSliderMarks(options.marks, min, max);

	if (marks.length > 0) {
		const exactMark = marks.find((mark) => mark.value === value);
		const mark = exactMark ?? findClosestNumberScaleMark(value, marks);

		if (mark) {
			return getSliderMarkPercent(mark, marks, { ...options, min, max, marks });
		}
	}

	return valueToNumberScalePercent(value, min, max);
}

/**
 * Возвращает mark, который визуально ближе всего к pointer percent.
 */
export function getClosestSliderMarkByPercent<TMark extends SliderMark>(percent: number, options: SliderMathOptions<TMark>) {
	const { min, max } = resolveNumberScaleBounds(options.min, options.max);
	const marks = prepareSliderMarks(options.marks, min, max);

	return findClosestNumberScaleMarkByPercent(percent, marks, min, max, options.marksPosition);
}

export function snapSliderValue<TMark extends SliderMark>(value: number, options: SliderMathOptions<TMark>) {
	return snapNumberScaleValue(value, options);
}

export function normalizeSingleSliderValue(value: number | undefined, options: SliderMathOptions) {
	const { min, max } = resolveNumberScaleBounds(options.min, options.max);

	if (value === undefined) {
		return min;
	}

	return snapSliderValue(value, { ...options, min, max });
}

/**
 * Возвращает публичное значение mark: `outputValue`, если оно задано, иначе координату `value`.
 */
export function getRangeMarkOutputValue(mark: SliderRangeMark | undefined): number | null | undefined {
	if (!mark) {
		return undefined;
	}

	if (!Object.hasOwn(mark, "outputValue") || mark.outputValue === undefined) {
		return mark.value;
	}

	return mark.outputValue;
}

/**
 * Готовит range-значение к внешней сериализации, заменяя открытые границы на заданные подстановки.
 *
 * Функция не участвует во внутренней логике слайдера: `SliderRange` и `SliderRangeInput`
 * продолжают отдавать `null` через `onChange`, а потребитель явно применяет подстановку
 * рядом со своим обработчиком сохранения/отправки.
 */
export function resolveSliderRangeOutputValue(
	value: SliderRangeValue,
	fallback: SliderRangeOutputValueFallback | undefined
): SliderRangeValue {
	return resolveRangeOutputValue(value, fallback);
}

function findRangeMarkByOutputValue(
	value: number | null,
	marks: readonly SliderRangeMark[],
	thumbIndex: number
): SliderRangeMark | undefined {
	const matchingMarks = marks.filter((mark) => getRangeMarkOutputValue(mark) === value);

	if (!matchingMarks.length) {
		return undefined;
	}

	if (value === null) {
		return thumbIndex === 0 ? matchingMarks[0] : matchingMarks[matchingMarks.length - 1];
	}

	return matchingMarks[0];
}

/**
 * Ищет ближайшую mark по публичному output-значению, а не по координате шкалы.
 */
function findClosestRangeMarkByOutputValue(
	value: number,
	marks: readonly SliderRangeMark[],
	thumbIndex: number
): SliderRangeMark | undefined {
	const exactMark = findRangeMarkByOutputValue(value, marks, thumbIndex);
	if (exactMark) {
		return exactMark;
	}

	let nearestMark: SliderRangeMark | undefined;
	let nearestDistance = Number.POSITIVE_INFINITY;

	for (const mark of marks) {
		const outputValue = getRangeMarkOutputValue(mark);
		if (typeof outputValue !== "number" || !Number.isFinite(outputValue)) {
			continue;
		}

		const distance = Math.abs(value - outputValue);
		if (distance < nearestDistance) {
			nearestMark = mark;
			nearestDistance = distance;
		}
	}

	return nearestMark;
}

function normalizeRangeEndpoint(
	value: number | null,
	fallbackVisualValue: number,
	thumbIndex: number,
	options: SliderMathOptions<SliderRangeMark>
) {
	if (value === null) {
		return null;
	}

	const { min, max } = resolveNumberScaleBounds(options.min, options.max);
	const marks = prepareSliderMarks(options.marks, min, max);
	const publicValue = Number.isFinite(value) ? value : fallbackVisualValue;

	if (marks.length > 0) {
		const snappedMark = findClosestRangeMarkByOutputValue(publicValue, marks, thumbIndex);
		const outputValue = getRangeMarkOutputValue(snappedMark);

		return outputValue !== undefined ? outputValue : (snappedMark?.value ?? fallbackVisualValue);
	}

	return snapNumberScaleValueToStep(publicValue, min, max, options.step);
}

/**
 * Нормализует публичное range-значение, сохраняя null как открытую границу.
 */
export function normalizeRangeSliderValue(
	value: SliderRangeValue | undefined,
	options: SliderMathOptions<SliderRangeMark>
): SliderRangeValue {
	const { min, max } = resolveNumberScaleBounds(options.min, options.max);

	if (!value) {
		return [null, null];
	}

	const start = normalizeRangeEndpoint(value[0], min, 0, { ...options, min, max });
	const end = normalizeRangeEndpoint(value[1], max, 1, { ...options, min, max });

	if (start !== null && end !== null && start > end) {
		return [end, start];
	}

	return [start, end];
}

function getRangeEndpointVisualValue(
	value: number | null,
	fallbackVisualValue: number,
	thumbIndex: number,
	options: SliderMathOptions<SliderRangeMark>
) {
	if (value === null) {
		return fallbackVisualValue;
	}

	const { min, max } = resolveNumberScaleBounds(options.min, options.max);
	const marks = prepareSliderMarks(options.marks, min, max);

	if (marks.length > 0) {
		const exactOutputMark = findRangeMarkByOutputValue(value, marks, thumbIndex);
		const outputMark =
			exactOutputMark ?? (typeof value === "number" ? findClosestRangeMarkByOutputValue(value, marks, thumbIndex) : undefined);

		return outputMark?.value ?? fallbackVisualValue;
	}

	return snapNumberScaleValueToStep(value, min, max, options.step);
}

/**
 * Переводит публичный range tuple в finite-позиции thumb, где null стоит на краю шкалы.
 */
export function getRangeSliderVisualValue(
	value: SliderRangeValue | undefined,
	options: SliderMathOptions<SliderRangeMark>
): [number, number] {
	const { min, max } = resolveNumberScaleBounds(options.min, options.max);
	const normalized = normalizeRangeSliderValue(value, { ...options, min, max });
	const start = getRangeEndpointVisualValue(normalized[0], min, 0, { ...options, min, max });
	const end = getRangeEndpointVisualValue(normalized[1], max, 1, { ...options, min, max });

	return start <= end ? [start, end] : [end, start];
}

/**
 * Преобразует координату шкалы, выбранную pointer/keyboard, в публичное range-значение.
 */
export function visualValueToRangeEndpoint(value: number, options: SliderMathOptions<SliderRangeMark>) {
	const { min, max } = resolveNumberScaleBounds(options.min, options.max);
	const marks = prepareSliderMarks(options.marks, min, max);

	if (marks.length > 0) {
		const mark = findClosestNumberScaleMark(value, marks);
		const outputValue = getRangeMarkOutputValue(mark);

		return outputValue !== undefined ? outputValue : (mark?.value ?? value);
	}

	return snapNumberScaleValueToStep(value, min, max, options.step);
}

export function getClosestSliderThumb(targetValue: number, value: readonly [number, number]) {
	const [start, end] = value;
	return Math.abs(targetValue - start) <= Math.abs(targetValue - end) ? 0 : 1;
}

export function resolveSliderFillRange(value: number | readonly [number, number], options: SliderMathOptions): SliderFillRange {
	const { min, max } = resolveNumberScaleBounds(options.min, options.max);

	if (Array.isArray(value)) {
		return {
			startPercent: valueToSliderVisualPercent(value[0], { ...options, min, max }),
			endPercent: valueToSliderVisualPercent(value[1], { ...options, min, max })
		};
	}

	return {
		startPercent: 0,
		endPercent: valueToSliderVisualPercent(value as number, { ...options, min, max })
	};
}
