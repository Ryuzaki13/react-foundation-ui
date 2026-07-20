export type TreeSelectValue = {
	codeKey: string;
	value: string;
};

export type TreeMultiSelectValue = Record<string, string[]>;

/** Вариант представления опций множественного выбора без изменения tree-value контракта. */
export type TreeMultiSelectOptionsLayout = "tree" | "columns";

export type TreeSelectNode = {
	id: string;
	codeKey: string;
	value: string;
	label: string;
	code?: string;
	searchText: string;
	children?: TreeSelectNode[];
	disabled?: boolean;
};
