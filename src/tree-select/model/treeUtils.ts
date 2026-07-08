import { TreeMultiSelectValue, TreeSelectNode, TreeSelectValue } from "../types";

export type TreeNodeIndex = {
	rootIds: string[];
	nodeById: Map<string, TreeSelectNode>;
	parentById: Map<string, string | undefined>;
	childrenById: Map<string, string[]>;
	preorderIndexById: Map<string, number>;
	nodeIdByCodeValue: Map<string, string>;
};

export type TreeNodeSelectionState = {
	selectedIds: Set<string>;
	partialIds: Set<string>;
};

export type TreeVisibleEntry = {
	node: TreeSelectNode;
	level: number;
	parentId?: string;
	hasChildren: boolean;
	isExpanded: boolean;
	isLeaf: boolean;
};

function makeCodeValueKey(codeKey: string, value: string) {
	return `${codeKey}::${value}`;
}

export function createTreeNodeIndex(nodes: readonly TreeSelectNode[]): TreeNodeIndex {
	const nodeById = new Map<string, TreeSelectNode>();
	const parentById = new Map<string, string | undefined>();
	const childrenById = new Map<string, string[]>();
	const preorderIndexById = new Map<string, number>();
	const nodeIdByCodeValue = new Map<string, string>();
	let preorderIndex = 0;

	const walk = (node: TreeSelectNode, parentId?: string) => {
		nodeById.set(node.id, node);
		parentById.set(node.id, parentId);
		preorderIndexById.set(node.id, preorderIndex++);
		nodeIdByCodeValue.set(makeCodeValueKey(node.codeKey, node.value), node.id);

		const childIds = (node.children ?? []).map((child) => child.id);
		childrenById.set(node.id, childIds);

		for (const child of node.children ?? []) {
			walk(child, node.id);
		}
	};

	for (const node of nodes) {
		walk(node);
	}

	return {
		rootIds: nodes.map((node) => node.id),
		nodeById,
		parentById,
		childrenById,
		preorderIndexById,
		nodeIdByCodeValue
	};
}

export function treeSelectValueToId(value: TreeSelectValue | undefined, index: TreeNodeIndex) {
	if (!value) return undefined;
	return index.nodeIdByCodeValue.get(makeCodeValueKey(value.codeKey, value.value));
}

export function treeMultiValueToSelectedIds(value: TreeMultiSelectValue | undefined, index: TreeNodeIndex) {
	const selectedIds = new Set<string>();

	if (!value) {
		return selectedIds;
	}

	for (const [codeKey, values] of Object.entries(value)) {
		for (const itemValue of values) {
			const nodeId = index.nodeIdByCodeValue.get(makeCodeValueKey(codeKey, itemValue));
			if (nodeId) {
				selectedIds.add(nodeId);
			}
		}
	}

	return canonicalizeTreeSelection(selectedIds, index);
}

export function treeSelectedIdsToMultiValue(selectedIds: Set<string>, index: TreeNodeIndex): TreeMultiSelectValue {
	const orderedIds = [...selectedIds].sort(
		(leftId, rightId) =>
			(index.preorderIndexById.get(leftId) ?? Number.MAX_SAFE_INTEGER) -
			(index.preorderIndexById.get(rightId) ?? Number.MAX_SAFE_INTEGER)
	);
	const result: TreeMultiSelectValue = {};

	for (const nodeId of orderedIds) {
		const node = index.nodeById.get(nodeId);
		if (!node) continue;

		result[node.codeKey] = result[node.codeKey] ?? [];
		result[node.codeKey].push(node.value);
	}

	return result;
}

export function treeSelectValueToMultiValue(value: TreeSelectValue | undefined): TreeMultiSelectValue {
	if (!value) {
		return {};
	}

	return {
		[value.codeKey]: [value.value]
	};
}

