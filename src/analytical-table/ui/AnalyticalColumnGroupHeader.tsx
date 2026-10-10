import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";

import { type AnalyticalTableColumnGroup, type AnalyticalTableRuntime } from "../types/analyticalTable";

import styles from "./AnalyticalTable.module.scss";

/** Группа разбивается на сегменты на границе pinned-зоны, чтобы sticky colspan не перекрывал соседей. */
type AnalyticalColumnGroupHeaderProps<T> = Readonly<{
	group?: AnalyticalTableColumnGroup;
	count: number;
	offset?: number;
	runtime: AnalyticalTableRuntime<T>;
}>;

export function AnalyticalColumnGroupHeader<T>({ group, count, offset, runtime }: AnalyticalColumnGroupHeaderProps<T>) {
	const collapsed = group ? runtime.state.collapsedColumnGroupIds?.includes(group.id) : false;
	return (
		<th
			scope="colgroup"
			colSpan={count}
			className={cn(styles.headerGroup, group && styles.headerIsGroup)}
			style={{
				position: offset === undefined ? undefined : "sticky",
				insetInlineStart: offset,
				zIndex: offset === undefined ? undefined : 40
			}}>
			{group ? (
				<button
					type="button"
					data-action="toggle-analytical-column-group"
					data-column-group-id={group.id}
					aria-expanded={!collapsed}
					onClick={() =>
						runtime.patchState({
							collapsedColumnGroupIds: collapsed
								? runtime.state.collapsedColumnGroupIds?.filter((id) => id !== group.id)
								: [...(runtime.state.collapsedColumnGroupIds ?? []), group.id]
						})
					}>
					{group.label} {collapsed ? <ChevronsRightIcon /> : <ChevronsLeftIcon />}
				</button>
			) : null}
		</th>
	);
}
