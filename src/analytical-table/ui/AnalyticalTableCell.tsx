import { type AnalyticalModelRow } from "@ryuzaki13/react-foundation-lib/analytical-table";
import { resolveValueStateClassName } from "@ryuzaki13/react-foundation-lib/formatters";
import { isTableInteractiveElement, shouldActivateTableCellSelection } from "@ryuzaki13/react-foundation-lib/table";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { RenderStateIcon } from "../../misc";
import { analyticalCellId } from "../lib/analyticalCellId";
import { resolveAnalyticalCellDisplay } from "../lib/formatAnalyticalCell";
import { isAnalyticalGroupingDisplayed } from "../lib/isAnalyticalGroupingDisplayed";
import { type AnalyticalFocus } from "../model/useAnalyticalFocus";
import { type AnalyticalSelection } from "../model/useAnalyticalSelection";
import { type AnalyticalTableColumn, type AnalyticalTableProps, type AnalyticalTableRuntime } from "../types/analyticalTable";

import styles from "./AnalyticalTable.module.scss";
import { AnalyticalTableCellValue } from "./AnalyticalTableCellValue";

/** Интерактивный renderer сохраняет собственные click/keyboard события. */
type AnalyticalTableCellProps<T> = Readonly<{
	instanceId: string;
	row: AnalyticalModelRow<T>;
	column: AnalyticalTableColumn<T>;
	selection: AnalyticalSelection<T>;
	focus: AnalyticalFocus<T>;
	offset?: number;
	options: AnalyticalTableProps<T>;
	runtime: AnalyticalTableRuntime<T>;
}>;

export function AnalyticalTableCell<T>({
	instanceId,
	row,
	column,
	selection,
	focus,
	offset,
	options,
	runtime
}: AnalyticalTableCellProps<T>) {
	const display = resolveAnalyticalCellDisplay(column, row, runtime.formattingFields[column.id]);
	const level = runtime.state.grouping?.find((level) => level.id === row.groupingLevelId);
	const levelIds = level ? [...level.keyColumnIds, ...(level.displayColumnIds ?? [])] : [];
	const groupedDimensionHidden =
		row.kind === "group" &&
		column.kind !== "measure" &&
		!runtime.formattingFields[column.id]?.formattersPipelineExecutor?.hasRowBasedOverride &&
		(!isAnalyticalGroupingDisplayed(level, runtime.visibleColumns) || !levelIds.includes(column.id));
	const renderer = row.kind === "group" ? column.renderGroup : column.render;
	const selected = selection.isCellSelected(row.id, column.id);
	const activation = options.cellSelectionActivationMode ?? "direct";
	const coordinates = { rowId: row.id, columnId: column.id };
	return (
		<td
			id={analyticalCellId(instanceId, row.id, column.id)}
			data-analytical-row-id={row.id}
			data-analytical-column-id={column.id}
			aria-selected={selection.cellMode === "none" ? undefined : selected}
			aria-haspopup="menu"
			className={cn(
				styles.cell,
				selection.cellMode !== "none" && styles.cellSelectable,
				resolveValueStateClassName(display.state),
				row.kind === "group" && styles.cellGrouped,
				selected && styles.cellSelected,
				offset !== undefined && styles.cellPinned,
				column.kind === "measure" && styles.cellMeasure
			)}
			style={{ insetInlineStart: offset, textAlign: column.align ?? (column.kind === "measure" ? "end" : "start") }}
			tabIndex={focus.tabIndex(row.id, column.id)}
			onFocus={(event) => {
				if (event.target === event.currentTarget) focus.focusCell(coordinates);
			}}
			onClick={(event) => {
				if (event.button !== 0 || isTableInteractiveElement(event.target)) return;
				focus.focusCell(coordinates);
				if (selection.cellMode !== "none" && shouldActivateTableCellSelection(event, activation)) {
					event.stopPropagation();
					selection.selectCell(coordinates);
				}
			}}
			onKeyDown={(event) => {
				if (isTableInteractiveElement(event.target)) return;
				if (!event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey && focus.navigate(row.id, column.id, event.key)) {
					event.preventDefault();
					event.stopPropagation();
					return;
				}
				if (
					(event.key === " " || event.key === "Enter") &&
					selection.cellMode !== "none" &&
					shouldActivateTableCellSelection(event, activation)
				) {
					event.preventDefault();
					event.stopPropagation();
					selection.selectCell(coordinates);
				}
			}}>
			{renderer ? (
				<div className={styles.cellCustomContent}>{renderer({ row, column, value: row.values[column.id] })}</div>
			) : (
				<div className={styles.cellContent} data-measure={column.kind === "measure" || undefined}>
					{!groupedDimensionHidden ? (
						<>
							{display.showIcon && display.iconPosition === "left" ? <RenderStateIcon state={display.icon} /> : null}
							{display.showValue ? (
								<AnalyticalTableCellValue
									display={display.value == null ? "" : String(display.value)}
									isMeasure={column.kind === "measure"}
									overflowTooltip={column.tooltip !== false}
								/>
							) : null}
							{display.showIcon && display.iconPosition === "right" ? <RenderStateIcon state={display.icon} /> : null}
						</>
					) : null}
				</div>
			)}
		</td>
	);
}
