import { useMemo, useState } from "react";

import { type AnalyticalModelRow } from "@ryuzaki13/react-foundation-lib/analytical-table";
import {
	pruneTableCellSelection,
	useTableRowSelection,
	toggleTableCellSelection,
	type TableCellCoordinates
} from "@ryuzaki13/react-foundation-lib/table";

import { type AnalyticalTableProps, type AnalyticalTableRuntime } from "../types/analyticalTable";

/** Выбор принадлежит UI; исчезнувшие координаты удаляются до отрисовки нового снимка. */
export function useAnalyticalSelection<T>(props: AnalyticalTableProps<T>, runtime: AnalyticalTableRuntime<T>) {
	const { getRowCanSelect } = props;
	const rowMode = props.rowSelectionMode ?? "none";
	const cellMode = props.cellSelectionMode ?? "none";
	const rowIds = useMemo(() => runtime.model.flatRows.map((row) => row.id), [runtime.model.flatRows]);
	const selectableIds = useMemo(
		() => runtime.model.flatRows.filter((row) => getRowCanSelect?.(row) !== false).map((row) => row.id),
		[runtime.model.flatRows, getRowCanSelect]
	);
	const selectableSet = useMemo(() => new Set(selectableIds), [selectableIds]);
	const columnIds = useMemo(() => runtime.visibleColumns.map((column) => column.id), [runtime.visibleColumns]);
	const rowById = useMemo(() => new Map(runtime.model.flatRows.map((row) => [row.id, row])), [runtime.model.flatRows]);
	const { rowSelection: rows, activateRowSelection } = useTableRowSelection({
		availableRowIds: selectableIds,
		rowById,
		selectionMode: rowMode,
		selectedRowIds: props.selectedRowIds,
		onRowSelectionChange: rowMode === "none" ? undefined : props.onRowSelectionChange
	});
	// Cell intent сохраняется между фильтрами; активная проекция исключает недоступные координаты.
	const [storedCells, setStoredCells] = useState<readonly TableCellCoordinates[]>([]);
	const cells = useMemo(
		() => pruneTableCellSelection(props.selectedCells ?? storedCells, rowIds, columnIds, cellMode),
		[props.selectedCells, storedCells, rowIds, columnIds, cellMode]
	);
	const selectedCellsByRow = useMemo(() => {
		const index = new Map<string, Set<string>>();
		for (const cell of cells) {
			const columns = index.get(cell.rowId) ?? new Set<string>();
			columns.add(cell.columnId);
			index.set(cell.rowId, columns);
		}
		return index;
	}, [cells]);
	const isCellSelected = (rowId: string, columnId: string) => selectedCellsByRow.get(rowId)?.has(columnId) === true;
	const selectRow = (row: AnalyticalModelRow<T>) => activateRowSelection(row.id, selectableSet.has(row.id));
	const selectCell = (cell: TableCellCoordinates) => {
		const next = pruneTableCellSelection(toggleTableCellSelection(cells, cell, cellMode), rowIds, columnIds, cellMode);
		if (props.selectedCells === undefined) setStoredCells(next);
		props.onCellSelectionChange?.(next);
	};
	return { rowMode, cellMode, rows, cells, selectRow, selectCell, isCellSelected, canSelectRow: (id: string) => selectableSet.has(id) };
}

export type AnalyticalSelection<T = unknown> = ReturnType<typeof useAnalyticalSelection<T>>;
