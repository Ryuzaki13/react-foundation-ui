import { useMemo } from "react";

import { buildCollectionRows } from "../../collection-layout/lib/buildCollectionRows";
import { getCollectionRowAnchorKeys } from "../../collection-layout/lib/getCollectionRowAnchorKeys";
import { getCollectionRowKey } from "../../collection-layout/lib/getCollectionRowKey";
import { getCollectionRowVisibleKeys } from "../../collection-layout/lib/getCollectionRowVisibleKeys";
import { projectCollectionPaginationItems } from "../../collection-layout/lib/projectCollectionPaginationItems";
import { useCollectionVirtualizer } from "../../virtualized-collection/model/useCollectionVirtualizer";
import { type GridListContentProps } from "../gridListTypes";
import { projectGridListWindow } from "../lib/projectGridListWindow";

import { type GridListContentModel } from "./gridListContentModelTypes";
import { useGridListLayout } from "./useGridListLayout";

/** Упаковка всего источника зависит от реальной ширины, а не от прежних границ рядов. */
export function useGridListContent<T>({
	items,
	getKey,
	grouping,
	minItemWidth,
	gap = "md",
	maxColumns,
	hasNextPage = false,
	estimateSize = 120,
	overscan = 5,
	preserveScrollAnchor = true,
	resetKey,
	onVisibleKeysChange
}: GridListContentProps<T>): GridListContentModel<T> {
	if (maxColumns !== undefined && (!Number.isSafeInteger(maxColumns) || maxColumns < 1)) {
		throw new RangeError("GridList: maxColumns должен быть положительным целым числом.");
	}
	const layout = useGridListLayout(minItemWidth, gap);
	const columnCount = Math.min(layout.columnCount, maxColumns ?? layout.columnCount);
	const { rows, itemCount } = useMemo(
		() => buildCollectionRows({ items, getKey, columns: { count: columnCount }, grouping }),
		[items, getKey, columnCount, grouping]
	);
	const rowsByKey = useMemo(() => new Map(rows.map((row, index) => [row.key, { row, index }])), [rows]);
	const rowIndexesByAnchor = useMemo(
		() => new Map(rows.flatMap((row, index) => getCollectionRowAnchorKeys(row).map((key) => [key, index] as const))),
		[rows]
	);
	const { virtualItems, anchorKeys, ...virtualizer } = useCollectionVirtualizer({
		items: rows,
		getKey: getCollectionRowKey,
		getAnchorKeys: getCollectionRowAnchorKeys,
		getVisibleKeys: getCollectionRowVisibleKeys,
		hasNextPage,
		estimateSize,
		overscan,
		gap: layout.rowGap,
		// Даже при прежнем count новая ширина меняет перенос текста и высоты невидимых рядов.
		measurementKey: `${layout.measurementKey}:${columnCount}`,
		// В отличие от абсолютных строк List, новые CSS-ряды меняют высоту
		// соседних probes. Core обрабатывает их resize вне текущей RO delivery.
		useAnimationFrameWithResizeObserver: true,
		preserveScrollAnchor,
		resetKey,
		onVisibleKeysChange
	});
	const paginationItems = useMemo(
		() => projectCollectionPaginationItems(virtualItems, rowsByKey, itemCount),
		[virtualItems, rowsByKey, itemCount]
	);
	const virtualRows = useMemo(
		() => projectGridListWindow(rows, rowIndexesByAnchor, anchorKeys, virtualItems, hasNextPage),
		[rows, rowIndexesByAnchor, anchorKeys, virtualItems, hasNextPage]
	);
	return {
		...virtualizer,
		attachProbe: layout.attachProbe,
		attachMetricsProbe: layout.attachMetricsProbe,
		paddingStart: virtualItems[0]?.start ?? 0,
		columnCount,
		itemCount,
		virtualRows,
		paginationItems
	};
}
