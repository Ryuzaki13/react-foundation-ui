import { useState } from "react";

import { projectAnalyticalTableExport } from "@ryuzaki13/react-foundation-lib/analytical-table";

import { formatAnalyticalCell } from "../lib/formatAnalyticalCell";
import { formatAnalyticalTotal } from "../lib/formatAnalyticalTotal";
import { type AnalyticalTableProps, type AnalyticalTableRuntime } from "../types/analyticalTable";

/** Экспорт получает полный результат, включая строки за пределами viewport. Формат файла выбирает host. */
export function useAnalyticalExport<T>(props: AnalyticalTableProps<T>, runtime: AnalyticalTableRuntime<T>) {
	const [isExporting, setIsExporting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const exportData = async () => {
		if (!props.onExport || isExporting) return;
		setIsExporting(true);
		setError(null);
		try {
			const projection = projectAnalyticalTableExport<T>({
				model: runtime.model,
				columns: runtime.visibleColumns.map((column) => ({
					id: column.id,
					label: column.label,
					formatTotal: () =>
						runtime.model.grandTotals
							? formatAnalyticalTotal(column, runtime.model.grandTotals, runtime.formattingFields[column.id])
							: "",
					format: (_value, row) => formatAnalyticalCell(column, row, runtime.formattingFields[column.id])
				})),
				scope: "all",
				includeGroups: true,
				includeGrandTotals: props.showGrandTotals ?? true
			});
			await props.onExport(projection);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Не удалось выгрузить таблицу.");
		} finally {
			setIsExporting(false);
		}
	};
	return { exportData, isExporting, error };
}
