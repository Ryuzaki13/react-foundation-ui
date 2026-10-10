import { type AnalyticalModelRow } from "@ryuzaki13/react-foundation-lib/analytical-table";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

import { analyticalCellId } from "../lib/analyticalCellId";
import { ANALYTICAL_TREE_COLUMN } from "../lib/analyticalTableLayout";
import { isAnalyticalGroupingDisplayed } from "../lib/isAnalyticalGroupingDisplayed";
import { type AnalyticalFocus } from "../model/useAnalyticalFocus";
import { type AnalyticalTableProps, type AnalyticalTableRuntime } from "../types/analyticalTable";

import styles from "./AnalyticalTable.module.scss";

/** Служебная tree-колонка остаётся отдельной от предметных ячеек и всегда закреплена. */
type AnalyticalTreeCellProps<T> = Readonly<{
	instanceId: string;
	row: AnalyticalModelRow<T>;
	runtime: AnalyticalTableRuntime<T>;
	options: AnalyticalTableProps<T>;
	focus: AnalyticalFocus<T>;
	offset: number;
	labelWidth: number;
	treeWidth: number;
}>;

export function AnalyticalTreeCell<T>({
	instanceId,
	row,
	runtime,
	options,
	focus,
	offset,
	labelWidth,
	treeWidth
}: AnalyticalTreeCellProps<T>) {
	const level = runtime.state.grouping?.find((group) => group.id === row.groupingLevelId);
	const label = isAnalyticalGroupingDisplayed(level, runtime.visibleColumns)
		? null
		: (options.renderTreeLabel?.(row) ??
			(level ? (level.displayColumnIds ?? level.keyColumnIds).map((id) => String(row.values[id] ?? "")).join(" · ") : null));
	return (
		<td
			id={analyticalCellId(instanceId, row.id, ANALYTICAL_TREE_COLUMN)}
			data-analytical-row-id={row.id}
			data-analytical-column-id={ANALYTICAL_TREE_COLUMN}
			className={styles.treeCell}
			style={{ insetInlineStart: offset }}
			aria-haspopup="menu"
			tabIndex={focus.tabIndex(row.id, ANALYTICAL_TREE_COLUMN)}
			onFocus={(event) => {
				if (event.target === event.currentTarget) focus.focusCell({ rowId: row.id, columnId: ANALYTICAL_TREE_COLUMN });
			}}
			onKeyDown={(event) => {
				if (event.target !== event.currentTarget || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
				if ((event.key === " " || event.key === "Enter") && row.isExpandable) {
					event.preventDefault();
					event.stopPropagation();
					runtime.toggleRow(row.id);
				} else if (focus.navigate(row.id, ANALYTICAL_TREE_COLUMN, event.key)) {
					event.preventDefault();
					event.stopPropagation();
				}
			}}>
			<div className={styles.treeCellInner} style={{ paddingInlineStart: row.level * 8 + 3 }}>
				{row.isExpandable ? (
					<button
						type="button"
						data-action="toggle-analytical-row"
						data-row-id={row.id}
						className={styles.treeExpanderButton}
						data-has-label={Boolean(label) || undefined}
						style={{ maxWidth: Math.max(24, (row.kind === "group" && label ? labelWidth : treeWidth) - row.level * 8 - 3) }}
						title={typeof label === "string" ? label : undefined}
						aria-expanded={row.isExpanded}
						aria-label={`${row.isExpanded ? "Свернуть" : "Развернуть"} ${options.getRowLabel?.(row) ?? "строку"}`}
						onClick={() => runtime.toggleRow(row.id)}>
						{row.isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
						<span className="textOverflow">{label}</span>
					</button>
				) : (
					<span className="textOverflow">{label}</span>
				)}
			</div>
		</td>
	);
}
