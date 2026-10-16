import { type ReactNode } from "react";

import { GridContainer } from "../grid";

import { resolveListColumnTemplate } from "./lib/resolveListColumnTemplate";
import { type ListColumns, type ListGrouping } from "./listLayoutTypes";
import { type ListRow } from "./model/listRowTypes";

type ListRowContentProps<T> = {
	readonly row: ListRow<T>;
	readonly render: (item: T) => ReactNode;
	readonly columns?: ListColumns;
	readonly grouping?: ListGrouping<T>;
	readonly itemCount: number;
};

/** Ячейки сохраняют семантику исходного списка; внешний ряд служит только измерению и раскладке. */
export function ListRowContent<T>({ row, render, columns, grouping, itemCount }: ListRowContentProps<T>) {
	if (row.kind === "group") return grouping?.render(row.groupKey, row.items);
	if (columns === undefined) {
		const entry = row.entries[0];
		return entry === undefined ? null : render(entry.item);
	}
	return (
		<GridContainer templateColumns={resolveListColumnTemplate(columns)}>
			{row.entries.map((entry) => (
				<div key={entry.key} role="listitem" aria-posinset={entry.position} aria-setsize={itemCount} style={{ minWidth: 0 }}>
					{render(entry.item)}
				</div>
			))}
		</GridContainer>
	);
}
