import { ArrowDownToLineIcon, Columns3Icon, FoldVerticalIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "../../button";
import { CheckBox } from "../../check-box";
import { DropdownMenu } from "../../context-menu";
import { FlexContainer } from "../../flex";
import { Notice } from "../../misc";
import { useAnalyticalExport } from "../model/useAnalyticalExport";
import { type AnalyticalTableProps, type AnalyticalTableRuntime } from "../types/analyticalTable";

import { AnalyticalGroupingMenu } from "./AnalyticalGroupingMenu";
import styles from "./AnalyticalTable.module.scss";

/** Настройки и команды доступны с клавиатуры и на touch, без обязательного context menu. */
type AnalyticalTableToolbarProps<T> = Readonly<{ runtime: AnalyticalTableRuntime<T>; options: AnalyticalTableProps<T> }>;

export function AnalyticalTableToolbar<T>({ runtime, options }: AnalyticalTableToolbarProps<T>) {
	const exporter = useAnalyticalExport(options, runtime);
	return (
		<FlexContainer column gap="xs" className={styles.toolbar}>
			<FlexContainer wrap gap="xs" align="center">
				<DropdownMenu>
					<DropdownMenu.Trigger>
						<Button appearance="outline" icon={<Columns3Icon />} data-action="configure-analytical-columns">
							Колонки
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<FlexContainer column gap="xs">
							{runtime.columns.map((column) => (
								<CheckBox
									key={column.id}
									label={column.label ?? column.id}
									data-column-id={column.id}
									value={!runtime.state.hiddenColumnIds?.includes(column.id)}
									disabled={
										column.hideable === false ||
										(runtime.visibleColumns.length <= 1 && runtime.visibleColumns.some((item) => item.id === column.id))
									}
									onChange={(visible) =>
										visible
											? runtime.patchState({
													hiddenColumnIds: runtime.state.hiddenColumnIds?.filter((id) => id !== column.id)
												})
											: runtime.hideColumn(column.id)
									}
								/>
							))}
						</FlexContainer>
					</DropdownMenu.Content>
				</DropdownMenu>
				<Button
					appearance="outline"
					icon={<FoldVerticalIcon />}
					data-action="collapse-analytical-all"
					disabled={!runtime.model.flatRows.some((row) => row.isExpanded)}
					onClick={runtime.collapseAll}>
					Свернуть всё
				</Button>
				{options.onRefresh ? (
					<Button
						appearance="outline"
						icon={<RefreshCwIcon />}
						data-action="refresh-analytical-table"
						disabled={options.isFetching}
						onClick={options.onRefresh}>
						{options.isFetching ? "Обновление…" : "Обновить"}
					</Button>
				) : null}
				{options.onExport ? (
					<Button
						appearance="outline"
						icon={<ArrowDownToLineIcon />}
						data-action="export-analytical-table"
						disabled={exporter.isExporting}
						onClick={() => void exporter.exportData()}>
						{exporter.isExporting ? "Выгрузка…" : "Выгрузить"}
					</Button>
				) : null}
				{runtime.state.grouping?.map((group) => (
					<DropdownMenu key={group.id}>
						<DropdownMenu.Trigger>
							<Button appearance="ghost" data-action="configure-analytical-group" data-group-id={group.id}>
								{group.label ?? group.id}
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							<AnalyticalGroupingMenu groupId={group.id} runtime={runtime} disabled={options.enableGrouping === false} />
						</DropdownMenu.Content>
					</DropdownMenu>
				))}
				{runtime.state.filters?.map((filter) => (
					<Button
						key={filter.id}
						appearance="ghost"
						data-action="clear-analytical-filter"
						data-column-id={filter.id}
						onClick={() =>
							runtime.clearFilter(filter.id)
						}>{`${runtime.columns.find((column) => column.id === filter.id)?.label ?? filter.id}: ${String(filter.value ?? "")} ×`}</Button>
				))}
			</FlexContainer>
			{exporter.error ? (
				<Notice isError role="alert">
					{exporter.error}
				</Notice>
			) : null}
		</FlexContainer>
	);
}
