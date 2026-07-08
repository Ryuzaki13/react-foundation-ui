import { filterAndDeduplicateIds, pickExistingMapValues } from "@ryuzaki13/react-foundation-lib/array";
import { buildTableColumnLayout, getTableColumnMeta, resolveTableColumnOrder, resolveTableLength } from "@ryuzaki13/react-foundation-lib/table";

import type { Column, TableState, Table as TanStackTable } from "@tanstack/react-table";

export type BaseTableColumnLayoutItem<TData extends object> = {
	id: string;
	column: Column<TData, unknown>;
	width: string;
};

/**
 * Реактивный срез состояния колонок, от которого зависит физический layout BaseTable.
 *
 * TanStack table instance остаётся стабильным объектом, поэтому BaseTable получает
 * этот срез отдельным prop: React Compiler не должен кэшировать разметку колонок
 * поверх изменившихся order/sizing/pinning/visibility.
 */
export type BaseTableColumnState = Pick<TableState, "columnOrder" | "columnPinning" | "columnSizing" | "columnVisibility">;

/**
 * Публичное состояние закрепления колонок для shared-таблиц.
 *
 * В первой итерации поддерживается только закрепление слева.
 */
export interface TableColumnPinningState {
	/**
	 * Идентификаторы колонок, закреплённых слева, в порядке отображения.
	 */
	left?: string[];
}

/**
 * Нормализует публичное состояние закрепления к формату TanStack Table.
 *
 * Правая зона принудительно очищается, чтобы не открывать неподдерживаемый API.
 */
export function normalizeTableColumnPinning(state?: TableColumnPinningState): { left: string[]; right: string[] } {
	return {
		left: Array.from(
			new Set(
				(state?.left ?? []).filter((columnId): columnId is string => typeof columnId === "string" && columnId.trim().length > 0)
			)
		),
		right: []
	};
}

/**
 * Возвращает ширину колонки в том же формате, что и colgroup базовой таблицы.
 */
export function resolveBaseTableColumnWidth<TData extends object>(
	column: Column<TData, unknown>,
	columnSizing?: Readonly<Record<string, number>>
): string {
	const resizedWidth = columnSizing?.[column.id];
	if (typeof resizedWidth === "number" && Number.isFinite(resizedWidth) && resizedWidth > 0) {
		return `${Math.floor(resizedWidth)}px`;
	}

	const meta = getTableColumnMeta(column.columnDef);

	let width = meta?.width ?? 4;

	if (typeof width === "number") {
		width = Math.max(width, 4);
	}

	return resolveTableLength(width);
}

/**
 * Собирает видимые leaf-колонки в фактическом порядке рендера: pinned-left -> center -> pinned-right.
 *
 * В отличие от отдельных TanStack getters, порядок явно строится из одного
 * источника `columnOrder`, поэтому `<colgroup>`, header и body получают один
 * и тот же layout после drag&drop.
 */
export function getOrderedVisibleLeafColumns<TData extends object>(
	table: TanStackTable<TData>,
	columnState: BaseTableColumnState
): Column<TData, unknown>[] {
	const visibleColumns = table.getAllLeafColumns().filter((column) => column.getIsVisible());
	const columnById = new Map(visibleColumns.map((column) => [column.id, column]));
	const visibleColumnIds = visibleColumns.map((column) => column.id);
	const leftIds = filterAndDeduplicateIds(columnState.columnPinning.left, visibleColumnIds);
	const rightIds = filterAndDeduplicateIds(columnState.columnPinning.right, visibleColumnIds);
	const pinnedIds = new Set([...leftIds, ...rightIds]);
	const centerIds: string[] = [];

	for (const column of visibleColumns) {
		if (!pinnedIds.has(column.id)) {
			centerIds.push(column.id);
		}
	}

	const orderedCenterIds = resolveTableColumnOrder({
		ids: centerIds,
		order: columnState.columnOrder
	});

	return pickExistingMapValues([...leftIds, ...orderedCenterIds, ...rightIds], columnById);
}

export function buildBaseTableColumnLayout<TData extends object>(
	table: TanStackTable<TData>,
	columnState: BaseTableColumnState
): BaseTableColumnLayoutItem<TData>[] {
	const columns = getOrderedVisibleLeafColumns(table, columnState);
	const columnById = new Map(columns.map((column) => [column.id, column]));

	return buildTableColumnLayout({
		ids: columns.map((column) => column.id),
		getWidth: (id) => {
			const column = columnById.get(id);
			return column ? resolveBaseTableColumnWidth(column, columnState.columnSizing) : "0px";
		}
	}).flatMap((item) => {
		const column = columnById.get(item.id);

		return column
			? [
					{
						...item,
						column
					}
				]
			: [];
	});
}

/**
 * Вычисляет sticky-offset для закреплённых слева колонок.
 *
 * Значения возвращаются как CSS-length, чтобы корректно суммировать `em`, `px` и `calc(...)`.
 */
export function getLeftPinnedColumnOffsets<TData extends object>(
	table: TanStackTable<TData>,
	columnState: BaseTableColumnState
): Readonly<Record<string, string>> {
	const offsets: Record<string, string> = {};
	const accumulatedWidths: string[] = [];

	for (const column of getOrderedVisibleLeafColumns(table, columnState)) {
		if (column.getIsPinned() !== "left") continue;

		offsets[column.id] = combineCssLengths(accumulatedWidths);
		accumulatedWidths.push(resolveBaseTableColumnWidth(column, columnState.columnSizing));
	}

	return offsets;
}

/**
 * Складывает CSS-length значения в безопасную строку `calc(...)`.
 */
function combineCssLengths(lengths: readonly string[]): string {
	if (lengths.length === 0) {
		return "0px";
	}

	if (lengths.length === 1) {
		return lengths[0]!;
	}

	return `calc(${lengths.join(" + ")})`;
}
