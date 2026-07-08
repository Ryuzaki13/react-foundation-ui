import type { LexicalNode } from "lexical";

export const getSemanticTagDepth = (node: LexicalNode): number => {
	let depth = 0;
	let current: LexicalNode | null = node;

	while (current) {
		depth += 1;
		current = current.getParent();
	}

	return depth;
};
