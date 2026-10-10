import { type AnalyticalValues } from "@ryuzaki13/react-foundation-lib/analytical-table";
import { formatPipelineDisplayValue, type FormattersPipelineRuntimeField } from "@ryuzaki13/react-foundation-lib/formatters";

import { type AnalyticalTableColumn } from "../types/columns";

/** Итог не является строкой snapshot: renderer исходных строк к нему не применяется. */
export function resolveAnalyticalTotalDisplay<T>(
	column: AnalyticalTableColumn<T>,
	values: AnalyticalValues,
	field: Readonly<FormattersPipelineRuntimeField>
) {
	const display = formatPipelineDisplayValue({ field, rawValue: values[column.id], rowData: values, rowKind: "totals", rowLevel: 0 });
	return column.formatTotal ? { ...display, value: column.formatTotal(values[column.id]) } : display;
}

export function formatAnalyticalTotal<T>(
	column: AnalyticalTableColumn<T>,
	values: AnalyticalValues,
	field: Readonly<FormattersPipelineRuntimeField>
) {
	const display = resolveAnalyticalTotalDisplay(column, values, field);
	return display.showValue && display.value != null ? String(display.value) : "";
}
