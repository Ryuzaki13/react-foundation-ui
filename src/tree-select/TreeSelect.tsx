import { useMemo } from "react";

import { UiBaseProps } from "../types";

import { createTreeNodeIndex, treeSelectValueToId } from "./model/treeUtils";
import { TreePickerBase } from "./TreePickerBase";
import { TreeSelectNode, TreeSelectValue } from "./types";

export interface TreeSelectProps extends Omit<UiBaseProps<TreeSelectValue | undefined>, "placeholder"> {
	nodes: readonly TreeSelectNode[];
	placeholder?: string;
	query?: string;
	defaultQuery?: string;
	onQuery?: (value: string) => void;
	isLoading?: boolean;
	error?: string;
	clearable?: boolean;
}

function formatTreeNodeSummary(node: TreeSelectNode | undefined) {
	if (!node) {
		return undefined;
	}

	if (node.code && node.code !== node.label) {
		return `${node.label} · ${node.code}`;
	}

	return node.label;
}

export function TreeSelect({
	label,
	description,
	disabled,
	placeholder = "Выберите значение",
	size,
	nodes,
	value,
	onChange,
	query,
	defaultQuery,
	onQuery,
	isLoading,
	error,
	clearable = false
}: TreeSelectProps) {
	const treeIndex = useMemo(() => createTreeNodeIndex(nodes), [nodes]);
	const selectedId = treeSelectValueToId(value, treeIndex);
	const selectedNode = selectedId ? treeIndex.nodeById.get(selectedId) : undefined;

	return (
		<TreePickerBase
			label={label}
			description={description}
			disabled={disabled}
			placeholder={placeholder}
			size={size}
			nodes={nodes}
			selectedIds={selectedId ? new Set([selectedId]) : new Set()}
			partialIds={new Set()}
			selectionMode="single"
			triggerMode="search"
			selectedSummaryText={formatTreeNodeSummary(selectedNode)}
			query={query}
			defaultQuery={defaultQuery}
			onQuery={onQuery}
			onNodeActivate={(node) => onChange({ codeKey: node.codeKey, value: node.value })}
			onClearSelection={clearable ? () => onChange(undefined) : undefined}
			isLoading={isLoading}
			error={error}
		/>
	);
}
