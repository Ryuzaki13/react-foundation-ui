import { type AnalyticalModelRow } from "@ryuzaki13/react-foundation-lib/analytical-table";
import { formatPipelineDisplayValue, type FormattersPipelineRuntimeField } from "@ryuzaki13/react-foundation-lib/formatters";

import { type AnalyticalTableColumn } from "../types/analyticalTable";

/** UI, clipboard и экспорт используют один display-контракт. */
export function resolveAnalyticalCellDisplay<T>(
	column: AnalyticalTableColumn<T>,
	row: AnalyticalModelRow<T>,
	field?: Readonly<FormattersPipelineRuntimeField>,
	totals = false
) {
	const value = row.values[column.id];
	const display = formatPipelineDisplayValue({
		field: field ?? {
			id: column.id,
			role: column.kind ?? "dimension",
			type: column.valueType === "number" ? "decimal" : column.valueType === "date" ? "datetime" : (column.valueType ?? "string")
		},
		rawValue: value,
		rowData: row.values,
		rowKind: totals ? "totals" : row.kind === "group" ? "group" : "plain",
		rowLevel: row.level
	});
	return column.format ? { ...display, value: column.format(value, row) } : display;
}

export function formatAnalyticalCell<T>(
	column: AnalyticalTableColumn<T>,
	row: AnalyticalModelRow<T>,
	field?: Readonly<FormattersPipelineRuntimeField>
) {
	const display = resolveAnalyticalCellDisplay(column, row, field);
	return display.showValue && display.value !== null && display.value !== undefined ? String(display.value) : "";
}
