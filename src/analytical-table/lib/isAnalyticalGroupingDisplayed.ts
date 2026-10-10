import { type AnalyticalTableColumn } from "../types/columns";
import { type AnalyticalTableState } from "../types/state";

/** Скрытая header-группой display-колонка не должна уничтожать подпись дерева. */
export function isAnalyticalGroupingDisplayed<T>(
	group: NonNullable<AnalyticalTableState["grouping"]>[number] | undefined,
	columns: readonly AnalyticalTableColumn<T>[]
) {
	if (!group?.showAsColumn) return false;
	const ids = group.displayColumnIds ?? group.keyColumnIds;
	return ids.length > 0 && ids.every((id) => columns.some((column) => column.id === id));
}
