import { CollectionItem } from "@ryuzaki13/react-foundation-lib/odata";

import { TreeSelectNode } from "../types";

type BuildODataTreeNodesArgs = {
	items: CollectionItem[];
	orderedCodeKeys: string[];
	keyPairsMap: Record<string, string>;
	hiddenCodeKeys: Set<string>;
	textValueCodeKeys?: Set<string>;
};

type MutableTreeNode = TreeSelectNode & {
	children: MutableTreeNode[];
	childByBranchKey: Map<string, MutableTreeNode>;
};

function createNodeId(parentId: string | undefined, codeKey: string, value: string) {
	return parentId ? `${parentId}/${codeKey}:${value}` : `${codeKey}:${value}`;
}

function resolveNodeLabel(item: CollectionItem, codeKey: string, keyPairsMap: Record<string, string>) {
	const textKey = keyPairsMap[codeKey];
	return (textKey && item[textKey]) || item[codeKey];
}

function createSearchText(parts: Array<string | undefined>) {
	return [...new Set(parts.filter(Boolean))].join(" ");
}

function createMutableNode(args: { parentId?: string; codeKey: string; value: string; label: string; code?: string }): MutableTreeNode {
	return {
		id: createNodeId(args.parentId, args.codeKey, args.value),
		codeKey: args.codeKey,
		value: args.value,
		label: args.label,
		code: args.code,
		searchText: createSearchText([args.value, args.label, args.code]),
		children: [],
		childByBranchKey: new Map()
	};
}

function toPublicNode(node: MutableTreeNode): TreeSelectNode {
	return {
		id: node.id,
		codeKey: node.codeKey,
		value: node.value,
		label: node.label,
		code: node.code,
		searchText: node.searchText,
		children: node.children.length > 0 ? node.children.map(toPublicNode) : undefined
	};
}

export function buildODataTreeNodes({
	items,
	orderedCodeKeys,
	keyPairsMap,
	hiddenCodeKeys,
	textValueCodeKeys
}: BuildODataTreeNodesArgs): TreeSelectNode[] {
	if (orderedCodeKeys.length === 0 || items.length === 0) {
		return [];
	}

	const roots: MutableTreeNode[] = [];
	const rootByBranchKey = new Map<string, MutableTreeNode>();

	for (const item of items) {
		let parentNode: MutableTreeNode | undefined;

		for (const codeKey of orderedCodeKeys) {
			const codeValue = String(item[codeKey] ?? "");

			if (!codeValue) {
				break;
			}

			const label = String(resolveNodeLabel(item, codeKey, keyPairsMap) ?? "");
			const value = textValueCodeKeys?.has(codeKey) ? label : codeValue;
			const branchKey = `${codeKey}:${value}`;
			const container = parentNode ? parentNode.childByBranchKey : rootByBranchKey;
			let currentNode = container.get(branchKey);

			if (!currentNode) {
				currentNode = createMutableNode({
					parentId: parentNode?.id,
					codeKey,
					value,
					label,
					code: hiddenCodeKeys.has(codeKey) ? undefined : codeValue
				});
				container.set(branchKey, currentNode);

				if (parentNode) {
					parentNode.children.push(currentNode);
				} else {
					roots.push(currentNode);
				}
			}

			parentNode = currentNode;
		}
	}

	return roots.map(toPublicNode);
}
