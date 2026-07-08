import type { ReactNode } from "react";

import type { NumberScaleMarksPosition } from "@ryuzaki13/react-foundation-lib/number-scale";
import type { RangeOutputValueFallback } from "@ryuzaki13/react-foundation-lib/range-output";

export type SliderMarksPosition = NumberScaleMarksPosition;

export type SliderMark = {
	/**
	 * Внутреннее значение шкалы и координата mark.
	 * Используется для расчёта позиции, snap-логики и движения бегунка.
	 */
	value: number;
	/**
	 * Визуальная подпись mark в popover и tooltip.
	 */
	label: ReactNode;
	/**
	 * Доступная подпись mark для screen reader, если визуальный label недостаточен.
	 */
	ariaLabel?: string;
};

export type SliderRangeMark = SliderMark & {
	/**
	 * Текст mark для readonly-отображения выбранного диапазона.
	 * Если не задан, используется визуальная `label`.
	 */
	readonlyLabel?: string;
	/**
	 * Публичное значение, которое получает потребитель `SliderRange`/`SliderRangeInput` при выборе этой mark.
	 * Если не задано, наружу отдаётся `value`.
	 * Используется для случаев, где координата шкалы отличается от бизнес-значения:
	 * например, `value: 3` как позиция "3 месяца" и `outputValue: 90` как фильтр в днях.
	 * `null` означает открытую границу диапазона.
	 */
	outputValue?: number | null;
};

/**
 * Публичное значение range-компонентов.
 * Числа являются бизнес-значениями после применения `outputValue`, а `null` означает открытую границу.
 */
export type SliderRangeValue = [number | null, number | null];

/**
 * Сериализуемые подстановки для открытых границ range-слайдера.
 *
 * Используются на стороне потребителя перед отправкой/сохранением значения.
 * Сам компонент и его `onChange` продолжают работать с `SliderRangeValue`, где
 * `null` означает открытую границу.
 */
export type SliderRangeOutputValueFallback = RangeOutputValueFallback<number>;

export interface SliderMathOptions<TMark extends SliderMark = SliderMark> {
	/**
	 * Минимальная координата шкалы. Для marks это граница фильтрации `mark.value`.
	 */
	min: number;
	/**
	 * Максимальная координата шкалы. Для marks это граница фильтрации `mark.value`.
	 */
	max: number;
	/**
	 * Шаг числовой шкалы, используется только когда нет валидных marks.
	 */
	step?: number;
	/**
	 * Набор допустимых точек. Если задан, значение всегда snap-ится к ближайшей mark.
	 */
	marks?: readonly TMark[];
	/**
	 * Способ визуального размещения marks: пропорционально `value` или равномерно по индексу.
	 */
	marksPosition?: SliderMarksPosition;
}

export interface SliderFillRange {
	/**
	 * Левая граница заливки track в процентах.
	 */
	startPercent: number;
	/**
	 * Правая граница заливки track в процентах.
	 */
	endPercent: number;
}
