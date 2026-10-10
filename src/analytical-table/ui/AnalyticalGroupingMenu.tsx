import { ContextMenu } from "../../context-menu";
import { type AnalyticalTableRuntime } from "../types/runtime";

type AnalyticalGroupingMenuProps<T> = Readonly<{ groupId: string; runtime: AnalyticalTableRuntime<T>; disabled: boolean }>;

/** Уровень остаётся доступен из toolbar, даже когда его dimension скрыта в tree-подписи. */
export function AnalyticalGroupingMenu<T>({ groupId, runtime, disabled }: AnalyticalGroupingMenuProps<T>) {
	const groups = runtime.state.grouping ?? [];
	const index = groups.findIndex((group) => group.id === groupId);
	const group = groups[index];
	if (!group) return null;
	return (
		<>
			<ContextMenu.Item
				disabled={
					disabled ||
					(!group.showAsColumn &&
						(!(group.displayColumnIds ?? group.keyColumnIds).length ||
							!(group.displayColumnIds ?? group.keyColumnIds).every((id) =>
								runtime.columns.some((column) => column.id === id)
							)))
				}
				onSelect={() =>
					runtime.patchState({
						grouping: groups.map((item) => (item.id === groupId ? { ...item, showAsColumn: !item.showAsColumn } : item))
					})
				}>
				{group.showAsColumn ? "Показывать подпись в дереве" : "Показывать подпись в колонке"}
			</ContextMenu.Item>
			<ContextMenu.Item disabled={disabled || index <= 0} onSelect={() => runtime.moveGrouping(groupId, -1)}>
				Поднять уровень группировки
			</ContextMenu.Item>
			<ContextMenu.Item disabled={disabled || index === groups.length - 1} onSelect={() => runtime.moveGrouping(groupId, 1)}>
				Опустить уровень группировки
			</ContextMenu.Item>
			<ContextMenu.Item disabled={disabled} onSelect={() => runtime.ungroupColumn(groupId)}>
				Разгруппировать
			</ContextMenu.Item>
		</>
	);
}
