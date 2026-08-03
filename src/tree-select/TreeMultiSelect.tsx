import { useMemo, useState } from "react";

import { MultiSelectToken } from "../multi-select";
import { formatOptionCount } from "../multi-select/ui/defaultRenderers";
import { usePickerSelectionLifecycle } from "../picker";
import { UiBaseProps } from "../types";

import {
	createTreeNodeIndex,
	getSelectableTreeNodeIds,
	getTreeNodeSelectionState,
	isTreeNodeSelected,
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
	/**
	 * Ключи уровней, узлы которых раскрываются до ручного действия пользователя.
	 * В режиме `columns` дерево по-прежнему отображается полностью раскрытым.
	 */
	defaultExpandedCodeKeys?: readonly string[];
}

function formatTreeMultiSummary(selectedIds: Set<string>, treeIndex: ReturnType<typeof createTreeNodeIndex>) {
	const serializedValue = treeSelectedIdsToMultiValue(selectedIds, treeIndex);
	const selectedPredicateCount = Object.values(serializedValue).reduce((count, values) => count + values.length, 0);
	if (selectedPredicateCount === 0) {
		return undefined;
	}

	if (selectedPredicateCount === 1) {
		const selectedNodeId = [...selectedIds].sort(
			(leftId, rightId) =>
				(treeIndex.preorderIndexById.get(leftId) ?? Number.MAX_SAFE_INTEGER) -
				(treeIndex.preorderIndexById.get(rightId) ?? Number.MAX_SAFE_INTEGER)
		)[0];
		const selectedNode = treeIndex.nodeById.get(selectedNodeId);

		if (!selectedNode) {
			return undefined;
		}

		return selectedNode.label;
	}

	return formatOptionCount(selectedPredicateCount);
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
	optionsLayout = "tree",
	defaultExpandedCodeKeys
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
	const unavailableNodeIds = useMemo(
		() =>
			new Set(
				[...treeIndex.nodeById.keys()].filter(
					(nodeId) =>
						treeIndex.nodeById.get(nodeId)?.disabled !== true &&
						!isTreeNodeSelected(nodeId, selectedIds, treeIndex) &&
						!selectionState.selectedIds.has(nodeId) &&
						getSelectableTreeNodeIds(treeIndex, [nodeId]).size === 0
				)
			),
		[selectedIds, selectionState.selectedIds, treeIndex]
	);
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
			defaultExpandedCodeKeys={defaultExpandedCodeKeys}
			unavailableNodeIds={unavailableNodeIds}
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