function getAncestorIds(nodeId: string, index: TreeNodeIndex) {
	const ancestors: string[] = [];
	let currentId = index.parentById.get(nodeId);

	while (currentId) {
		ancestors.push(currentId);
		currentId = index.parentById.get(currentId);
	}

	return ancestors;
}

function isDescendantOf(nodeId: string, ancestorId: string, index: TreeNodeIndex) {
	let currentId = index.parentById.get(nodeId);

	while (currentId) {
		if (currentId === ancestorId) {
			return true;
		}

		currentId = index.parentById.get(currentId);
	}

	return false;
}

function removeDescendantSelections(selectedIds: Set<string>, nodeId: string, index: TreeNodeIndex) {
	for (const selectedId of [...selectedIds]) {
		if (isDescendantOf(selectedId, nodeId, index)) {
			selectedIds.delete(selectedId);
		}
	}
}

function isNodeFullySelected(nodeId: string, selectedIds: Set<string>, index: TreeNodeIndex): boolean {
	if (selectedIds.has(nodeId)) {
		return true;
	}

	const children = index.childrenById.get(nodeId) ?? [];
	if (children.length === 0) {
		return false;
	}

	return children.every((childId) => isNodeFullySelected(childId, selectedIds, index));
}

export function canonicalizeTreeSelection(selectedIds: Set<string>, index: TreeNodeIndex) {
	const nextSelectedIds = new Set(selectedIds);

	for (const selectedId of [...nextSelectedIds]) {
		if (getAncestorIds(selectedId, index).some((ancestorId) => nextSelectedIds.has(ancestorId))) {
			nextSelectedIds.delete(selectedId);
		}
	}

	const orderedNodeIds = [...index.nodeById.keys()].sort(
		(leftId, rightId) => (index.preorderIndexById.get(rightId) ?? 0) - (index.preorderIndexById.get(leftId) ?? 0)
	);

	for (const nodeId of orderedNodeIds) {
		const children = index.childrenById.get(nodeId) ?? [];

		if (children.length === 0 || nextSelectedIds.has(nodeId)) {
			continue;
		}

		if (children.every((childId) => isNodeFullySelected(childId, nextSelectedIds, index))) {
			removeDescendantSelections(nextSelectedIds, nodeId, index);
			nextSelectedIds.add(nodeId);
		}
	}

	return nextSelectedIds;
}

function expandNearestSelectedAncestor(selectedIds: Set<string>, nodeId: string, index: TreeNodeIndex) {
	let currentId = index.parentById.get(nodeId);

	while (currentId) {
		if (selectedIds.has(currentId)) {
			selectedIds.delete(currentId);

			for (const childId of index.childrenById.get(currentId) ?? []) {
				selectedIds.add(childId);
			}

			return true;
		}

		currentId = index.parentById.get(currentId);
	}

	return false;
}

export function isTreeNodeSelected(nodeId: string, selectedIds: Set<string>, index: TreeNodeIndex): boolean {
	if (selectedIds.has(nodeId)) {
		return true;
	}

	return getAncestorIds(nodeId, index).some((ancestorId) => selectedIds.has(ancestorId));
}

function resolveTreeSelectionState(nodeId: string, selectedIds: Set<string>, index: TreeNodeIndex, state: TreeNodeSelectionState) {
	const children = index.childrenById.get(nodeId) ?? [];

	if (selectedIds.has(nodeId)) {
		state.selectedIds.add(nodeId);
		return { selected: true, partial: false };
	}

	if (children.length === 0) {
		return { selected: false, partial: false };
	}

	const childStates = children.map((childId) => resolveTreeSelectionState(childId, selectedIds, index, state));
	const allSelected = childStates.every((childState) => childState.selected && !childState.partial);
	const hasAnySelected = childStates.some((childState) => childState.selected || childState.partial);

	if (allSelected) {
		state.selectedIds.add(nodeId);
		return { selected: true, partial: false };
	}

	if (hasAnySelected) {
		state.partialIds.add(nodeId);
		return { selected: false, partial: true };
	}

	return { selected: false, partial: false };
}

