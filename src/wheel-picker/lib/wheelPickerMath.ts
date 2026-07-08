/**
 * Возвращает безопасный индекс внутри диапазона элементов wheel-picker.
 */
export function clampWheelIndex(index: number, itemsCount: number): number {
	if (itemsCount <= 0) return 0;
	if (index < 0) return 0;
	if (index > itemsCount - 1) return itemsCount - 1;

	return index;
}

/**
 * Возвращает высоту viewport wheel-picker с учётом минимального значения.
 */
export function resolveWheelViewportHeight(measuredHeight: number, minHeight: number): number {
	if (!Number.isFinite(measuredHeight) || measuredHeight <= 0) return minHeight;
	return Math.max(measuredHeight, minHeight);
}

/**
 * Возвращает высоту одной строки picker-а.
 */
export function resolveWheelItemHeight(viewportHeight: number, visibleRows: number): number {
	const safeVisibleRows = Math.max(1, visibleRows);
	return Math.max(1, Math.round(viewportHeight / safeVisibleRows));
}

/**
 * Возвращает отступы сверху и снизу, чтобы выбранное значение всегда было по центру.
 */
export function resolveWheelEdgePadding(viewportHeight: number, itemHeight: number): number {
	return Math.max(0, Math.round(viewportHeight / 2 - itemHeight / 2));
}

/**
 * Возвращает scrollTop, при котором значение с данным индексом окажется в центре viewport.
 */
export function resolveWheelScrollTop(index: number, itemHeight: number): number {
	return Math.max(0, Math.round(index * itemHeight));
}

/**
 * Возвращает ближайший индекс по текущему положению scrollTop.
 */
export function resolveClosestWheelIndex(scrollTop: number, itemHeight: number, itemsCount: number): number {
	if (itemsCount <= 0 || itemHeight <= 0) return 0;
	return clampWheelIndex(Math.round(scrollTop / itemHeight), itemsCount);
}
