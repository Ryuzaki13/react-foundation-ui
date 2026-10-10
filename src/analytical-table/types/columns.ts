import { type ReactNode } from "react";

import {
	type AnalyticalColumn,
	type AnalyticalGroupingLevel,
	type AnalyticalModelRow
} from "@ryuzaki13/react-foundation-lib/analytical-table";
import { type FormattersPipelineConfig } from "@ryuzaki13/react-foundation-lib/formatters";

export type AnalyticalCellContext<T = unknown> = Readonly<{
	row: AnalyticalModelRow<T>;
	column: AnalyticalTableColumn<T>;
	value: unknown;
}>;

export type AnalyticalTableColumn<T = unknown> = AnalyticalColumn<T> &
	Readonly<{
		width?: number;
		minWidth?: number;
		align?: "start" | "center" | "end";
		sortable?: boolean;
		groupable?: boolean;
		/** Состав identity и подписи уровня, когда отображаемое поле не является уникальным ключом. */
		grouping?: AnalyticalGroupingLevel;
		filterable?: boolean;
		hideable?: boolean;
		tooltip?: boolean;
		/** Renderer исходных data rows; synthetic группы имеют отдельный renderGroup. */
		render?: (context: AnalyticalCellContext<T>) => ReactNode;
		renderGroup?: (context: AnalyticalCellContext<T>) => ReactNode;
		format?: (value: unknown, row: AnalyticalModelRow<T>) => string;
		formatting?: FormattersPipelineConfig;
		formatTotal?: (value: unknown) => string;
		renderTotal?: (value: unknown) => ReactNode;
	}>;

export type AnalyticalTableColumnGroup = Readonly<{
	id: string;
	label: string;
	columnIds: readonly string[];
	children?: readonly AnalyticalTableColumnGroup[];
	/** При сворачивании сохраняется указанная сводная колонка, иначе первая. */
	collapsedColumnId?: string;
}>;
