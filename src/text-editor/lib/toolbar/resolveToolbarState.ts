import { $isListItemNode, $isListNode } from "@lexical/list";
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import { $getSelection, $isRangeSelection } from "lexical";

import { DEFAULT_TOOLBAR_STATE, type LexicalToolbarState, type TextAlignment } from "../../model/textEditorTypes";

import { getHeadingBlockType } from "./styleMappers";

export const resolveBlockType = (): string => {
	const selection = $getSelection();
	if (!$isRangeSelection(selection)) return "unstyled";

	const anchorNode = selection.anchor.getNode();
	const topLevel = anchorNode.getTopLevelElementOrThrow();

	if ($isListItemNode(topLevel)) {
		const listNode = topLevel.getParent();
		if ($isListNode(listNode)) {
			return listNode.getListType() === "bullet" ? "unordered-list-item" : "ordered-list-item";
		}
	}

	if ($isListNode(topLevel)) {
		return topLevel.getListType() === "bullet" ? "unordered-list-item" : "ordered-list-item";
	}

	if ($isHeadingNode(topLevel)) {
		return getHeadingBlockType(topLevel.getTag());
	}

	if ($isQuoteNode(topLevel)) {
		return "blockquote";
	}

	if (topLevel.getType() === "paragraph") {
		return "unstyled";
	}

	return topLevel.getType();
};

export const resolveAlignment = (): TextAlignment | null => {
	const selection = $getSelection();
	if (!$isRangeSelection(selection)) return null;

	const anchorNode = selection.anchor.getNode();
	const topLevel = anchorNode.getTopLevelElementOrThrow();
	const formatType = topLevel.getFormatType();

	switch (formatType) {
		case "left":
		case "center":
		case "right":
		case "justify":
			return formatType;
		default:
			return null;
	}
};

export const resolveToolbarState = (): LexicalToolbarState => {
	const selection = $getSelection();
	if (!$isRangeSelection(selection)) {
		return DEFAULT_TOOLBAR_STATE;
	}

	return {
		blockType: resolveBlockType(),
		isTextUnselected: selection.isCollapsed(),
		activeInlineStyles: {
			BOLD: selection.hasFormat("bold"),
			ITALIC: selection.hasFormat("italic"),
			UNDERLINE: selection.hasFormat("underline"),
			STRIKETHROUGH: selection.hasFormat("strikethrough"),
			HIGHLIGHT: selection.hasFormat("highlight" as never),
			CODE: selection.hasFormat("code")
		},
		activeAlignment: resolveAlignment()
	};
};
