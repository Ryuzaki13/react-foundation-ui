import { ContextMenu } from "../../context-menu";
import { TableSortingMenuItems } from "../../table-sorting";
import { type AnalyticalTableColumn, type AnalyticalTableRuntime } from "../types/analyticalTable";

import { AnalyticalGroupingMenu } from "./AnalyticalGroupingMenu";

/** Меню описывает только команды представления и не знает транспорт или проектные роли. */
type AnalyticalColumnMenuProps<T> = Readonly<{
	column: AnalyticalTableColumn<T>;
	runtime: AnalyticalTableRuntime<T>;
	enableGrouping: boolean;
}>;

export function AnalyticalColumnMenu<T>({ column, runtime, enableGrouping }: AnalyticalColumnMenuProps<T>) {
	const groupId = column.grouping?.id ?? column.id;
	const grouped = runtime.state.grouping?.some((group) => group.id === groupId);
	return (
		<>
			{column.sortable !== false ? (
				<TableSortingMenuItems onSelect={(direction) => runtime.sortColumn(column.id, direction, true)} />
			) : null}
			{enableGrouping && column.groupable !== false && column.kind !== "measure" ? (
				<div data-action="group-analytical-column">
					<ContextMenu.Item onSelect={() => (grouped ? runtime.ungroupColumn(groupId) : runtime.groupColumn(column.id))}>
						{grouped ? "Разгруппировать" : "Группировать"}
					</ContextMenu.Item>
				</div>
			) : null}
			{grouped ? <AnalyticalGroupingMenu groupId={groupId} runtime={runtime} disabled={!enableGrouping} /> : null}
			<ContextMenu.Separator />
			<ContextMenu.Item onSelect={() => runtime.pinColumn(column.id)}>
				{runtime.state.pinnedColumnIds?.includes(column.id) ? "Снять закрепление" : "Закрепить"}
			</ContextMenu.Item>
			{column.hideable !== false ? (
				<ContextMenu.Item disabled={runtime.visibleColumns.length <= 1} onSelect={() => runtime.hideColumn(column.id)}>
					Скрыть колонку
				</ContextMenu.Item>
			) : null}
			{runtime.state.filters?.some((filter) => filter.id === column.id) ? (
				<ContextMenu.Item onSelect={() => runtime.clearFilter(column.id)}>Сбросить фильтр колонки</ContextMenu.Item>
			) : null}
		</>
	);
}
