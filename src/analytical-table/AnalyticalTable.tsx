import { useId, useMemo, type CSSProperties } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { FlexContainer } from "../flex";
import { Notice } from "../misc";

import { indexAnalyticalHeaderGroups } from "./lib/analyticalHeaderGroups";
import { buildAnalyticalTableLayout, ANALYTICAL_SELECTION_WIDTH } from "./lib/analyticalTableLayout";
import { useAnalyticalFocus } from "./model/useAnalyticalFocus";
import { useAnalyticalSelection } from "./model/useAnalyticalSelection";
import { useAnalyticalTableModel } from "./model/useAnalyticalTableModel";
import { useAnalyticalViewport } from "./model/useAnalyticalViewport";
import { type AnalyticalTableProps } from "./types/props";
import { AnalyticalColumnDragProvider } from "./ui/AnalyticalColumnDragProvider";
import styles from "./ui/AnalyticalTable.module.scss";
import { AnalyticalTableBody } from "./ui/AnalyticalTableBody";
import { AnalyticalTableCellOverflowPopoverProvider } from "./ui/AnalyticalTableCellOverflowPopoverProvider";
import { AnalyticalTableHeader } from "./ui/AnalyticalTableHeader";
import { AnalyticalTableToolbar } from "./ui/AnalyticalTableToolbar";
import { AnalyticalTableTotals } from "./ui/AnalyticalTableTotals";

/** Аналитическая таблица полного снимка: transport, Query и права доступа принадлежат host-приложению. */
export function AnalyticalTable<T = unknown>(options: AnalyticalTableProps<T>) {
	const instanceId = useId();
	const runtime = useAnalyticalTableModel(options);
	const selection = useAnalyticalSelection(options, runtime);
	const viewport = useAnalyticalViewport(
		runtime.model.visibleRows,
		options.rowHeight,
		options.initialViewportHeight,
		options.overscan,
		indexAnalyticalHeaderGroups(options.columnGroups).depth + 1,
		Boolean(runtime.model.grandTotals && options.showGrandTotals !== false)
	);
	const { setElement } = viewport;
	const hasSelection = selection.rowMode !== "none";
	const layout = useMemo(() => buildAnalyticalTableLayout(runtime, hasSelection), [runtime, hasSelection]);
	const focus = useAnalyticalFocus(instanceId, runtime, viewport, layout);
	return (
		<FlexContainer column gap="xs" className={cn(styles.viewport, options.className)} style={options.style}>
			{options.showToolbar !== false ? <AnalyticalTableToolbar runtime={runtime} options={options} /> : null}
			{options.error ? (
				<Notice isError role="alert">
					{options.error}
				</Notice>
			) : null}
			<AnalyticalColumnDragProvider runtime={runtime} enabled={options.enableColumnReordering !== false}>
				<div
					ref={setElement}
					className={styles.analyticalTable}
					aria-busy={options.isFetching || undefined}
					style={
						{
							"--analytical-viewport-height":
								typeof options.height === "number" ? `${options.height}px` : (options.height ?? "32rem")
						} as CSSProperties
					}>
					<AnalyticalTableCellOverflowPopoverProvider sourceVersion={runtime.model} scrollElement={viewport.element}>
						<table
							className={styles.table}
							style={{ width: layout.width }}
							aria-label={options.ariaLabel ?? "Аналитическая таблица"}
							data-ui="analytical-table"
							data-clear-table>
							<colgroup>
								{hasSelection ? <col style={{ width: ANALYTICAL_SELECTION_WIDTH }} /> : null}
								<col style={{ width: layout.treeWidth }} />
								{layout.columns.map((column) => (
									<col key={column.id} style={{ width: column.width }} />
								))}
							</colgroup>
							<AnalyticalTableHeader
								setHeaderElement={viewport.setHeaderElement}
								runtime={runtime}
								layout={layout}
								options={options}
								selection={hasSelection}
							/>
							<AnalyticalTableBody {...{ instanceId, runtime, layout, selection, focus, viewport, options }} />
							<AnalyticalTableTotals
								setFooterElement={viewport.setFooterElement}
								runtime={runtime}
								layout={layout}
								options={options}
								selection={hasSelection}
							/>
						</table>
						{runtime.model.visibleRows.length === 0 ? (
							<div className={styles.empty} role="status">
								{options.emptyContent ?? "Нет данных"}
							</div>
						) : null}
					</AnalyticalTableCellOverflowPopoverProvider>
				</div>
			</AnalyticalColumnDragProvider>
		</FlexContainer>
	);
}
