import { type AnalyticalTableModel } from "@ryuzaki13/react-foundation-lib/analytical-table";
import { type FormattersPipelineRuntimeFields } from "@ryuzaki13/react-foundation-lib/formatters";

import { type AnalyticalTableColumn } from "./columns";
import { type AnalyticalTableState } from "./state";

export type AnalyticalTableRuntime<T = unknown> = Readonly<{
	model: AnalyticalTableModel<T>;
	maxRowLevel: number;
	formattingFields: FormattersPipelineRuntimeFields;
	state: AnalyticalTableState;
	columns: readonly AnalyticalTableColumn<T>[];
	visibleColumns: readonly AnalyticalTableColumn<T>[];
	patchState: (patch: Partial<AnalyticalTableState>) => void;
	toggleRow: (id: string) => void;
	collapseBranch: (id: string) => void;
	collapseAll: () => void;
	sortColumn: (id: string, direction?: "asc" | "desc" | "clear", multi?: boolean) => void;
	groupColumn: (id: string) => void;
	ungroupColumn: (id: string) => void;
	moveGrouping: (id: string, offset: number) => void;
	filterColumn: (id: string, value: unknown) => void;
	clearFilter: (id: string) => void;
	pinColumn: (id: string) => void;
	hideColumn: (id: string) => void;
	resizeColumn: (id: string, width: number) => void;
}>;
