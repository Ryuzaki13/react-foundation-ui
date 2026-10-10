import { useEffect, useState } from "react";

import { type TableCellCoordinates } from "@ryuzaki13/react-foundation-lib/table";

import { analyticalCellId } from "../lib/analyticalCellId";
import { ANALYTICAL_TREE_COLUMN, type AnalyticalTableLayout } from "../lib/analyticalTableLayout";
import { type AnalyticalTableRuntime } from "../types/analyticalTable";

import { type AnalyticalViewport } from "./useAnalyticalViewport";

/** Стрелки прокручивают виртуальное окно; фокус переносится после появления целевой DOM-ячейки. */
export function useAnalyticalFocus<T>(
	instanceId: string,
	runtime: AnalyticalTableRuntime<T>,
	viewport: AnalyticalViewport<T>,
	layout: AnalyticalTableLayout
) {
	const [active, setActive] = useState<TableCellCoordinates | null>(null);
	const [focusRequest, setFocusRequest] = useState<TableCellCoordinates | null>(null);
	const columns = [ANALYTICAL_TREE_COLUMN, ...runtime.visibleColumns.map((column) => column.id)];
	const scrollElement = viewport.element;
	const stickyWidth =
		layout.leadingWidth + layout.columns.reduce((sum, column) => sum + (layout.pinnedOffsets.has(column.id) ? column.width : 0), 0);
	const focusPinned = Boolean(
		focusRequest && (focusRequest.columnId === ANALYTICAL_TREE_COLUMN || layout.pinnedOffsets.has(focusRequest.columnId))
	);
	const rows = runtime.model.visibleRows;
	const activeAvailable = active && runtime.model.rowById.has(active.rowId) && columns.includes(active.columnId) ? active : null;
	useEffect(() => {
		if (!focusRequest) return;
		let frame = 0;
		let attempts = 0;
		const focus = () => {
			const element = document.getElementById(analyticalCellId(instanceId, focusRequest.rowId, focusRequest.columnId));
			if (element) {
				element.focus({ preventScroll: true });
				if (scrollElement && !focusPinned) {
					const viewportRect = scrollElement.getBoundingClientRect();
					const cellRect = element.getBoundingClientRect();
					const start = Math.min(viewportRect.right, viewportRect.left + stickyWidth);
					const delta =
						cellRect.left < start
							? cellRect.left - start
							: cellRect.right > viewportRect.right
								? cellRect.right - viewportRect.right
								: 0;
					if (delta) scrollElement.scrollTo({ left: scrollElement.scrollLeft + delta });
				}
			} else if (++attempts < 4) frame = requestAnimationFrame(focus);
		};
		frame = requestAnimationFrame(focus);
		return () => cancelAnimationFrame(frame);
	}, [focusRequest, instanceId, scrollElement, stickyWidth, focusPinned]);
	const navigate = (rowId: string, columnId: string, key: string) => {
		let rowIndex = rows.findIndex((row) => row.id === rowId);
		let columnIndex = columns.indexOf(columnId);
		if (rowIndex < 0 || columnIndex < 0) return false;
		if (key === "ArrowUp") rowIndex--;
		else if (key === "ArrowDown") rowIndex++;
		else if (key === "ArrowLeft") columnIndex--;
		else if (key === "ArrowRight") columnIndex++;
		else if (key === "Home") columnIndex = 0;
		else if (key === "End") columnIndex = columns.length - 1;
		else return false;
		const row = rows[rowIndex];
		const column = columns[columnIndex];
		if (!row || !column) return false;
		const next = { rowId: row.id, columnId: column };
		viewport.scrollToIndex(rowIndex);
		setActive(next);
		setFocusRequest(next);
		return true;
	};
	const renderedActive = activeAvailable && viewport.items.some((item) => rows[item.index]?.id === activeAvailable.rowId);
	const entryRow = viewport.items[0] ? rows[viewport.items[0].index]?.id : undefined;
	return {
		active: activeAvailable,
		focusCell: (cell: TableCellCoordinates) => setActive(cell),
		navigate,
		tabIndex: (rowId: string, columnId: string) =>
			(
				renderedActive
					? activeAvailable?.rowId === rowId && activeAvailable.columnId === columnId
					: entryRow === rowId && columnId === ANALYTICAL_TREE_COLUMN
			)
				? 0
				: -1
	};
}

export type AnalyticalFocus<T = unknown> = ReturnType<typeof useAnalyticalFocus<T>>;
