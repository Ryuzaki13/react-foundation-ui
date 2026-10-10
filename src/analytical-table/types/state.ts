import { type AnalyticalViewState, type AnalyticalGroupingLevel } from "@ryuzaki13/react-foundation-lib/analytical-table";

export type AnalyticalTableState = Omit<AnalyticalViewState, "grouping"> &
	Readonly<{
		grouping?: readonly (AnalyticalGroupingLevel & Readonly<{ showAsColumn?: boolean }>)[];
		columnOrder?: readonly string[];
		hiddenColumnIds?: readonly string[];
		columnWidths?: Readonly<Record<string, number>>;
		pinnedColumnIds?: readonly string[];
		collapsedColumnGroupIds?: readonly string[];
	}>;
