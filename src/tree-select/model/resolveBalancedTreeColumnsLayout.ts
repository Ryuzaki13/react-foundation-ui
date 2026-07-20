export type BalancedTreeColumnsLayoutInput = {
	itemCount: number;
	availableWidth: number;
	availableHeight: number;
	viewportWidth: number;
	viewportHeight: number;
	referenceWidth: number;
};

export type BalancedTreeColumnsLayout = {
	columnCount: number;
	rowCount: number;
	width: number;
	minWidth: number;
	maxHeight: number;
};

const VIEWPORT_PADDING = 8;
const POPUP_HORIZONTAL_PADDING = 16;
const POPUP_CHROME_HEIGHT = 48;
const COLUMN_WIDTH = 224;
const COLUMN_GAP = 10;
const OPTION_HEIGHT = 32;
const MAX_COLUMN_COUNT = 6;

function normalizePositiveDimension(value: number, fallback: number) {
	return Number.isFinite(value) && value > 0 ? value : fallback;
}

/**
 * Выбирает количество колонок по фактически доступной Floating UI геометрии.
 * Оценка одновременно штрафует переполнение, вытянутую форму и пустые ячейки,
 * поэтому popup стремится к компактной средней пропорции, но не выходит за viewport.
 */
export function resolveBalancedTreeColumnsLayout({
	itemCount,
	availableWidth,
	availableHeight,
	viewportWidth,
	viewportHeight,
	referenceWidth
}: BalancedTreeColumnsLayoutInput): BalancedTreeColumnsLayout {
	const normalizedItemCount = Math.max(0, Math.floor(Number.isFinite(itemCount) ? itemCount : 0));
	const normalizedAvailableWidth = normalizePositiveDimension(availableWidth, COLUMN_WIDTH + POPUP_HORIZONTAL_PADDING);
	const normalizedAvailableHeight = normalizePositiveDimension(availableHeight, OPTION_HEIGHT + POPUP_CHROME_HEIGHT);
	const normalizedViewportWidth = normalizePositiveDimension(viewportWidth, normalizedAvailableWidth + VIEWPORT_PADDING * 2);
	const normalizedViewportHeight = normalizePositiveDimension(viewportHeight, normalizedAvailableHeight);
	const widthLimit = Math.max(1, Math.min(normalizedAvailableWidth, Math.max(1, normalizedViewportWidth - VIEWPORT_PADDING * 2)));
	const heightLimit = Math.max(1, Math.min(normalizedAvailableHeight, normalizedViewportHeight * 0.75));
	const normalizedReferenceWidth = Math.max(1, normalizePositiveDimension(referenceWidth, 1));
	const minWidth = Math.min(widthLimit, normalizedReferenceWidth);
	const maxColumnsByWidth = Math.max(1, Math.floor((widthLimit - POPUP_HORIZONTAL_PADDING + COLUMN_GAP) / (COLUMN_WIDTH + COLUMN_GAP)));
	const maxColumnCount = Math.max(1, Math.min(MAX_COLUMN_COUNT, maxColumnsByWidth, normalizedItemCount || 1));

	let bestColumnCount = 1;
	let bestScore = Number.POSITIVE_INFINITY;

	for (let columnCount = 1; columnCount <= maxColumnCount; columnCount += 1) {
		const rowCount = Math.ceil(normalizedItemCount / columnCount);
		const naturalWidth = Math.max(minWidth, POPUP_HORIZONTAL_PADDING + columnCount * COLUMN_WIDTH + (columnCount - 1) * COLUMN_GAP);
		const naturalHeight = POPUP_CHROME_HEIGHT + rowCount * OPTION_HEIGHT;
		const widthRatio = naturalWidth / widthLimit;
		const heightRatio = naturalHeight / heightLimit;
		const emptyCellPenalty = normalizedItemCount ? (columnCount * rowCount - normalizedItemCount) / normalizedItemCount : 0;
		const score =
			Math.max(widthRatio, heightRatio) +
			0.25 * Math.abs(widthRatio - heightRatio) +
			0.01 * emptyCellPenalty +
			0.04 * (columnCount - 1);

		if (score < bestScore) {
			bestScore = score;
			bestColumnCount = columnCount;
		}
	}

	const rowCount = Math.ceil(normalizedItemCount / bestColumnCount);
	const naturalWidth = Math.max(minWidth, POPUP_HORIZONTAL_PADDING + bestColumnCount * COLUMN_WIDTH + (bestColumnCount - 1) * COLUMN_GAP);

	return {
		columnCount: bestColumnCount,
		rowCount,
		width: Math.min(widthLimit, naturalWidth),
		minWidth,
		maxHeight: heightLimit
	};
}
