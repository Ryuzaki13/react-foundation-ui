import { resolveValueStateClassName } from "@ryuzaki13/react-foundation-lib/formatters";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { RenderStateIcon } from "../../misc";
import { resolveAnalyticalTotalDisplay } from "../lib/formatAnalyticalTotal";
import { type AnalyticalTableColumn } from "../types/columns";
import { type AnalyticalTableRuntime } from "../types/runtime";

import styles from "./AnalyticalTable.module.scss";
import { AnalyticalTableCellValue } from "./AnalyticalTableCellValue";

type AnalyticalTotalCellProps<T> = Readonly<{ column: AnalyticalTableColumn<T>; runtime: AnalyticalTableRuntime<T>; offset?: number }>;

/** Pipeline итогов сохраняет state/icon/display независимо от форматирования обычных строк. */
export function AnalyticalTotalCell<T>({ column, runtime, offset }: AnalyticalTotalCellProps<T>) {
	const totals = runtime.model.grandTotals;
	if (!totals) return null;
	const display = resolveAnalyticalTotalDisplay(column, totals, runtime.formattingFields[column.id]);
	return (
		<td
			data-total-column-id={column.id}
			className={cn(
				styles.cell,
				styles.cellTotal,
				styles.footerCellSticky,
				offset !== undefined && styles.cellPinned,
				resolveValueStateClassName(display.state)
			)}
			style={{ insetInlineStart: offset, textAlign: column.align ?? (column.kind === "measure" ? "end" : "start") }}>
			{column.renderTotal ? (
				column.renderTotal(totals[column.id])
			) : column.kind === "measure" ? (
				<div className={styles.cellContent} data-measure>
					{display.showIcon && display.iconPosition === "left" ? <RenderStateIcon state={display.icon} /> : null}
					{display.showValue ? (
						<AnalyticalTableCellValue
							display={display.value == null ? "" : String(display.value)}
							isMeasure
							overflowTooltip={column.tooltip !== false}
						/>
					) : null}
					{display.showIcon && display.iconPosition === "right" ? <RenderStateIcon state={display.icon} /> : null}
				</div>
			) : null}
		</td>
	);
}
