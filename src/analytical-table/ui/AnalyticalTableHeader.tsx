import { buildAnalyticalHeaderRows } from "../lib/analyticalHeaderGroups";
import { type AnalyticalTableLayout } from "../lib/analyticalTableLayout";
import { type AnalyticalTableProps, type AnalyticalTableRuntime } from "../types/analyticalTable";

import { AnalyticalColumnGroupHeader } from "./AnalyticalColumnGroupHeader";
import { AnalyticalHeaderCell } from "./AnalyticalHeaderCell";
import styles from "./AnalyticalTable.module.scss";

/** Все строки шапки закреплены одним thead; DnD-root располагается снаружи native table. */
type AnalyticalTableHeaderProps<T> = Readonly<{
	runtime: AnalyticalTableRuntime<T>;
	layout: AnalyticalTableLayout;
	options: AnalyticalTableProps<T>;
	selection: boolean;
	setHeaderElement: (element: HTMLTableSectionElement | null) => void;
}>;

export function AnalyticalTableHeader<T>({ runtime, layout, options, selection, setHeaderElement }: AnalyticalTableHeaderProps<T>) {
	const rows = buildAnalyticalHeaderRows(
		runtime.visibleColumns.map((column) => column.id),
		layout.pinnedOffsets,
		options.columnGroups
	);
	return (
		<thead ref={setHeaderElement} className={styles.header}>
			{rows.map((segments, level) => (
				<tr key={level}>
					<th className={styles.headerNoopCell} colSpan={selection ? 2 : 1} />
					{segments.map((segment) => (
						<AnalyticalColumnGroupHeader key={segment.id} {...segment} runtime={runtime} />
					))}
				</tr>
			))}
			<tr>
				<th className={styles.headerNoopCell} colSpan={selection ? 2 : 1} aria-label="Управление строками" />
				{runtime.visibleColumns.map((column) => (
					<AnalyticalHeaderCell key={column.id} column={column} runtime={runtime} layout={layout} options={options} />
				))}
			</tr>
		</thead>
	);
}
