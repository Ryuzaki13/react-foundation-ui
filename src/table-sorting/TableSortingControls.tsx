import { BrushCleaningIcon, SortAscIcon, SortDescIcon } from "lucide-react";

import { ContextMenu } from "../context-menu";

export type TableSortDirection = "asc" | "desc";
export type TableSortingMenuAction = TableSortDirection | "clear";

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
			{direction === "desc" ? <SortDescIcon /> : <SortAscIcon />}
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
			<ContextMenu.Item icon={<SortAscIcon />} onSelect={() => onSelect("asc")}>
				{resolvedLabels.asc}
			</ContextMenu.Item>
			<ContextMenu.Item icon={<SortDescIcon />} onSelect={() => onSelect("desc")}>
				{resolvedLabels.desc}
			</ContextMenu.Item>
			<ContextMenu.Item icon={<BrushCleaningIcon />} onSelect={() => onSelect("clear")}>
				{resolvedLabels.clear}
			</ContextMenu.Item>
		</>
	);
}
