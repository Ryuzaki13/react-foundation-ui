import type { TreeColumnsLayoutDescriptor, TreeColumnsRootGroupDescriptor } from "./buildTreeColumnsLayoutDescriptor";

export type BalancedTreeColumnsLayoutInput = {
	descriptor: TreeColumnsLayoutDescriptor;
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
	placements: readonly TreeColumnPlacement[];
};

/** Явная 1-based CSS-grid координата строки с неизменным option index. */
export type TreeColumnPlacement = {
	column: number;
	row: number;
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

/** Результат одной симуляции packing для заданной логической высоты колонки. */
export type ResolvedTreeColumnsPlacements = {
	placements: TreeColumnPlacement[];
	usedColumnCount: number;
	intentionalGapCount: number;
};

/**
 * Выбирает начало root-группы, которое нельзя оставлять в хвосте колонки.
 *
 * Целая группа имеет приоритет, затем используется prefix до второго прямого
 * child. Если глубокий subtree делает prefix выше колонки, защищаются первые
 * три визуальные строки — минимальная гарантия от одинокого root.
 */
function resolveProtectedItemCount(group: TreeColumnsRootGroupDescriptor, rowCount: number) {
	const groupSize = group.endIndexExclusive - group.startIndex;
	if (groupSize <= rowCount) return groupSize;

	if (group.protectedPrefixEndIndexExclusive === undefined) return 0;

	const protectedPrefixSize = group.protectedPrefixEndIndexExclusive - group.startIndex;
	return protectedPrefixSize <= rowCount ? protectedPrefixSize : Math.min(3, groupSize);
}

/**
 * Симулирует CSS-grid packing и сохраняет DOM preorder через явные координаты.
 *
 * Намеренный перенос оставляет хвост предыдущей колонки пустым: последующие
 * группы не заполняют gap, поэтому визуальная последовательность не расходится
 * с option indexes, refs и keyboard navigation.
 */
export function resolveTreeColumnsPlacements(descriptor: TreeColumnsLayoutDescriptor, rowCount: number): ResolvedTreeColumnsPlacements {
	const normalizedRowCount = Math.max(1, rowCount);
	const placements: TreeColumnPlacement[] = [];
	let column = 1;
	let row = 1;
	let intentionalGapCount = 0;

	for (const group of descriptor.groups) {
		const protectedItemCount = resolveProtectedItemCount(group, normalizedRowCount);
		const remainingRows = normalizedRowCount - row + 1;

		if (row > 1 && protectedItemCount > remainingRows) {
			intentionalGapCount += remainingRows;
			column += 1;
			row = 1;
		}

		for (let index = group.startIndex; index < group.endIndexExclusive; index += 1) {
			placements[index] = { column, row };
			row += 1;

			if (row > normalizedRowCount) {
				column += 1;
				row = 1;
			}
		}
	}

	return {
		placements,
		usedColumnCount: placements.length ? Math.max(...placements.map((placement) => placement.column)) : 1,
		intentionalGapCount
	};
}

/**
 * Выбирает количество колонок по фактически доступной Floating UI геометрии.
 * Для каждого candidate сначала выполняется group-aware packing. Если защитные
 * переносы создали лишнюю колонку, высота логической колонки увеличивается до
 * тех пор, пока placements не попадут в объявленный template grid.
 */
export function resolveBalancedTreeColumnsLayout({
	descriptor,
	availableWidth,
	availableHeight,
	viewportWidth,
	viewportHeight,
	referenceWidth
}: BalancedTreeColumnsLayoutInput): BalancedTreeColumnsLayout {
	const normalizedItemCount = Math.max(0, Math.floor(Number.isFinite(descriptor.itemCount) ? descriptor.itemCount : 0));
	const normalizedAvailableWidth = normalizePositiveDimension(availableWidth, COLUMN_WIDTH + POPUP_HORIZONTAL_PADDING);
	const normalizedAvailableHeight = normalizePositiveDimension(availableHeight, OPTION_HEIGHT + POPUP_CHROME_HEIGHT);
	const normalizedViewportWidth = normalizePositiveDimension(viewportWidth, normalizedAvailableWidth + VIEWPORT_PADDING * 2);
	const normalizedViewportHeight = normalizePositiveDimension(viewportHeight, normalizedAvailableHeight);
	const widthLimit = Math.max(1, Math.min(normalizedAvailableWidth, Math.max(1, normalizedViewportWidth - VIEWPORT_PADDING * 2)));
	const heightLimit = Math.max(1, Math.min(normalizedAvailableHeight, normalizedViewportHeight - VIEWPORT_PADDING * 2));
	const normalizedReferenceWidth = Math.max(1, normalizePositiveDimension(referenceWidth, 1));
	const minWidth = Math.min(widthLimit, normalizedReferenceWidth);
	const maxColumnsByWidth = Math.max(1, Math.floor((widthLimit - POPUP_HORIZONTAL_PADDING + COLUMN_GAP) / (COLUMN_WIDTH + COLUMN_GAP)));
	const maxColumnCount = Math.max(1, Math.min(MAX_COLUMN_COUNT, maxColumnsByWidth, normalizedItemCount || 1));
	const minProtectedRows = descriptor.groups.some((group) => group.protectedPrefixEndIndexExclusive !== undefined) ? 3 : 1;

	if (normalizedItemCount === 0) {
		return {
			columnCount: 1,
			rowCount: 1,
			width: minWidth,
			minWidth,
			maxHeight: heightLimit,
			placements: []
		};
	}

	let bestLayout: BalancedTreeColumnsLayout | undefined;
	let bestScore = Number.POSITIVE_INFINITY;

	for (let candidateColumnCount = 1; candidateColumnCount <= maxColumnCount; candidateColumnCount += 1) {
		let rowCount = Math.max(minProtectedRows, Math.ceil(normalizedItemCount / candidateColumnCount));
		let packed = resolveTreeColumnsPlacements(descriptor, rowCount);

		while (packed.usedColumnCount > candidateColumnCount && rowCount < normalizedItemCount) {
			rowCount += 1;
			packed = resolveTreeColumnsPlacements(descriptor, rowCount);
		}

		const columnCount = packed.usedColumnCount;
		const naturalWidth = Math.max(minWidth, POPUP_HORIZONTAL_PADDING + columnCount * COLUMN_WIDTH + (columnCount - 1) * COLUMN_GAP);
		const naturalHeight = POPUP_CHROME_HEIGHT + rowCount * OPTION_HEIGHT;
		const widthRatio = naturalWidth / widthLimit;
		const heightRatio = naturalHeight / heightLimit;
		const emptyCellPenalty = (columnCount * rowCount - normalizedItemCount) / normalizedItemCount;
		const intentionalGapPenalty = packed.intentionalGapCount / normalizedItemCount;
		const score =
			Math.max(widthRatio, heightRatio) +
			0.25 * Math.abs(widthRatio - heightRatio) +
			0.01 * emptyCellPenalty +
			0.02 * intentionalGapPenalty +
			0.04 * (columnCount - 1);

		if (score < bestScore) {
			bestScore = score;
			bestLayout = {
				columnCount,
				rowCount,
				width: Math.min(widthLimit, naturalWidth),
				minWidth,
				maxHeight: heightLimit,
				placements: packed.placements
			};
		}
	}

	return (
		bestLayout ?? {
			columnCount: 1,
			rowCount: normalizedItemCount,
			width: minWidth,
			minWidth,
			maxHeight: heightLimit,
			placements: resolveTreeColumnsPlacements(descriptor, normalizedItemCount).placements
		}
	);
}
