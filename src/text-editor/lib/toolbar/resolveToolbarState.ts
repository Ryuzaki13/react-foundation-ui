import { $isListItemNode, $isListNode } from "@lexical/list";
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import { $getSelection, $isRangeSelection } from "lexical";

import {
	LEXICAL_TEXT_FORMAT_BOLD,
	LEXICAL_TEXT_FORMAT_ITALIC,
	LEXICAL_TEXT_FORMAT_UNDERLINE,
	LEXICAL_TEXT_FORMAT_STRIKETHROUGH,
	LEXICAL_TEXT_FORMAT_HIGHLIGHT,
	LEXICAL_TEXT_FORMAT_CODE
} from "../../model/textEditorLexicalFormatConstants";
import { LEXICAL_LIST_TYPE_BULLET, LEXICAL_NODE_TYPE_PARAGRAPH } from "../../model/textEditorLexicalNodeConstants";
import {
	TEXT_EDITOR_BLOCK_STYLE_UNSTYLED,
	TEXT_EDITOR_BLOCK_STYLE_UNORDERED_LIST_ITEM,
	TEXT_EDITOR_BLOCK_STYLE_ORDERED_LIST_ITEM,
	TEXT_EDITOR_BLOCK_STYLE_BLOCKQUOTE,
	TEXT_EDITOR_ALIGNMENT_LEFT,
	TEXT_EDITOR_ALIGNMENT_CENTER,
	TEXT_EDITOR_ALIGNMENT_RIGHT,
	TEXT_EDITOR_ALIGNMENT_JUSTIFY,
	TEXT_EDITOR_INLINE_STYLE_BOLD,
	TEXT_EDITOR_INLINE_STYLE_ITALIC,
	TEXT_EDITOR_INLINE_STYLE_UNDERLINE,
	TEXT_EDITOR_INLINE_STYLE_STRIKETHROUGH,
	TEXT_EDITOR_INLINE_STYLE_HIGHLIGHT,
	TEXT_EDITOR_INLINE_STYLE_CODE
} from "../../model/textEditorStyleConstants";
import { DEFAULT_TOOLBAR_STATE, type LexicalToolbarState, type TextAlignment } from "../../model/textEditorTypes";

import { getHeadingBlockType } from "./styleMappers";

export const resolveBlockType = (): string => {
	const selection = $getSelection();
	if (!$isRangeSelection(selection)) return TEXT_EDITOR_BLOCK_STYLE_UNSTYLED;

	const anchorNode = selection.anchor.getNode();
	const topLevel = anchorNode.getTopLevelElementOrThrow();

	if ($isListItemNode(topLevel)) {
		const listNode = topLevel.getParent();
		if ($isListNode(listNode)) {
			return listNode.getListType() === LEXICAL_LIST_TYPE_BULLET
				? TEXT_EDITOR_BLOCK_STYLE_UNORDERED_LIST_ITEM
				: TEXT_EDITOR_BLOCK_STYLE_ORDERED_LIST_ITEM;
		}
	}

	if ($isListNode(topLevel)) {
		return topLevel.getListType() === LEXICAL_LIST_TYPE_BULLET
			? TEXT_EDITOR_BLOCK_STYLE_UNORDERED_LIST_ITEM
			: TEXT_EDITOR_BLOCK_STYLE_ORDERED_LIST_ITEM;
	}

	if ($isHeadingNode(topLevel)) {
		return getHeadingBlockType(topLevel.getTag());
	}

	if ($isQuoteNode(topLevel)) {
		return TEXT_EDITOR_BLOCK_STYLE_BLOCKQUOTE;
	}

	if (topLevel.getType() === LEXICAL_NODE_TYPE_PARAGRAPH) {
		return TEXT_EDITOR_BLOCK_STYLE_UNSTYLED;
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
		case TEXT_EDITOR_ALIGNMENT_LEFT:
		case TEXT_EDITOR_ALIGNMENT_CENTER:
		case TEXT_EDITOR_ALIGNMENT_RIGHT:
		case TEXT_EDITOR_ALIGNMENT_JUSTIFY:
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
			[TEXT_EDITOR_INLINE_STYLE_BOLD]: selection.hasFormat(LEXICAL_TEXT_FORMAT_BOLD),
			[TEXT_EDITOR_INLINE_STYLE_ITALIC]: selection.hasFormat(LEXICAL_TEXT_FORMAT_ITALIC),
			[TEXT_EDITOR_INLINE_STYLE_UNDERLINE]: selection.hasFormat(LEXICAL_TEXT_FORMAT_UNDERLINE),
			[TEXT_EDITOR_INLINE_STYLE_STRIKETHROUGH]: selection.hasFormat(LEXICAL_TEXT_FORMAT_STRIKETHROUGH),
			[TEXT_EDITOR_INLINE_STYLE_HIGHLIGHT]: selection.hasFormat(LEXICAL_TEXT_FORMAT_HIGHLIGHT as never),
			[TEXT_EDITOR_INLINE_STYLE_CODE]: selection.hasFormat(LEXICAL_TEXT_FORMAT_CODE)
		},
		activeAlignment: resolveAlignment()
	};
};
