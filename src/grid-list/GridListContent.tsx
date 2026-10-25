import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { GridContainer } from "../grid";
import { LoadingMessage, Scrollable } from "../misc";
import { CollectionPaginationEffect } from "../virtualized-collection/CollectionPaginationEffect";

import styles from "./GridList.module.scss";
import { type GridListContentProps } from "./gridListTypes";
import { useGridListContent } from "./model/useGridListContent";

/**
 * Карточки — прямые keyed children одной CSS Grid, поэтому перенос в другой ряд
 * не заменяет их React identity. Отдельные пустые ячейки измеряют целые ряды.
 */
export function GridListContent<T>(props: GridListContentProps<T>) {
	const {
		items,
		render,
		minItemWidth,
		gap = "md",
		grouping,
		className,
		isLoading,
		emptyContent,
		hasNextPage = false,
		fetchNextPage,
		"aria-label": ariaLabel = "Сетка"
	} = props;
	const {
		attachProbe,
		attachMetricsProbe,
		columnCount,
		itemCount,
		virtualRows,
		paddingStart,
		totalSize,
		attachScrollElement,
		measureElement,
		paginationItems
	} = useGridListContent(props);
	return (
		<Scrollable
			ref={attachScrollElement}
			className={cn("flex1 h100", styles.viewport, className)}
			role="region"
			aria-label={ariaLabel}
			tabIndex={0}
			overscroll>
			<GridContainer
				ref={attachProbe}
				data-grid-list-layout=""
				aria-hidden="true"
				className={styles.sizingProbe}
				templateColumns={`repeat(auto-fill, minmax(min(100%, ${minItemWidth}), 1fr))`}
				gap={gap}>
				<span
					ref={attachMetricsProbe}
					className={styles.metricsProbe}
					style={{ width: minItemWidth, height: `calc(1lh + ${gap === "none" ? "0px" : `var(--space-${gap})`})` }}
				/>
			</GridContainer>
			{fetchNextPage && (
				<CollectionPaginationEffect
					virtualItems={paginationItems}
					currentItemsCount={itemCount}
					hasNextPage={hasNextPage}
					fetchNextPage={fetchNextPage}
				/>
			)}
			{items.length === 0 && isLoading ? (
				<LoadingMessage text="Загрузка сетки" />
			) : items.length === 0 && !hasNextPage ? (
				emptyContent
			) : (
				<GridContainer
					as="ul"
					templateColumns={`repeat(${columnCount}, minmax(0, 1fr))`}
					autoRows="max-content"
					alignContent="start"
					gap={gap}
					style={{ height: totalSize, paddingBlockStart: paddingStart }}>
					{/* flatMap принципиален: Fragment или вложенный массив на ряд снова привяжет identity карточки к ряду. */}
					{virtualRows.flatMap(({ key, index, row }, windowIndex) => {
						const gridRow = windowIndex + 1;
						if (row?.kind !== "items") {
							return [
								<li
									key={JSON.stringify(["full-row", key])}
									ref={measureElement}
									data-index={index}
									role="presentation"
									className={styles.cell}
									style={{ gridRow, gridColumn: "1 / -1" }}>
									{row === undefined ? (
										<LoadingMessage text="Загрузка следующей страницы" />
									) : (
										grouping?.render(row.groupKey, row.items)
									)}
								</li>
							];
						}
						return [
							<li
								key={JSON.stringify(["measure", key])}
								ref={measureElement}
								data-grid-list-measure=""
								data-index={index}
								role="presentation"
								aria-hidden="true"
								className={styles.rowProbe}
								style={{ gridRow, gridColumn: "1 / -1" }}
							/>,
							...row.entries.map((entry, columnIndex) => (
								<li
									key={JSON.stringify(["item", entry.key])}
									aria-posinset={entry.position}
									aria-setsize={itemCount}
									className={styles.cell}
									style={{ gridRow, gridColumn: columnIndex + 1 }}>
									{render(entry.item)}
								</li>
							))
						];
					})}
				</GridContainer>
			)}
		</Scrollable>
	);
}
