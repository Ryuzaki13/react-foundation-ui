import {
	type FoundationTableCell,
	type FoundationTableColumn,
	type FoundationTableRow,
	getTableColumnMeta
} from "@ryuzaki13/react-foundation-lib/table";

/**
 * Layout-настройка body-ячейки базовой таблицы.
 */
export interface BaseTableCellLayout {
	hideContent?: boolean;
	mergeWithNext?: boolean;
}

/**
 * Результат расчёта layout для body-ячейки по её `cell.id`.
 */
export type BaseTableCellLayoutById = ReadonlyMap<string, BaseTableCellLayout>;

/**
 * Аргументы построения layout для display-only слияния дубликатов.
 */
export interface BuildBaseTableMergedCellsLayoutArgs<TData extends object> {
	rows: readonly FoundationTableRow<TData>[];
	columns: readonly FoundationTableColumn<TData>[];
	resolveRowBoundaryKey?: (row: FoundationTableRow<TData>) => unknown;
	excludeColumnIds?: ReadonlySet<string>;
}

type VisibleRowCellLookup<TData extends object> = {
	row: FoundationTableRow<TData>;
	boundaryKey: unknown;
	cellByColumnId: ReadonlyMap<string, FoundationTableCell<TData>>;
};

function isMergeableValue(value: unknown): boolean {
	return value !== null && value !== undefined && value !== "";
}

function buildVisibleRowCellLookups<TData extends object>(
	rows: readonly FoundationTableRow<TData>[],
	resolveRowBoundaryKey: (row: FoundationTableRow<TData>) => unknown
): VisibleRowCellLookup<TData>[] {
	return rows.map((row) => ({
		row,
		boundaryKey: resolveRowBoundaryKey(row),
		cellByColumnId: new Map(row.getVisibleCells().map((cell) => [cell.column.id, cell]))
	}));
}

/**
 * Строит layout display-only слияния для колонок с `meta.mergeDuplicates`.
 *
 * Слияние работает только для подряд идущих одинаковых raw-значений. Пустые
 * значения (`null`, `undefined`, `""`) не объединяются.
 */
export function buildBaseTableMergedCellsLayout<TData extends object>({
	rows,
	columns,
	resolveRowBoundaryKey = () => "__all_rows__",
	excludeColumnIds
}: BuildBaseTableMergedCellsLayoutArgs<TData>): BaseTableCellLayoutById {
	const mergeableColumns = columns.filter((column) => {
		if (excludeColumnIds?.has(column.id)) {
			return false;
		}

		return getTableColumnMeta(column.columnDef)?.mergeDuplicates === true;
	});

	if (rows.length === 0 || mergeableColumns.length === 0) {
		return new Map();
	}

	const rowLookups = buildVisibleRowCellLookups(rows, resolveRowBoundaryKey);
	const layoutByCellId = new Map<string, BaseTableCellLayout>();

	for (const column of mergeableColumns) {
		let groupStartIndex = -1;
		let groupValue: unknown = undefined;
		let groupBoundaryKey: unknown = undefined;

		const finalizeGroup = (endIndexExclusive: number) => {
			if (groupStartIndex === -1) {
				return;
			}

			const groupSize = endIndexExclusive - groupStartIndex;
			if (groupSize <= 1) {
				groupStartIndex = -1;
				groupValue = undefined;
				groupBoundaryKey = undefined;
				return;
			}

			for (let index = groupStartIndex; index < endIndexExclusive; index += 1) {
				const cellId = rowLookups[index]?.cellByColumnId.get(column.id)?.id;
				if (cellId) {
					layoutByCellId.set(cellId, {
						hideContent: index > groupStartIndex,
						mergeWithNext: index < endIndexExclusive - 1
					});
				}
			}

			groupStartIndex = -1;
			groupValue = undefined;
			groupBoundaryKey = undefined;
		};

		for (let index = 0; index < rowLookups.length; index += 1) {
			const currentRow = rowLookups[index];
			const currentCell = currentRow?.cellByColumnId.get(column.id);
			const currentValue = currentCell?.getValue();

			if (!currentCell || !isMergeableValue(currentValue)) {
				finalizeGroup(index);
				continue;
			}

			if (groupStartIndex === -1) {
				groupStartIndex = index;
				groupValue = currentValue;
				groupBoundaryKey = currentRow?.boundaryKey;
				continue;
			}

			if (!Object.is(groupBoundaryKey, currentRow?.boundaryKey) || !Object.is(groupValue, currentValue)) {
				finalizeGroup(index);
				groupStartIndex = index;
				groupValue = currentValue;
				groupBoundaryKey = currentRow?.boundaryKey;
			}
		}

		finalizeGroup(rowLookups.length);
	}

	return layoutByCellId;
}
