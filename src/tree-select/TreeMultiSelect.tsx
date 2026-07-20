import { useMemo } from "react";

import { UiBaseProps } from "../types";

import {
	createTreeNodeIndex,
	getSelectableTreeNodeIds,
	getTreeNodeSelectionState,
	toggleTreeMultiSelection,
	treeMultiValueToSelectedIds,
	treeSelectedIdsToMultiValue
} from "./model/treeUtils";
import { TreePickerBase } from "./TreePickerBase";
import { TreeMultiSelectOptionsLayout, TreeMultiSelectValue, TreeSelectNode } from "./types";

export interface TreeMultiSelectProps extends Omit<UiBaseProps<TreeMultiSelectValue>, "placeholder"> {
	nodes: readonly TreeSelectNode[];
	placeholder?: string;
	query?: string;
	defaultQuery?: string;
	onQuery?: (value: string) => void;
	isLoading?: boolean;
	error?: string;
	/** Определяет обычное раскрываемое дерево или полностью открытый адаптивный набор колонок. */
	optionsLayout?: TreeMultiSelectOptionsLayout;
}

function formatTreeMultiSummary(selectedIds: Set<string>, treeIndex: ReturnType<typeof createTreeNodeIndex>) {
	if (selectedIds.size === 0) {
		return undefined;
	}

	if (selectedIds.size === 1) {
		const selectedNode = treeIndex.nodeById.get([...selectedIds][0]);

		if (!selectedNode) {
			return undefined;
		}

		if (selectedNode.code && selectedNode.code !== selectedNode.label) {
			return `${selectedNode.label} · ${selectedNode.code}`;
		}

		return selectedNode.label;
	}

	return `Выбрано ${selectedIds.size} узл.`;
}

export function TreeMultiSelect({
	label,
	description,
	disabled,
	placeholder = "Выберите значения",
	size,
	nodes,
	value,
	onChange,
	query,
	defaultQuery,
	onQuery,
	isLoading,
	error,
	optionsLayout = "tree"
}: TreeMultiSelectProps) {
	const treeIndex = useMemo(() => createTreeNodeIndex(nodes), [nodes]);
	const selectedIds = useMemo(() => treeMultiValueToSelectedIds(value, treeIndex), [treeIndex, value]);
	const selectionState = useMemo(() => getTreeNodeSelectionState(selectedIds, treeIndex), [selectedIds, treeIndex]);
	const selectedSummary = useMemo(() => formatTreeMultiSummary(selectedIds, treeIndex), [selectedIds, treeIndex]);
	const selectAll = () => {
		onChange(treeSelectedIdsToMultiValue(getSelectableTreeNodeIds(treeIndex), treeIndex));
	};

	return (
		<TreePickerBase
			label={label}
			description={description}
			disabled={disabled}
			placeholder={placeholder}
			size={size}
			nodes={nodes}
			selectedIds={selectionState.selectedIds}
			partialIds={selectionState.partialIds}
			selectionMode="multi"
			optionsLayout={optionsLayout}
			bulkActions={{
				onSelectAll: selectAll,
				onDeselectAll: () => onChange({})
			}}
			triggerMode="search"
			selectedSummary={selectedSummary}
			query={query}
			defaultQuery={defaultQuery}
			onQuery={onQuery}
			onNodeActivate={(node) => onChange(toggleTreeMultiSelection(value, node.id, treeIndex))}
			onClearSelection={() => onChange({})}
			isLoading={isLoading}
			error={error}
		/>
	);
}
