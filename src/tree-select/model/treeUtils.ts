import { TreeMultiSelectValue, TreeSelectNode, TreeSelectValue } from "../types";

export type TreeNodeIndex = {
	rootIds: string[];
	nodeById: Map<string, TreeSelectNode>;
	parentById: Map<string, string | undefined>;
	childrenById: Map<string, string[]>;
	preorderIndexById: Map<string, number>;
	nodeIdByCodeValue: Map<string, string>;
	/** Все визуальные узлы одного сериализуемого значения в порядке обхода дерева. */
	nodeIdsByCodeValue: Map<string, string[]>;
	/** Признак disabled-ограничения в узле или любом его потомке. */
	subtreeContainsDisabledById: Map<string, boolean>;
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
	const nodeIdsByCodeValue = new Map<string, string[]>();
	const subtreeContainsDisabledById = new Map<string, boolean>();
	let preorderIndex = 0;

	const walk = (node: TreeSelectNode, parentId?: string) => {
		nodeById.set(node.id, node);
		parentById.set(node.id, parentId);
		preorderIndexById.set(node.id, preorderIndex++);
		const codeValueKey = makeCodeValueKey(node.codeKey, node.value);
		nodeIdByCodeValue.set(codeValueKey, node.id);
		const equivalentNodeIds = nodeIdsByCodeValue.get(codeValueKey);
		if (equivalentNodeIds) {
			equivalentNodeIds.push(node.id);
		} else {
			nodeIdsByCodeValue.set(codeValueKey, [node.id]);
		}

		const childIds = (node.children ?? []).map((child) => child.id);
		childrenById.set(node.id, childIds);

		for (const child of node.children ?? []) {
			walk(child, node.id);
		}

		subtreeContainsDisabledById.set(
			node.id,
			node.disabled === true || childIds.some((childId) => subtreeContainsDisabledById.get(childId) === true)
		);
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
		nodeIdByCodeValue,
		nodeIdsByCodeValue,
		subtreeContainsDisabledById
	};
}

