import { buildTableColumnLayout } from "@ryuzaki13/react-foundation-lib/table";

import { type AnalyticalTableRuntime } from "../types/analyticalTable";

export const ANALYTICAL_TREE_COLUMN = "__analytical_tree__";
export const ANALYTICAL_SELECTION_WIDTH = 32;

/** Геометрия исходной таблицы: отдельные tree/selection колонки и sticky-смещения в px. */
export function buildAnalyticalTableLayout<T>(runtime: AnalyticalTableRuntime<T>, selection: boolean) {
	const treeWidth = Math.max(40, runtime.maxRowLevel * 8 + 27);
	const leadingWidth = treeWidth + (selection ? ANALYTICAL_SELECTION_WIDTH : 0);
	const columns = buildTableColumnLayout({
		ids: runtime.visibleColumns.map((column) => column.id),
		getWidth: (id) => {
			const column = runtime.columns.find((item) => item.id === id);
			return runtime.state.columnWidths?.[id] ?? column?.width ?? 160;
		}
	});
	let pinnedOffset = leadingWidth;
	const pinnedOffsets = new Map<string, number>();
	for (const column of columns) {
		if (!runtime.state.pinnedColumnIds?.includes(column.id)) continue;
		pinnedOffsets.set(column.id, pinnedOffset);
		pinnedOffset += column.width;
	}
	// Tree-подпись может занимать только пустые dimension-ячейки перед первой мерой.
	const firstValueIndex = runtime.visibleColumns.findIndex(
		(column) =>
			column.kind === "measure" ||
			column.renderGroup ||
			runtime.formattingFields[column.id]?.formattersPipelineExecutor?.hasRowBasedOverride
	);
	const labelColumnCount = firstValueIndex < 0 ? columns.length : firstValueIndex;
	const treeLabelWidth = treeWidth + columns.slice(0, labelColumnCount).reduce((sum, column) => sum + column.width, 0);
	return {
		columns,
		treeLabelWidth,
		treeWidth,
		leadingWidth,
		pinnedOffsets,
		width: leadingWidth + columns.reduce((total, column) => total + column.width, 0)
	};
}

export type AnalyticalTableLayout = ReturnType<typeof buildAnalyticalTableLayout>;
