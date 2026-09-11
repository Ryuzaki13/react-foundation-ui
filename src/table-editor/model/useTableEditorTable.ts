import { useMemo } from "react";

import { getTableDocumentCellRange, type TableDocument, type TableDocumentRow } from "@ryuzaki13/react-foundation-lib/table-document";
import { cellSpanningFeature, tableFeatures, useTable, type ColumnDef } from "@tanstack/react-table";

const features = tableFeatures({ cellSpanningFeature });

/**
 * TanStack 9 получает стабильный anchor как accessor value: одинаковый текст
 * соседних ячеек сам по себе никогда не объединяет их. Порядок документа не
 * сортируется и не фильтруется; authored spans остаются authoritative.
 */
export function useTableEditorTable<T>(document: TableDocument<T>) {
	// Merge меняет accessor identity даже без изменения rows. Новый snapshot data
	// сбрасывает кэш значений TanStack и не оставляет устаревшие spans на экране.
	const data = useMemo(() => [...document.rows], [document]);
	const columns = useMemo<ColumnDef<typeof features, TableDocumentRow<T>>[]>(
		() =>
			document.columns.map((column, c) => ({
				id: column.id,
				accessorFn: (_row, r) => {
					const range = getTableDocumentCellRange(document, { row: r, column: c });
					return document.rows[range.row].cells[range.column].id;
				},
				spanRows: true,
				spanColumns: ({ row }) => {
					const range = getTableDocumentCellRange(document, { row: row.index, column: c });
					return range.column === c ? range.columnSpan : 1;
				}
			})),
		[document]
	);
	return useTable({ features, data, columns, getRowId: (row) => row.id });
}
