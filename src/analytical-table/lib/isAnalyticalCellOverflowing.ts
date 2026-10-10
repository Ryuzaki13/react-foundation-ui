/** Допуск в один пиксель устраняет ложный overflow при субпиксельном округлении. */
export function isAnalyticalCellOverflowing(element: HTMLElement) {
	return element.scrollWidth > element.clientWidth + 1;
}
