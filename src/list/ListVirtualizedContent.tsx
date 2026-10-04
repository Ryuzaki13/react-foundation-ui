import { useMemo } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { LoadingMessage, Scrollable } from "../misc";

import { ListPaginationEffect } from "./ListPaginationEffect";
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
	const entriesByKey = useMemo(() => new Map(items.map((item, index) => [getKey(item, index), { item, index }])), [items, getKey]);
	const { virtualItems, totalSize, attachScrollElement, measureElement } = useListVirtualizer({
		items,
		getKey,
		hasNextPage,
		estimateSize,
		overscan,
		preserveScrollAnchor,
		resetKey,
		onVisibleKeysChange
	});

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
					virtualItems={virtualItems}
					currentItemsCount={items.length}
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
						return (
							<li
								key={row.key}
								ref={measureElement}
								data-index={entry?.index ?? items.length}
								aria-posinset={entry === undefined ? undefined : entry.index + 1}
								aria-setsize={entry === undefined ? undefined : items.length}
								style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${row.start}px)` }}
								className={cn(separated && "borderBottom")}>
								{entry === undefined ? <LoadingMessage text="Загрузка следующей страницы" /> : render(entry.item)}
							</li>
						);
					})}
				</ul>
			)}
		</Scrollable>
	);
}
