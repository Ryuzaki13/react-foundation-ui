import { type CSSProperties, type ReactNode } from "react";

import {
	type AnalyticalExportProjection,
	type AnalyticalModelRow,
	type AnalyticalSnapshot,
	type BuildAnalyticalTableModelOptions
} from "@ryuzaki13/react-foundation-lib/analytical-table";
import {
	type TableCellCoordinates,
	type TableCellSelectionActivationMode,
	type TableSelectionMode
} from "@ryuzaki13/react-foundation-lib/table";

import { type AnalyticalTableColumn, type AnalyticalTableColumnGroup } from "./columns";
import { type AnalyticalTableState } from "./state";

export type AnalyticalTableProps<T = unknown> = Readonly<{
	snapshot: AnalyticalSnapshot<T>;
	columns: readonly AnalyticalTableColumn<T>[];
	columnGroups?: readonly AnalyticalTableColumnGroup[];
	state?: AnalyticalTableState;
	defaultState?: AnalyticalTableState;
	onStateChange?: (state: AnalyticalTableState) => void;
	aggregation?: Pick<BuildAnalyticalTableModelOptions<T>, "isAggregateRow" | "aggregate" | "grandTotalsScope">;
	showGrandTotals?: boolean;
	grandTotalsLabel?: ReactNode;
	showToolbar?: boolean;
	enableColumnResizing?: boolean;
	enableColumnReordering?: boolean;
	enableGrouping?: boolean;
	rowSelectionMode?: TableSelectionMode;
	cellSelectionMode?: TableSelectionMode;
	cellSelectionActivationMode?: TableCellSelectionActivationMode;
	selectedRowIds?: readonly string[];
	selectedCells?: readonly TableCellCoordinates[];
	onRowSelectionChange?: (rows: readonly AnalyticalModelRow<T>[]) => void;
	onCellSelectionChange?: (cells: readonly TableCellCoordinates[]) => void;
	getRowCanSelect?: (row: AnalyticalModelRow<T>) => boolean;
	renderTreeLabel?: (row: AnalyticalModelRow<T>) => ReactNode;
	getRowLabel?: (row: AnalyticalModelRow<T>) => string;
	onExport?: (projection: AnalyticalExportProjection) => void | Promise<void>;
	isFetching?: boolean;
	error?: ReactNode;
	onRefresh?: () => void;
	emptyContent?: ReactNode;
	ariaLabel?: string;
	/** CSS-размер viewport и начальная SSR-оценка задаются отдельно. */
	height?: CSSProperties["height"];
	initialViewportHeight?: number;
	rowHeight?: number;
	overscan?: number;
	className?: string;
	style?: CSSProperties;
}>;
