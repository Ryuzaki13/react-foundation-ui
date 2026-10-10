import { type CSSProperties } from "react";

import { type AnalyticalModelRow } from "@ryuzaki13/react-foundation-lib/analytical-table";
import { isTableInteractiveElement } from "@ryuzaki13/react-foundation-lib/table";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { type VirtualItem } from "@tanstack/react-virtual";

import { ANALYTICAL_SELECTION_WIDTH, type AnalyticalTableLayout } from "../lib/analyticalTableLayout";
import { type AnalyticalFocus } from "../model/useAnalyticalFocus";
import { type AnalyticalSelection } from "../model/useAnalyticalSelection";
import { type AnalyticalTableProps, type AnalyticalTableRuntime } from "../types/analyticalTable";

import { AnalyticalSelectionCell } from "./AnalyticalSelectionCell";
import styles from "./AnalyticalTable.module.scss";
import { AnalyticalTableCell } from "./AnalyticalTableCell";
import { AnalyticalTreeCell } from "./AnalyticalTreeCell";

/** Строка не вычисляет формулы и агрегаты: готовая проекция повторно используется всеми ячейками. */
type AnalyticalTableRowProps<T> = Readonly<{
	row: AnalyticalModelRow<T>;
	item: VirtualItem;
	instanceId: string;
	runtime: AnalyticalTableRuntime<T>;
	layout: AnalyticalTableLayout;
	selection: AnalyticalSelection<T>;
	focus: AnalyticalFocus<T>;
	options: AnalyticalTableProps<T>;
	measure: (element: HTMLTableRowElement | null) => void;
}>;

export function AnalyticalTableRow<T>({
	row,
	item,
	instanceId,
	runtime,
	layout,
	selection,
	focus,
	options,
	measure
}: AnalyticalTableRowProps<T>) {
	return (
		<tr
			ref={measure}
			data-index={item.index}
			data-row-id={row.id}
			aria-level={row.level + 1}
			aria-selected={selection.rowMode === "none" ? undefined : Boolean(selection.rows[row.id])}
			className={cn(
				styles.dataRow,
				selection.rowMode !== "none" && styles.dataRowSelectable,
				selection.rows[row.id] && styles.rowSelected
			)}
			style={{ "--row-height": `${item.size}px` } as CSSProperties}
			onClick={(event) => {
				if (
					selection.rowMode === "none" ||
					event.button !== 0 ||
					event.ctrlKey ||
					event.metaKey ||
					event.altKey ||
					event.shiftKey ||
					isTableInteractiveElement(event.target, "[data-analytical-column-id='__analytical_tree__']")
				)
					return;
				if (selection.cellMode === "none" || options.cellSelectionActivationMode === "primary-modifier") selection.selectRow(row);
			}}
			onKeyDown={(event) => {
				if (
					event.defaultPrevented ||
					selection.rowMode === "none" ||
					event.ctrlKey ||
					event.metaKey ||
					event.altKey ||
					event.shiftKey ||
					isTableInteractiveElement(event.target, "[data-analytical-column-id='__analytical_tree__']")
				)
					return;
				if (
					(event.key === " " || event.key === "Enter") &&
					(selection.cellMode === "none" || options.cellSelectionActivationMode === "primary-modifier")
				) {
					event.preventDefault();
					selection.selectRow(row);
				}
			}}>
			<AnalyticalSelectionCell row={row} selection={selection} instanceId={instanceId} />
			<AnalyticalTreeCell
				row={row}
				runtime={runtime}
				options={options}
				focus={focus}
				instanceId={instanceId}
				labelWidth={layout.treeLabelWidth}
				treeWidth={layout.treeWidth}
				offset={selection.rowMode === "none" ? 0 : ANALYTICAL_SELECTION_WIDTH}
			/>
			{runtime.visibleColumns.map((column) => (
				<AnalyticalTableCell
					key={column.id}
					row={row}
					column={column}
					runtime={runtime}
					selection={selection}
					focus={focus}
					instanceId={instanceId}
					offset={layout.pinnedOffsets.get(column.id)}
					options={options}
				/>
			))}
		</tr>
	);
}