export function getTreeNodeSelectionState(selectedIds: Set<string>, index: TreeNodeIndex): TreeNodeSelectionState {
	const state: TreeNodeSelectionState = {
		selectedIds: new Set(),
		partialIds: new Set()
	};

	for (const rootId of index.rootIds) {
		resolveTreeSelectionState(rootId, selectedIds, index, state);
	}

	return state;
}

export function toggleTreeMultiSelection(currentValue: TreeMultiSelectValue | undefined, targetNodeId: string, index: TreeNodeIndex) {
	const selectedIds = treeMultiValueToSelectedIds(currentValue, index);

	const toggle = (targetId: string) => {
		if (isTreeNodeSelected(targetId, selectedIds, index)) {
			if (selectedIds.has(targetId)) {
				selectedIds.delete(targetId);
				return;
			}

			if (expandNearestSelectedAncestor(selectedIds, targetId, index)) {
				toggle(targetId);
			}

			return;
		}

		removeDescendantSelections(selectedIds, targetId, index);
		selectedIds.add(targetId);
	};

	toggle(targetNodeId);

	return treeSelectedIdsToMultiValue(canonicalizeTreeSelection(selectedIds, index), index);
}

function collectExpandedIds(nodeId: string, index: TreeNodeIndex, expandedIds: Set<string>) {
	let currentId = index.parentById.get(nodeId);

	while (currentId) {
		expandedIds.add(currentId);
		currentId = index.parentById.get(currentId);
	}
}

export function getSelectionExpandedIds(selectedIds: Set<string>, index: TreeNodeIndex) {
	const expandedIds = new Set<string>();

	for (const selectedId of selectedIds) {
		collectExpandedIds(selectedId, index, expandedIds);
	}

	return expandedIds;
}

function filterTreeNode(node: TreeSelectNode, normalizedQuery: string, expandedIds: Set<string>): TreeSelectNode | null {
	const filteredChildren = (node.children ?? [])
		.map((childNode) => filterTreeNode(childNode, normalizedQuery, expandedIds))
		.filter((childNode): childNode is TreeSelectNode => Boolean(childNode));
	const isMatched = node.searchText.toLowerCase().includes(normalizedQuery);

	if (!isMatched && filteredChildren.length === 0) {
		return null;
	}

	if (filteredChildren.length > 0) {
		expandedIds.add(node.id);
	}

	if (filteredChildren.length === 0) {
		return node;
	}

	return {
		...node,
		children: filteredChildren
	};
}

export function filterTreeNodes(nodes: readonly TreeSelectNode[], query: string) {
	const normalizedQuery = query.trim().toLowerCase();

	if (!normalizedQuery) {
		return {
			nodes: [...nodes],
			expandedIds: new Set<string>()
		};
	}

	const expandedIds = new Set<string>();
	const filteredNodes = nodes
		.map((node) => filterTreeNode(node, normalizedQuery, expandedIds))
		.filter((node): node is TreeSelectNode => Boolean(node));

	return {
		nodes: filteredNodes,
		expandedIds
	};
}

export function flattenVisibleTreeNodes(nodes: readonly TreeSelectNode[], expandedIds: Set<string>): TreeVisibleEntry[] {
	const entries: TreeVisibleEntry[] = [];

	const walk = (node: TreeSelectNode, level: number, parentId?: string) => {
		const hasChildren = (node.children?.length ?? 0) > 0;
		const isExpanded = hasChildren && expandedIds.has(node.id);

		entries.push({
			node,
			level,
			parentId,
			hasChildren,
			isExpanded,
			isLeaf: !hasChildren
		});

		if (!isExpanded) {
			return;
		}

		for (const childNode of node.children ?? []) {
			walk(childNode, level + 1, node.id);
		}
	};

	for (const node of nodes) {
		walk(node, 0);
	}

	return entries;
}
