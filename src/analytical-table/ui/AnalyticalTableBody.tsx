import { useEffect, useState } from "react";

import { type AnalyticalTableModel } from "@ryuzaki13/react-foundation-lib/analytical-table";

import { ContextMenu } from "../../context-menu";
import { type AnalyticalTableLayout } from "../lib/analyticalTableLayout";
import { type AnalyticalFocus } from "../model/useAnalyticalFocus";
import { type AnalyticalSelection } from "../model/useAnalyticalSelection";
import { type AnalyticalViewport } from "../model/useAnalyticalViewport";
import { type AnalyticalTableProps, type AnalyticalTableRuntime } from "../types/analyticalTable";

import { AnalyticalBodyMenu } from "./AnalyticalBodyMenu";
import styles from "./AnalyticalTable.module.scss";
import { AnalyticalTableRow } from "./AnalyticalTableRow";

/** Один delegated context-menu обслуживает всё виртуальное тело, без floating-runtime на каждую ячейку. */
type AnalyticalTableBodyProps<T> = Readonly<{
	instanceId: string;
	runtime: AnalyticalTableRuntime<T>;
	layout: AnalyticalTableLayout;
	selection: AnalyticalSelection<T>;
	focus: AnalyticalFocus<T>;
	viewport: AnalyticalViewport<T>;
	options: AnalyticalTableProps<T>;
}>;

export function AnalyticalTableBody<T>({ instanceId, runtime, layout, selection, focus, viewport, options }: AnalyticalTableBodyProps<T>) {
	const [target, setTarget] = useState<{ rowId: string; columnId: string; model: AnalyticalTableModel<T> } | null>(null);
	const [open, setOpen] = useState(false);
	const scrollElement = viewport.element;
	useEffect(() => {
		const close = () => setOpen(false);
		scrollElement?.addEventListener("scroll", close, { passive: true });
		return () => scrollElement?.removeEventListener("scroll", close);
	}, [scrollElement]);
	const captureTarget = (target: EventTarget | null) => {
		if (!(target instanceof Element)) return;
		const cell = target.closest<HTMLElement>("[data-analytical-row-id][data-analytical-column-id]");
		if (cell?.dataset.analyticalRowId && cell.dataset.analyticalColumnId)
			setTarget({ rowId: cell.dataset.analyticalRowId, columnId: cell.dataset.analyticalColumnId, model: runtime.model });
	};
	const colSpan = runtime.visibleColumns.length + (selection.rowMode === "none" ? 1 : 2);
	const first = viewport.items[0];
	const last = viewport.items.at(-1);
	return (
		<ContextMenu open={open && target?.model === runtime.model && runtime.model.rowById.has(target.rowId)} onOpenChange={setOpen}>
			<ContextMenu.Trigger
				resolveTrigger={(target) => (target instanceof Element ? target.closest("td[data-analytical-row-id]") : null)}>
				<tbody
					onContextMenu={(event) => captureTarget(event.target)}
					onKeyDown={(event) => {
						if (event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey)) captureTarget(event.target);
					}}
					onMouseDownCapture={(event) => {
						if (event.button === 0) setOpen(false);
					}}>
					{first && first.start > viewport.headerHeight ? (
						<tr aria-hidden="true">
							<td className={styles.spacerCell} colSpan={colSpan} style={{ height: first.start - viewport.headerHeight }} />
						</tr>
					) : null}
					{viewport.items.map((item) => {
						const row = runtime.model.visibleRows[item.index];
						return row ? (
							<AnalyticalTableRow
								key={row.id}
								{...{ row, item, instanceId, runtime, layout, selection, focus, options }}
								measure={viewport.measureRow}
							/>
						) : null;
					})}
					{last && last.end - viewport.headerHeight < viewport.totalSize ? (
						<tr aria-hidden="true">
							<td
								className={styles.spacerCell}
								colSpan={colSpan}
								style={{ height: viewport.totalSize - last.end + viewport.headerHeight }}
							/>
						</tr>
					) : null}
				</tbody>
			</ContextMenu.Trigger>
			<ContextMenu.Content>
				{target ? <AnalyticalBodyMenu {...target} runtime={runtime} selection={selection} options={options} /> : null}
			</ContextMenu.Content>
		</ContextMenu>
	);
}
