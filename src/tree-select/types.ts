export type TreeSelectValue = {
	codeKey: string;
	value: string;
};

export type TreeMultiSelectValue = Record<string, string[]>;

/** Вариант представления опций множественного выбора без изменения tree-value контракта. */
export type TreeMultiSelectOptionsLayout = "tree" | "columns";

/**
 * Определяет, какое значение представляет узел при множественном выборе.
 *
 * `self` сохраняет собственные `codeKey/value`. `descendants` превращает узел
 * в виртуальную группу: клик переключает доступных потомков, а сама группа
 * никогда не попадает в сериализованный `TreeMultiSelectValue`.
 */
export type TreeMultiSelectNodeSelectionBehavior = "self" | "descendants";

export type TreeSelectNode = {
	id: string;
	codeKey: string;
	value: string;
	label: string;
	code?: string;
	searchText: string;
	children?: TreeSelectNode[];
	disabled?: boolean;
	selectionBehavior?: TreeMultiSelectNodeSelectionBehavior;
};
