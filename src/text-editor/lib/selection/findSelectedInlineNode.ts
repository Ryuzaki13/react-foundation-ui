import { $findMatchingParent } from "@lexical/utils";
import { $getSelection, $isRangeSelection, type LexicalNode } from "lexical";

/** Редактируем один wrapper только когда обе границы selection принадлежат ему. */
export function $findSelectedInlineNode<T extends LexicalNode>(predicate: (node: LexicalNode) => node is T): T | null {
	const selection = $getSelection();
	if (!$isRangeSelection(selection)) return null;
	const anchor = $findMatchingParent(selection.anchor.getNode(), predicate);
	const focus = $findMatchingParent(selection.focus.getNode(), predicate);
	return anchor && focus && anchor.is(focus) && predicate(anchor) ? anchor : null;
}