/** Возвращает все визуальные представления одного сериализуемого значения. */
function getEquivalentTreeNodeIds(nodeId: string, index: TreeNodeIndex) {
	const node = index.nodeById.get(nodeId);
	if (!node) return [];

	return index.nodeIdsByCodeValue.get(makeCodeValueKey(node.codeKey, node.value)) ?? [];
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
			for (const nodeId of index.nodeIdsByCodeValue.get(makeCodeValueKey(codeKey, itemValue)) ?? []) {
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
	const serializedCodeValues = new Set<string>();

	for (const nodeId of orderedIds) {
		const node = index.nodeById.get(nodeId);
		if (!node) continue;
		const codeValueKey = makeCodeValueKey(node.codeKey, node.value);
		if (serializedCodeValues.has(codeValueKey)) continue;

		result[node.codeKey] = result[node.codeKey] ?? [];
		result[node.codeKey].push(node.value);
		serializedCodeValues.add(codeValueKey);
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

/**
 * Проверяет, можно ли безопасно синхронизировать повторные визуальные узлы
 * одним server predicate. Disabled-поддеревья, виртуальные группы и вложенные
 * дубли требуют более точного выбора на уровне доступных потомков.
 */
function canSynchronizeEquivalentTreeNodes(nodeId: string, index: TreeNodeIndex) {
	const equivalentNodeIds = getEquivalentTreeNodeIds(nodeId, index);
	if (!equivalentNodeIds.length) return false;

	if (
		equivalentNodeIds.some((equivalentNodeId) => {
			const node = index.nodeById.get(equivalentNodeId);
			return !node || node.selectionBehavior === "descendants" || index.subtreeContainsDisabledById.get(equivalentNodeId) === true;
		})
	) {
		return false;
	}

	return !equivalentNodeIds.some((candidateId, candidateIndex) =>
		equivalentNodeIds.some(
			(otherId, otherIndex) =>
				candidateIndex !== otherIndex &&
				(isDescendantOf(candidateId, otherId, index) || isDescendantOf(otherId, candidateId, index))
		)
	);
}

/** Возвращает эквивалентные узлы только для безопасно синхронизируемого predicate. */
function getSynchronizedEquivalentTreeNodeIds(nodeId: string, index: TreeNodeIndex) {
	return canSynchronizeEquivalentTreeNodes(nodeId, index) ? getEquivalentTreeNodeIds(nodeId, index) : [nodeId];
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
	if (index.nodeById.get(nodeId)?.disabled) {
		return false;
	}

	const children = index.childrenById.get(nodeId) ?? [];
	if (children.length === 0) {
		return false;
	}

	return children.every((childId) => isNodeFullySelected(childId, selectedIds, index));
}

export function canonicalizeTreeSelection(selectedIds: Set<string>, index: TreeNodeIndex) {
	const nextSelectedIds = new Set(selectedIds);

	/*
	 * Внешнее значение могло быть сохранено до того, как узел стал виртуальной
	 * группой. Разворачиваем такой выбор в актуальное покрытие потомков, чтобы
	 * group-id не протекал обратно в публичный TreeMultiSelectValue.
	 */
	for (const selectedId of [...nextSelectedIds]) {
		if (index.nodeById.get(selectedId)?.selectionBehavior !== "descendants") continue;

		nextSelectedIds.delete(selectedId);
		for (const descendantId of getSelectableTreeNodeIds(index, index.childrenById.get(selectedId) ?? [])) {
			nextSelectedIds.add(descendantId);
		}
	}

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

		if (
			children.length === 0 ||
			nextSelectedIds.has(nodeId) ||
			index.nodeById.get(nodeId)?.disabled ||
			index.nodeById.get(nodeId)?.selectionBehavior === "descendants"
		) {
			continue;
		}

		if (children.every((childId) => isNodeFullySelected(childId, nextSelectedIds, index))) {
			const equivalentNodeIds = getEquivalentTreeNodeIds(nodeId, index);
			const canCollapseEquivalentNodes =
				canSynchronizeEquivalentTreeNodes(nodeId, index) &&
				equivalentNodeIds.every((equivalentNodeId) => {
					const equivalentNode = index.nodeById.get(equivalentNodeId);
					return (
						equivalentNode &&
						!equivalentNode.disabled &&
						equivalentNode.selectionBehavior !== "descendants" &&
						isNodeFullySelected(equivalentNodeId, nextSelectedIds, index)
					);
				});

			/*
			 * Одинаковый server predicate может быть показан в нескольких ветвях.
			 * Схлопывать детей в parent безопасно только при полном покрытии всех
			 * его визуальных представлений, иначе сериализация расширила бы выбор.
			 */
			if (canCollapseEquivalentNodes) {
				for (const equivalentNodeId of equivalentNodeIds) {
					removeDescendantSelections(nextSelectedIds, equivalentNodeId, index);
					nextSelectedIds.add(equivalentNodeId);
				}
			}
		}
	}

	return nextSelectedIds;
}

function expandNearestSelectedAncestor(selectedIds: Set<string>, nodeId: string, index: TreeNodeIndex) {
	let currentId = index.parentById.get(nodeId);

	while (currentId) {
		if (selectedIds.has(currentId)) {
			for (const equivalentAncestorId of getEquivalentTreeNodeIds(currentId, index)) {
				if (!selectedIds.has(equivalentAncestorId)) continue;
				selectedIds.delete(equivalentAncestorId);

				/*
				 * Узел мог стать disabled уже после сохранения выбора его ancestor.
				 * При частичном снятии разворачиваем все представления одного server
				 * predicate только в их актуально доступное покрытие.
				 */
				for (const childId of getSelectableTreeNodeIds(index, index.childrenById.get(equivalentAncestorId) ?? [])) {
					selectedIds.add(childId);
				}
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

/**
 * Строит каноническое покрытие всех доступных узлов для массового выбора.
 * Ветка схлопывается в parent только тогда, когда внутри неё нет disabled-узлов;
 * иначе выбираются доступные дочерние поддеревья, не затрагивая запреты.
 */
export function getSelectableTreeNodeIds(index: TreeNodeIndex, rootIds: readonly string[] = index.rootIds): Set<string> {
	const collectSubtree = (nodeId: string): { containsDisabled: boolean; selectedIds: string[] } => {
		const node = index.nodeById.get(nodeId);
		const childSelections = (index.childrenById.get(nodeId) ?? []).map(collectSubtree);
		const selectedChildIds = childSelections.flatMap((selection) => selection.selectedIds);
		const containsDisabled = node?.disabled === true || childSelections.some((selection) => selection.containsDisabled);

		if (!node || node.disabled) {
			return { containsDisabled: true, selectedIds: selectedChildIds };
		}
		if (node.selectionBehavior === "descendants") {
			return { containsDisabled, selectedIds: selectedChildIds };
		}
		const containsUnsafeEquivalent = !canSynchronizeEquivalentTreeNodes(nodeId, index);

		return containsDisabled || containsUnsafeEquivalent
			? { containsDisabled: true, selectedIds: selectedChildIds }
			: { containsDisabled: false, selectedIds: [nodeId] };
	};

	return new Set(rootIds.flatMap((rootId) => collectSubtree(rootId).selectedIds));
}

export function toggleTreeMultiSelection(currentValue: TreeMultiSelectValue | undefined, targetNodeId: string, index: TreeNodeIndex) {
	const selectedIds = treeMultiValueToSelectedIds(currentValue, index);

	const toggle = (targetId: string) => {
		if (selectedIds.has(targetId)) {
			for (const equivalentTargetId of getEquivalentTreeNodeIds(targetId, index)) {
				selectedIds.delete(equivalentTargetId);
			}
			return;
		}

		if (isTreeNodeSelected(targetId, selectedIds, index)) {
			if (expandNearestSelectedAncestor(selectedIds, targetId, index)) {
				toggle(targetId);
			}

			return;
		}

		for (const equivalentTargetId of getSynchronizedEquivalentTreeNodeIds(targetId, index)) {
			removeDescendantSelections(selectedIds, equivalentTargetId, index);
			selectedIds.add(equivalentTargetId);
		}
	};

	const resolvedSelectableTargetIds = [...getSelectableTreeNodeIds(index, [targetNodeId])];
	/* Небезопасный сохранённый predicate остаётся доступен для явного снятия. */
	const selectableTargetIds =
		resolvedSelectableTargetIds.length === 0 && selectedIds.has(targetNodeId) ? [targetNodeId] : resolvedSelectableTargetIds;
	const allSelectableTargetsSelected =
		selectableTargetIds.length > 0 && selectableTargetIds.every((nodeId) => isTreeNodeSelected(nodeId, selectedIds, index));

	for (const selectableTargetId of selectableTargetIds) {
		const selected = isTreeNodeSelected(selectableTargetId, selectedIds, index);
		if ((allSelectableTargetsSelected && selected) || (!allSelectableTargetsSelected && !selected)) {
			toggle(selectableTargetId);
		}
	}

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

/**
 * Вычисляет базовое раскрытие дерева из политики уровней и ручных действий.
 *
 * Ручное значение хранится отдельно для каждого node id и имеет приоритет над
 * default уровня. Благодаря вычислению по актуальному индексу узлы, загруженные
 * асинхронно, получают настройку без синхронизации props в React state.
 */
export function getConfiguredTreeExpandedIds(
	index: TreeNodeIndex,
	defaultExpandedCodeKeys: ReadonlySet<string>,
	manualExpansionById: ReadonlyMap<string, boolean>
) {
	const expandedIds = new Set<string>();

	for (const [nodeId, childIds] of index.childrenById) {
		if (childIds.length === 0) {
			continue;
		}

		const node = index.nodeById.get(nodeId);
		if (!node) {
			continue;
		}

		if (manualExpansionById.get(nodeId) ?? defaultExpandedCodeKeys.has(node.codeKey)) {
			expandedIds.add(nodeId);
		}
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
