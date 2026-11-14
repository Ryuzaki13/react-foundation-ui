import { useMemo } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { buildCollectionRows } from "../collection-layout/lib/buildCollectionRows";
import { getCollectionRowAnchorKeys } from "../collection-layout/lib/getCollectionRowAnchorKeys";
import { getCollectionRowKey } from "../collection-layout/lib/getCollectionRowKey";
import { getCollectionRowVisibleKeys } from "../collection-layout/lib/getCollectionRowVisibleKeys";
import { projectCollectionPaginationItems } from "../collection-layout/lib/projectCollectionPaginationItems";
import { COLLECTION_ROW_KIND_ITEMS, COLLECTION_ROW_KIND_GROUP } from "../collection-layout/model/collectionRowConstants";
import { LoadingMessage, Scrollable } from "../misc";
import { CollectionPaginationEffect } from "../virtualized-collection/CollectionPaginationEffect";
import {
	COLLECTION_VIRTUALIZER_ESTIMATED_ROW_HEIGHT_PX,
	COLLECTION_VIRTUALIZER_OVERSCAN_ROWS
} from "../virtualized-collection/model/collectionVirtualizerDefaults";
import { useCollectionVirtualizer } from "../virtualized-collection/model/useCollectionVirtualizer";

import { ListRowContent } from "./ListRowContent";
import styles from "./ListVirtualizedContent.module.scss";
import { type ListVirtualizedContentProps } from "./listVirtualizedContentTypes";

/** Отображает DOM-окно полного или постраничного набора, не управляя данными потребителя. */
export function ListVirtualizedContent<T>({
	items,
	getKey,
	render,
	separated,
	className,
	columns,
	grouping,
	overscroll,
	isLoading,
	hasNextPage = false,
	fetchNextPage,
	estimateSize = COLLECTION_VIRTUALIZER_ESTIMATED_ROW_HEIGHT_PX,
	overscan = COLLECTION_VIRTUALIZER_OVERSCAN_ROWS,
	preserveScrollAnchor = true,
	resetKey,
	onVisibleKeysChange,
	emptyContent,
	"aria-label": ariaLabel = "Список"
}: ListVirtualizedContentProps<T>) {
	// Между render новых данных и commit геометрии снимок ещё может содержать
	// старые индексы. Сопоставление по ключу не передаёт чужие данные живой строке.
	const { rows, itemCount } = useMemo(
		() => buildCollectionRows({ items, getKey, columns, grouping }),
		[items, getKey, columns, grouping]
	);
	const entriesByKey = useMemo(() => new Map(rows.map((row, index) => [row.key, { row, index }])), [rows]);
	const { virtualItems, totalSize, attachScrollElement, measureElement } = useCollectionVirtualizer({
		items: rows,
		getKey: getCollectionRowKey,
		getAnchorKeys: getCollectionRowAnchorKeys,
		getVisibleKeys: getCollectionRowVisibleKeys,
		hasNextPage,
		estimateSize,
		overscan,
		preserveScrollAnchor,
		resetKey,
		onVisibleKeysChange
	});
	const paginationItems = useMemo(
		() => projectCollectionPaginationItems(virtualItems, entriesByKey, itemCount),
		[virtualItems, entriesByKey, itemCount]
	);

	return (
		<Scrollable
			ref={attachScrollElement}
			className={cn(styles.viewport, className)}
			role="region"
			aria-label={ariaLabel}
			tabIndex={0}
			overscroll={overscroll}>
			{fetchNextPage && (
				<CollectionPaginationEffect
					virtualItems={paginationItems}
					currentItemsCount={itemCount}
					hasNextPage={hasNextPage}
					fetchNextPage={fetchNextPage}
				/>
			)}
			{items.length === 0 && isLoading ? (
				<LoadingMessage text="Загрузка списка" />
			) : items.length === 0 && !hasNextPage ? (
				emptyContent
			) : (
				<ul style={{ height: totalSize }} className="relative w100">
					{virtualItems.map((row) => {
						const entry = typeof row.key === "string" ? entriesByKey.get(row.key) : undefined;
						if (entry === undefined && (typeof row.key === "string" || !hasNextPage)) return null;
						// Последняя строка DOM-окна не обязательно завершает набор. Реальная
						// последняя запись сохраняет разделитель перед следующей страницей,
						// а служебный loading sentinel собственного разделителя не получает.
						const showSeparator =
							separated && entry?.row.kind === COLLECTION_ROW_KIND_ITEMS && (entry.index < rows.length - 1 || hasNextPage);
						const isItem = entry?.row.kind === COLLECTION_ROW_KIND_ITEMS && columns === undefined;
						return (
							<li
								key={row.key}
								ref={measureElement}
								data-index={entry?.index ?? rows.length}
								role={
									entry?.row.kind === COLLECTION_ROW_KIND_GROUP ||
									columns !== undefined ||
									(grouping !== undefined && entry === undefined)
										? "presentation"
										: undefined
								}
								aria-posinset={
									isItem && entry?.row.kind === COLLECTION_ROW_KIND_ITEMS ? entry.row.entries[0]?.position : undefined
								}
								aria-setsize={isItem ? itemCount : undefined}
								style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${row.start}px)` }}
								className={cn(styles.item, showSeparator && styles.separator)}>
								{entry === undefined ? (
									<LoadingMessage text="Загрузка следующей страницы" />
								) : (
									<ListRowContent
										row={entry.row}
										render={render}
										columns={columns}
										grouping={grouping}
										itemCount={itemCount}
									/>
								)}
							</li>
						);
					})}
				</ul>
			)}
		</Scrollable>
	);
}
