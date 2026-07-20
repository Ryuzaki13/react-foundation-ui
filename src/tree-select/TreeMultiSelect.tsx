import { useMemo, useState } from "react";

import { MultiSelectToken } from "../multi-select";
import { usePickerSelectionLifecycle } from "../picker";
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

		return selectedNode.label;
	}

	return `${selectedIds.size} элементов`;
}

/**
 * Сравнивает семантический выбор по каноническим id дерева. Порядок ключей и
 * значений во внешнем Record не должен приводить к лишнему commit при закрытии.
 */
function areTreeMultiSelectionsEqual(
	left: TreeMultiSelectValue,
	right: TreeMultiSelectValue,
	treeIndex: ReturnType<typeof createTreeNodeIndex>
) {
	const leftIds = treeMultiValueToSelectedIds(left, treeIndex);
	const rightIds = treeMultiValueToSelectedIds(right, treeIndex);

	return leftIds.size === rightIds.size && [...leftIds].every((nodeId) => rightIds.has(nodeId));
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
	const [open, setOpen] = useState(false);
	const treeIndex = useMemo(() => createTreeNodeIndex(nodes), [nodes]);
	const { draftValue, setDraftValue, prepareOpen } = usePickerSelectionLifecycle({
		value,
		open,
		onCommit: onChange,
		isEqual: (left, right) => areTreeMultiSelectionsEqual(left, right, treeIndex)
	});
	const currentValue = open ? draftValue : value;
	const selectedIds = useMemo(() => treeMultiValueToSelectedIds(currentValue, treeIndex), [currentValue, treeIndex]);
	const selectionState = useMemo(() => getTreeNodeSelectionState(selectedIds, treeIndex), [selectedIds, treeIndex]);
	const selectedSummary = useMemo(() => formatTreeMultiSummary(selectedIds, treeIndex), [selectedIds, treeIndex]);
	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen && !open) {
			prepareOpen();
		}

		setOpen(nextOpen);
	};
	const selectAll = () => {
		setDraftValue(treeSelectedIdsToMultiValue(getSelectableTreeNodeIds(treeIndex), treeIndex));
	};
	const clearSelection = () => {
		setDraftValue({});

		if (!open) {
			onChange({});
		}
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
			open={open}
			onOpenChange={handleOpenChange}
			bulkActions={{
				onSelectAll: selectAll,
				onDeselectAll: () => setDraftValue({})
			}}
			triggerMode="search"
			selectedSummary={selectedSummary ? <MultiSelectToken value={selectedSummary} /> : undefined}
			query={query}
			defaultQuery={defaultQuery}
			onQuery={onQuery}
			onNodeActivate={(node) => {
				setDraftValue((currentDraftValue) => toggleTreeMultiSelection(currentDraftValue, node.id, treeIndex));
			}}
			onClearSelection={clearSelection}
			isLoading={isLoading}
			error={error}
		/>
	);
}
