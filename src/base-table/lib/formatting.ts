import {
	compileFormattersPipelineRuntimeFields,
	type FormattersPipelineRuntimeField,
	type FormattersPipelineRuntimeFields
} from "@ryuzaki13/react-foundation-lib/formatters";
import { getTableColumnFormattingMeta, type TableColumnDef } from "@ryuzaki13/react-foundation-lib/table";

/**
 * Снимок форматирующих данных, вычисленный из набора колонок.
 *
 * Используется и в `Table`, и в `TreeTable`, чтобы не дублировать
 * предкомпиляцию runtime и правила приоритета кастомного `cell`.
 */
export interface TableFormattingSnapshot {
	/**
	 * Скомпилированный runtime по идентификаторам колонок.
	 */
	runtimeByColumnId: FormattersPipelineRuntimeFields<FormattersPipelineRuntimeField>;
	/**
	 * Идентификаторы колонок с явным кастомным `cell`.
	 */
	customCellColumnIds: Set<string>;
}

/**
 * Определяет стабильный идентификатор колонки для pipeline runtime.
 *
 * Порядок приоритета:
 * 1. `column.id`
 * 2. строковый `accessorKey`
 */
export function resolveTableFormattingColumnId<TData extends object>(column: TableColumnDef<TData>): string | undefined {
	if (typeof column.id === "string" && column.id.trim()) {
		return column.id;
	}

	if ("accessorKey" in column && typeof column.accessorKey === "string" && column.accessorKey.trim()) {
		return column.accessorKey;
	}

	return undefined;
}

/**
 * Проверяет, задан ли у колонки явный кастомный `cell`.
 */
export function hasTableColumnCustomCellRenderer<TData extends object>(column: TableColumnDef<TData>): boolean {
	return "cell" in column && column.cell != null;
}

/**
 * Обходит только leaf-колонки, пропуская group-узлы.
 */
function visitLeafTableColumns<TData extends object>(
	columns: readonly TableColumnDef<TData>[],
	visitor: (column: TableColumnDef<TData>) => void
): void {
	for (const column of columns) {
		if ("columns" in column && Array.isArray(column.columns) && column.columns.length > 0) {
			visitLeafTableColumns(column.columns as TableColumnDef<TData>[], visitor);
			continue;
		}

		visitor(column);
	}
}

/**
 * Собирает snapshot pipeline runtime по описанию колонок.
 */
export function buildTableFormattingSnapshot<TData extends object>(columns: readonly TableColumnDef<TData>[]): TableFormattingSnapshot {
	const formattingByColumnId: Record<string, FormattersPipelineRuntimeField> = {};
	const customCellColumnIds = new Set<string>();

	visitLeafTableColumns(columns, (column) => {
		const columnId = resolveTableFormattingColumnId(column);
		if (!columnId) {
			return;
		}

		if (hasTableColumnCustomCellRenderer(column)) {
			customCellColumnIds.add(columnId);
		}

		const formatting = getTableColumnFormattingMeta(column);
		if (!formatting) {
			return;
		}

		formattingByColumnId[columnId] = {
			...formatting,
			id: formatting.id ?? columnId,
			role: formatting.role ?? "dimension",
			type: formatting.type ?? "string"
		};
	});

	return {
		runtimeByColumnId: compileFormattersPipelineRuntimeFields(formattingByColumnId),
		customCellColumnIds
	};
}

/**
 * Определяет, должен ли компонент использовать pipeline runtime для ячейки.
 */
export function shouldUseTableFormatting(args: {
	columnId: string;
	runtimeByColumnId: FormattersPipelineRuntimeFields<FormattersPipelineRuntimeField>;
	customCellColumnIds: ReadonlySet<string>;
}): boolean {
	if (args.customCellColumnIds.has(args.columnId)) {
		return false;
	}

	return Boolean(args.runtimeByColumnId[args.columnId]);
}
