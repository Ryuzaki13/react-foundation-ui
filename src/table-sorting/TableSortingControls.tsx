import { BrushCleaningIcon, SortAscIcon, SortDescIcon } from "lucide-react";

import { ContextMenu } from "../context-menu";

import { TABLE_SORT_ASC, TABLE_SORT_DESC, TABLE_SORT_CLEAR } from "./tableSortingConstants";

export type TableSortDirection = typeof TABLE_SORT_ASC | typeof TABLE_SORT_DESC;
export type TableSortingMenuAction = TableSortDirection | typeof TABLE_SORT_CLEAR;

type TableSortIndicatorProps = {
	direction?: TableSortDirection;
	order?: number;
	className?: string;
};

type TableSortingMenuItemsProps = {
	onSelect: (action: TableSortingMenuAction) => void;
	labels?: Partial<Record<TableSortingMenuAction, string>>;
};

const DEFAULT_SORTING_LABELS: Record<TableSortingMenuAction, string> = {
	asc: "По возрастанию",
	desc: "По убыванию",
	clear: "Сбросить"
};

export function TableSortIndicator({ direction, order, className }: TableSortIndicatorProps) {
	if (!direction) return null;

	return (
		<span className={className} aria-hidden>
			{direction === TABLE_SORT_DESC ? <SortDescIcon /> : <SortAscIcon />}
			{typeof order === "number" ? <span className="fontSizeXs">{order}</span> : null}
		</span>
	);
}

export function TableSortingMenuItems({ onSelect, labels }: TableSortingMenuItemsProps) {
	const resolvedLabels = {
		...DEFAULT_SORTING_LABELS,
		...labels
	};

	return (
		<>
			<ContextMenu.GroupLabel>Сортировка</ContextMenu.GroupLabel>
			<ContextMenu.Item icon={<SortAscIcon />} onSelect={() => onSelect(TABLE_SORT_ASC)}>
				{resolvedLabels.asc}
			</ContextMenu.Item>
			<ContextMenu.Item icon={<SortDescIcon />} onSelect={() => onSelect(TABLE_SORT_DESC)}>
				{resolvedLabels.desc}
			</ContextMenu.Item>
			<ContextMenu.Item icon={<BrushCleaningIcon />} onSelect={() => onSelect(TABLE_SORT_CLEAR)}>
				{resolvedLabels.clear}
			</ContextMenu.Item>
		</>
	);
}
