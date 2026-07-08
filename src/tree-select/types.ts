export type TreeSelectValue = {
	codeKey: string;
	value: string;
};

export type TreeMultiSelectValue = Record<string, string[]>;

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
