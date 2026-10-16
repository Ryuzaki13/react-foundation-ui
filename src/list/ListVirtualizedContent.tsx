import { useMemo } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { LoadingMessage, Scrollable } from "../misc";

import { buildListRows } from "./lib/buildListRows";
import { getListRowAnchorKeys } from "./lib/getListRowAnchorKeys";
import { getListRowKey } from "./lib/getListRowKey";
import { getListRowVisibleKeys } from "./lib/getListRowVisibleKeys";
import { projectListPaginationItems } from "./lib/projectListPaginationItems";
import { ListPaginationEffect } from "./ListPaginationEffect";
import { ListRowContent } from "./ListRowContent";
import styles from "./ListVirtualizedContent.module.scss";
import { type ListVirtualizedContentProps } from "./listVirtualizedContentTypes";
import { useListVirtualizer } from "./model/useListVirtualizer";

/** Отображает DOM-окно полного или постраничного набора, не управляя данными потребителя. */
export function ListVirtualizedContent<T>({
	items,
	getKey,
	render,
	separated,
	className,
	columns,
	grouping,
	isLoading,
	hasNextPage = false,
	fetchNextPage,
	estimateSize = 120,
	overscan = 5,
	preserveScrollAnchor = true,
	resetKey,
	onVisibleKeysChange,
	emptyContent,
	"aria-label": ariaLabel = "Список"
}: ListVirtualizedContentProps<T>) {
	// Между render новых данных и commit геометрии снимок ещё может содержать
	// старые индексы. Сопоставление по ключу не передаёт чужие данные живой строке.
	const { rows, itemCount } = useMemo(() => buildListRows({ items, getKey, columns, grouping }), [items, getKey, columns, grouping]);
	const entriesByKey = useMemo(() => new Map(rows.map((row, index) => [row.key, { row, index }])), [rows]);
	const { virtualItems, totalSize, attachScrollElement, measureElement } = useListVirtualizer({
		items: rows,
		getKey: getListRowKey,
		getAnchorKeys: getListRowAnchorKeys,
		getVisibleKeys: getListRowVisibleKeys,
		hasNextPage,
		estimateSize,
		overscan,
		preserveScrollAnchor,
		resetKey,
		onVisibleKeysChange
	});
	const paginationItems = useMemo(
		() => projectListPaginationItems(virtualItems, entriesByKey, itemCount),
		[virtualItems, entriesByKey, itemCount]
	);

	return (
		<Scrollable
			ref={attachScrollElement}
			className={cn(styles.viewport, className)}
			role="region"
			aria-label={ariaLabel}
			tabIndex={0}
			overscroll>
			{fetchNextPage && (
				<ListPaginationEffect
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
						const showSeparator = separated && entry?.row.kind === "items" && (entry.index < rows.length - 1 || hasNextPage);
						const isItem = entry?.row.kind === "items" && columns === undefined;
						return (
							<li
								key={row.key}
								ref={measureElement}
								data-index={entry?.index ?? rows.length}
								role={
									entry?.row.kind === "group" || columns !== undefined || (grouping !== undefined && entry === undefined)
										? "presentation"
										: undefined
								}
								aria-posinset={isItem && entry?.row.kind === "items" ? entry.row.entries[0]?.position : undefined}
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
