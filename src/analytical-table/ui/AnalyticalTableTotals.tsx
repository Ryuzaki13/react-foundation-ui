import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { type AnalyticalTableLayout } from "../lib/analyticalTableLayout";
import { type AnalyticalTableProps, type AnalyticalTableRuntime } from "../types/analyticalTable";

import styles from "./AnalyticalTable.module.scss";
import { AnalyticalTotalCell } from "./AnalyticalTotalCell";

/** Готовые итоги исходного snapshot не пересчитываются из видимого virtual window. */
type AnalyticalTableTotalsProps<T> = Readonly<{
	runtime: AnalyticalTableRuntime<T>;
	layout: AnalyticalTableLayout;
	options: AnalyticalTableProps<T>;
	selection: boolean;
	setFooterElement: (element: HTMLTableSectionElement | null) => void;
}>;

export function AnalyticalTableTotals<T>({ runtime, layout, options, selection, setFooterElement }: AnalyticalTableTotalsProps<T>) {
	const totals = runtime.model.grandTotals;
	if (!totals || options.showGrandTotals === false) return null;

	const firstValueIndex = runtime.visibleColumns.findIndex((column) => column.kind === "measure" || column.renderTotal);
	const labelColumnCount = firstValueIndex < 0 ? runtime.visibleColumns.length : firstValueIndex;
	const leadingDimensions = runtime.visibleColumns.slice(0, labelColumnCount);
	const firstUnpinned = leadingDimensions.findIndex((column) => !layout.pinnedOffsets.has(column.id));
	const pinnedDimensions = firstUnpinned < 0 ? leadingDimensions.length : firstUnpinned;
	const spanDimensions = pinnedDimensions > 0 ? pinnedDimensions : labelColumnCount;
	return (
		<tfoot ref={setFooterElement}>
			<tr className={styles.totalRow}>
				<td
					colSpan={(selection ? 2 : 1) + spanDimensions}
					className={cn(styles.totalCell, styles.footerCellSticky, pinnedDimensions > 0 && styles.cellPinned)}
					style={{ insetInlineStart: pinnedDimensions > 0 ? 0 : "auto", left: pinnedDimensions > 0 ? 0 : "auto" }}>
					<div
						className={styles.totalCellInner}
						title={typeof options.grandTotalsLabel === "string" ? options.grandTotalsLabel : undefined}>
						<span className="textOverflow">{options.grandTotalsLabel ?? "Итого"}</span>
					</div>
				</td>
				{runtime.visibleColumns.slice(spanDimensions).map((column) => (
					<AnalyticalTotalCell key={column.id} column={column} runtime={runtime} offset={layout.pinnedOffsets.get(column.id)} />
				))}
			</tr>
		</tfoot>
	);
}
