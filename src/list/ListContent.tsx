import { useMemo, type ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { buildCollectionRows } from "../collection-layout/lib/buildCollectionRows";
import { Scrollable } from "../misc";

import { type ListColumns, type ListGrouping } from "./listLayoutTypes";
import { ListRowContent } from "./ListRowContent";

export interface ListContentProps<T> {
	readonly items: readonly T[];
	readonly getKey: (item: T, index: number) => string;
	readonly render: (item: T) => ReactNode;
	readonly separated?: boolean;
	readonly className?: string;
	/** Встроенная сборка измеряемых строк; группировка для колонок не обязательна. */
	readonly columns?: ListColumns;
	readonly grouping?: ListGrouping<T>;
	readonly overscroll?: boolean;
}

/** Невиртуальный вариант сохраняет прежний API для небольших наборов. */
export function ListContent<T>({ items, getKey, render, separated, className, columns, grouping, overscroll }: ListContentProps<T>) {
	const { rows, itemCount } = useMemo(
		() => buildCollectionRows({ items, getKey, columns, grouping }),
		[items, getKey, columns, grouping]
	);
	return (
		<Scrollable overscroll={overscroll} className={className}>
			{/* NOTE: пустой className необходим, чтобы применить normalize для удаления дефолтных стилей списка */}
			<ul className="">
				{rows.map((row) => (
					<li
						key={row.key}
						role={row.kind === "group" || columns !== undefined ? "presentation" : undefined}
						aria-posinset={grouping && columns === undefined && row.kind === "items" ? row.entries[0]?.position : undefined}
						aria-setsize={grouping && columns === undefined && row.kind === "items" ? itemCount : undefined}
						className={cn(separated && row.kind === "items" && "borderBottom")}>
						<ListRowContent row={row} render={render} columns={columns} grouping={grouping} itemCount={itemCount} />
					</li>
				))}
			</ul>
		</Scrollable>
	);
}
