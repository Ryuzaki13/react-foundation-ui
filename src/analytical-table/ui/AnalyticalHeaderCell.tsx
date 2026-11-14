import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { EllipsisVerticalIcon } from "lucide-react";

import { ContextMenu, DropdownMenu } from "../../context-menu";
import { FlexContainer } from "../../flex";
import { TableHeaderInteractionCell } from "../../table-column-interactions";
import { TableSortIndicator } from "../../table-sorting";
import { TABLE_SORT_DESC, TABLE_SORT_ASC } from "../../table-sorting/tableSortingConstants";
import { ANALYTICAL_MIN_COLUMN_WIDTH_PX, ANALYTICAL_DEFAULT_COLUMN_WIDTH_PX } from "../lib/analyticalTableConstants";
import { type AnalyticalTableLayout } from "../lib/analyticalTableLayout";
import { type AnalyticalTableColumn, type AnalyticalTableProps, type AnalyticalTableRuntime } from "../types/analyticalTable";

import { AnalyticalColumnMenu } from "./AnalyticalColumnMenu";
import styles from "./AnalyticalTable.module.scss";

/** Drag, resize и меню используют общие primitives, сохраняя геометрию шапки ARM. */
type AnalyticalHeaderCellProps<T> = Readonly<{
	column: AnalyticalTableColumn<T>;
	runtime: AnalyticalTableRuntime<T>;
	layout: AnalyticalTableLayout;
	options: AnalyticalTableProps<T>;
}>;

export function AnalyticalHeaderCell<T>({ column, runtime, layout, options }: AnalyticalHeaderCellProps<T>) {
	const offset = layout.pinnedOffsets.get(column.id);
	const sortIndex = runtime.state.sorting?.findIndex((sort) => sort.id === column.id) ?? -1;
	const sort = runtime.state.sorting?.[sortIndex];
	return (
		<TableHeaderInteractionCell
			columnId={column.id}
			data-column-id={column.id}
			aria-sort={sort ? (sort.desc ? "descending" : "ascending") : "none"}
			dragDisabled={options.enableColumnReordering === false || offset !== undefined}
			className={cn(styles.headerCell, offset !== undefined && styles.cellPinned)}
			draggingClassName={styles.headerCellDragging}
			style={{ insetInlineStart: offset }}
			resizeHandle={
				options.enableColumnResizing === false
					? undefined
					: {
							columnId: column.id,
							minWidth: column.minWidth ?? ANALYTICAL_MIN_COLUMN_WIDTH_PX,
							getStartWidth: () =>
								runtime.state.columnWidths?.[column.id] ?? column.width ?? ANALYTICAL_DEFAULT_COLUMN_WIDTH_PX,
							onResize: runtime.resizeColumn,
							onReset: () => runtime.resizeColumn(column.id, column.width ?? ANALYTICAL_DEFAULT_COLUMN_WIDTH_PX)
						}
			}>
			{({ listeners, attributes, setActivatorElement }) => (
				<ContextMenu>
					<ContextMenu.Trigger>
						<div className={styles.headerCellInner}>
							<button
								{...attributes}
								{...listeners}
								ref={setActivatorElement}
								type="button"
								className={styles.headerButton}
								data-action="sort-analytical-column"
								data-column-id={column.id}
								onClick={(event) => runtime.sortColumn(column.id, undefined, event.shiftKey)}
								title="Клик: сортировка; Shift+клик: несколько колонок; перетаскивание: порядок">
								<FlexContainer align="center" justify="between" gap="xs">
									<span>{column.label ?? column.id}</span>
									<TableSortIndicator
										direction={sort ? (sort.desc ? TABLE_SORT_DESC : TABLE_SORT_ASC) : undefined}
										order={sort ? sortIndex + 1 : undefined}
									/>
								</FlexContainer>
							</button>
							<DropdownMenu>
								<DropdownMenu.Trigger>
									<button
										type="button"
										data-action="analytical-column-menu"
										data-column-id={column.id}
										aria-label={`Настройки колонки ${column.label ?? column.id}`}>
										<EllipsisVerticalIcon />
									</button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content>
									<AnalyticalColumnMenu
										column={column}
										runtime={runtime}
										enableGrouping={options.enableGrouping !== false}
									/>
								</DropdownMenu.Content>
							</DropdownMenu>
						</div>
					</ContextMenu.Trigger>
					<ContextMenu.Content>
						<AnalyticalColumnMenu column={column} runtime={runtime} enableGrouping={options.enableGrouping !== false} />
					</ContextMenu.Content>
				</ContextMenu>
			)}
		</TableHeaderInteractionCell>
	);
}
