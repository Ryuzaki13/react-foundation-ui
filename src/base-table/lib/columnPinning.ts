import { filterAndDeduplicateIds, pickExistingMapValues } from "@ryuzaki13/react-foundation-lib/array";
import {
	buildTableColumnLayout,
	type FoundationTableColumn,
	type FoundationTableInstance,
	type FoundationTableState,
	getTableColumnMeta,
	resolveTableColumnOrder,
	resolveTableLength
} from "@ryuzaki13/react-foundation-lib/table";

import type { ColumnPinningState } from "@tanstack/react-table";

export type BaseTableColumnLayoutItem<TData extends object> = {
	id: string;
	column: FoundationTableColumn<TData>;
	width: string;
};

/**
 * Реактивный срез состояния колонок, от которого зависит физический layout BaseTable.
 *
 * TanStack table instance остаётся стабильным объектом, поэтому BaseTable получает
 * этот срез отдельным prop: React Compiler не должен кэшировать разметку колонок
 * поверх изменившихся order/sizing/pinning/visibility.
 */
export type BaseTableColumnState = Pick<FoundationTableState, "columnOrder" | "columnPinning" | "columnSizing" | "columnVisibility">;

/**
 * Публичное состояние закрепления колонок для shared-таблиц.
 *
 * Поддерживается только логическая начальная сторона: слева в LTR и справа в RTL.
 */
export interface TableColumnPinningState {
	/**
	 * Идентификаторы колонок, закреплённых с начальной стороны, в порядке отображения.
	 */
	start?: string[];
}

/**
 * Нормализует публичное состояние закрепления к формату TanStack Table.
 *
 * Конечная зона принудительно очищается, чтобы не открывать неподдерживаемый API.
 */
export function normalizeTableColumnPinning(state?: TableColumnPinningState): ColumnPinningState {
	return {
		start: Array.from(
			new Set(
				(state?.start ?? []).filter((columnId): columnId is string => typeof columnId === "string" && columnId.trim().length > 0)
			)
		),
		end: []
	};
}

/**
 * Возвращает ширину колонки в том же формате, что и colgroup базовой таблицы.
 */
export function resolveBaseTableColumnWidth<TData extends object>(
	column: FoundationTableColumn<TData>,
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
 * Собирает видимые leaf-колонки в фактическом порядке рендера: pinned-start -> center -> pinned-end.
 *
 * В отличие от отдельных TanStack getters, порядок явно строится из одного
 * источника `columnOrder`, поэтому `<colgroup>`, header и body получают один
 * и тот же layout после drag&drop.
 */
export function getOrderedVisibleLeafColumns<TData extends object>(
	table: FoundationTableInstance<TData>,
	columnState: BaseTableColumnState
): FoundationTableColumn<TData>[] {
	const visibleColumns = table.getAllLeafColumns().filter((column) => column.getIsVisible());
	const columnById = new Map(visibleColumns.map((column) => [column.id, column]));
	const visibleColumnIds = visibleColumns.map((column) => column.id);
	const startIds = filterAndDeduplicateIds(columnState.columnPinning.start, visibleColumnIds);
	const endIds = filterAndDeduplicateIds(columnState.columnPinning.end, visibleColumnIds);
	const pinnedIds = new Set([...startIds, ...endIds]);
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

	return pickExistingMapValues([...startIds, ...orderedCenterIds, ...endIds], columnById);
}

export function buildBaseTableColumnLayout<TData extends object>(
	table: FoundationTableInstance<TData>,
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
 * Вычисляет sticky-offset для колонок, закреплённых с логической начальной стороны.
 *
 * Значения возвращаются как CSS-length, чтобы корректно суммировать `em`, `px` и `calc(...)`.
 */
export function getStartPinnedColumnOffsets<TData extends object>(
	table: FoundationTableInstance<TData>,
	columnState: BaseTableColumnState
): Readonly<Record<string, string>> {
	const offsets: Record<string, string> = {};
	const accumulatedWidths: string[] = [];

	for (const column of getOrderedVisibleLeafColumns(table, columnState)) {
		if (column.getIsPinned() !== "start") continue;

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
