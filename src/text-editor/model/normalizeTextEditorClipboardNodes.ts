import { $isLinkNode } from "@lexical/link";
import { $createListItemNode, $createListNode, $isListItemNode, $isListNode, type ListItemNode, type ListNode } from "@lexical/list";
import { $createHeadingNode, $createQuoteNode, $isHeadingNode, $isQuoteNode, type HeadingTagType } from "@lexical/rich-text";
import {
	$createLineBreakNode,
	$createParagraphNode,
	$createTextNode,
	$isElementNode,
	$isLineBreakNode,
	$isTextNode,
	type ElementNode,
	IS_BOLD,
	IS_CODE,
	IS_HIGHLIGHT,
	IS_ITALIC,
	IS_STRIKETHROUGH,
	IS_UNDERLINE,
	type LexicalNode
} from "lexical";

import { type TextEditorClipboardProfile } from "../editorModel";
import { $createAccessibleLinkNode } from "../nodes/AccessibleLinkNode";

import { LEXICAL_LIST_TYPE_NUMBER, LEXICAL_LIST_TYPE_BULLET, LEXICAL_NODE_TYPE_PARAGRAPH } from "./textEditorLexicalNodeConstants";
import { TEXT_EDITOR_EXTERNAL_LINK_REL, TEXT_EDITOR_LINK_TARGET_BLANK } from "./textEditorLinkConstants";
import {
	TEXT_EDITOR_INLINE_STYLE_BOLD,
	TEXT_EDITOR_INLINE_STYLE_ITALIC,
	TEXT_EDITOR_INLINE_STYLE_UNDERLINE,
	TEXT_EDITOR_INLINE_STYLE_STRIKETHROUGH,
	TEXT_EDITOR_INLINE_STYLE_HIGHLIGHT,
	TEXT_EDITOR_INLINE_STYLE_CODE,
	TEXT_EDITOR_BLOCK_STYLE_HEADER_ONE,
	TEXT_EDITOR_BLOCK_STYLE_HEADER_TWO,
	TEXT_EDITOR_BLOCK_STYLE_HEADER_THREE,
	TEXT_EDITOR_BLOCK_STYLE_HEADER_FOUR,
	TEXT_EDITOR_BLOCK_STYLE_HEADER_FIVE,
	TEXT_EDITOR_BLOCK_STYLE_HEADER_SIX,
	TEXT_EDITOR_BLOCK_STYLE_ORDERED_LIST_ITEM,
	TEXT_EDITOR_BLOCK_STYLE_UNORDERED_LIST_ITEM,
	TEXT_EDITOR_BLOCK_STYLE_BLOCKQUOTE
} from "./textEditorStyleConstants";
import { type TextEditorBlockStyle, type TextEditorInlineStyle } from "./textEditorTypes";

type ClipboardNormalizationContext = {
	readonly blockStyles: ReadonlySet<TextEditorBlockStyle>;
	readonly inlineFormatMask: number;
	readonly normalizeLinkUrl: TextEditorClipboardProfile["normalizeLinkUrl"];
};

const inlineFormatFlags = {
	[TEXT_EDITOR_INLINE_STYLE_BOLD]: IS_BOLD,
	[TEXT_EDITOR_INLINE_STYLE_ITALIC]: IS_ITALIC,
	[TEXT_EDITOR_INLINE_STYLE_UNDERLINE]: IS_UNDERLINE,
	[TEXT_EDITOR_INLINE_STYLE_STRIKETHROUGH]: IS_STRIKETHROUGH,
	[TEXT_EDITOR_INLINE_STYLE_HIGHLIGHT]: IS_HIGHLIGHT,
	[TEXT_EDITOR_INLINE_STYLE_CODE]: IS_CODE
} satisfies Record<TextEditorInlineStyle, number>;

const headingStyles = {
	h1: TEXT_EDITOR_BLOCK_STYLE_HEADER_ONE,
	h2: TEXT_EDITOR_BLOCK_STYLE_HEADER_TWO,
	h3: TEXT_EDITOR_BLOCK_STYLE_HEADER_THREE,
	h4: TEXT_EDITOR_BLOCK_STYLE_HEADER_FOUR,
	h5: TEXT_EDITOR_BLOCK_STYLE_HEADER_FIVE,
	h6: TEXT_EDITOR_BLOCK_STYLE_HEADER_SIX
} as const satisfies Record<HeadingTagType, TextEditorBlockStyle>;

/** Метаданные нового блока не наследуют CSS, indent и alignment HTML-обёрток. */
function copyBlockDirection(target: ElementNode, source: ElementNode): void {
	target.setDirection(source.getDirection());
}

function normalizeText(text: string, format: number): LexicalNode[] {
	const result: LexicalNode[] = [];
	const lines = text.replaceAll("\r\n", "\n").replaceAll("\r", "\n").replaceAll("\t", " ").split("\n");
	for (let index = 0; index < lines.length; index += 1) {
		if (index > 0) result.push($createLineBreakNode());
		if (lines[index]) result.push($createTextNode(lines[index]).setFormat(format));
	}
	return result;
}

/** Группирует inline-последовательности, не склеивая соседние исходные блоки. */
function wrapInlineRuns(nodes: readonly LexicalNode[], source?: ElementNode): LexicalNode[] {
	const result: LexicalNode[] = [];
	let paragraph: ReturnType<typeof $createParagraphNode> | null = null;
	for (const node of nodes) {
		if ($isElementNode(node) && !node.isInline()) {
			paragraph = null;
			result.push(node);
			continue;
		}
		if (!paragraph) {
			paragraph = $createParagraphNode();
			if (source) copyBlockDirection(paragraph, source);
			result.push(paragraph);
		}
		paragraph.append(node);
	}
	return result;
}

/** В link/list-item блоки становятся строками; вложенный список остаётся структурным узлом. */
function flattenInlineContent(nodes: readonly LexicalNode[], keepLists: boolean): LexicalNode[] {
	const result: LexicalNode[] = [];
	let previousWasBlock = false;
	for (const node of nodes) {
		if ($isListNode(node) && keepLists) {
			result.push(node);
			previousWasBlock = false;
			continue;
		}
		const isBlock = $isElementNode(node) && !node.isInline();
		const content = isBlock ? flattenInlineContent(node.getChildren(), keepLists) : [node];
		if (content.length === 0) continue;
		if ((isBlock || previousWasBlock) && result.length > 0 && !$isLineBreakNode(result[result.length - 1])) {
			result.push($createLineBreakNode());
		}
		for (const child of content) result.push(child);
		previousWasBlock = isBlock;
	}
	return result;
}

function normalizeNodes(nodes: readonly LexicalNode[], context: ClipboardNormalizationContext): LexicalNode[] {
	const result: LexicalNode[] = [];
	for (const node of nodes) {
		for (const normalized of normalizeNode(node, context)) result.push(normalized);
	}
	return result;
}

function normalizeListItem(source: LexicalNode, context: ClipboardNormalizationContext): ListItemNode {
	const item = $createListItemNode();
	if ($isListItemNode(source)) item.setValue(source.getValue());
	if ($isElementNode(source)) copyBlockDirection(item, source);
	const normalized = $isElementNode(source) ? normalizeNodes(source.getChildren(), context) : normalizeNode(source, context);
	for (const child of flattenInlineContent(normalized, true)) item.append(child);
	return item;
}

function normalizeList(source: ListNode, context: ClipboardNormalizationContext): LexicalNode[] {
	const listType = source.getListType();
	const style =
		listType === LEXICAL_LIST_TYPE_NUMBER
			? TEXT_EDITOR_BLOCK_STYLE_ORDERED_LIST_ITEM
			: listType === LEXICAL_LIST_TYPE_BULLET
				? TEXT_EDITOR_BLOCK_STYLE_UNORDERED_LIST_ITEM
				: null;
	if (!style || !context.blockStyles.has(style)) {
		return wrapInlineRuns(normalizeNodes(source.getChildren(), context), source);
	}
	const list = $createListNode(listType, source.getStart());
	copyBlockDirection(list, source);
	for (const child of source.getChildren()) list.append(normalizeListItem(child, context));
	return list.getChildrenSize() > 0 ? [list] : [];
}

function normalizeElement(source: ElementNode, context: ClipboardNormalizationContext): LexicalNode[] {
	if ($isLinkNode(source)) {
		// Вложенные anchors превращаются в подписи: допустимая ссылка не содержит другую ссылку.
		const children = flattenInlineContent(normalizeNodes(source.getChildren(), { ...context, normalizeLinkUrl: undefined }), false);
		const url = context.normalizeLinkUrl?.(source.getURL());
		if (!url) return children;
		const link = $createAccessibleLinkNode(url, {
			rel: TEXT_EDITOR_EXTERNAL_LINK_REL,
			target: TEXT_EDITOR_LINK_TARGET_BLANK,
			title: null,
			ariaLabel: null,
			qrCode: false,
			add: null,
			text: null
		});
		copyBlockDirection(link, source);
		for (const child of children) link.append(child);
		return children.length > 0 ? [link] : [];
	}
	if ($isListNode(source)) return normalizeList(source, context);
	const children = normalizeNodes(source.getChildren(), context);
	if (source.isInline()) return children.length > 0 ? children : normalizeText(source.getTextContent(), 0);
	if ($isHeadingNode(source) && context.blockStyles.has(headingStyles[source.getTag()])) {
		const heading = $createHeadingNode(source.getTag());
		copyBlockDirection(heading, source);
		for (const child of flattenInlineContent(children, false)) heading.append(child);
		return [heading];
	}
	if ($isQuoteNode(source) && context.blockStyles.has(TEXT_EDITOR_BLOCK_STYLE_BLOCKQUOTE)) {
		const quote = $createQuoteNode();
		copyBlockDirection(quote, source);
		for (const child of children) quote.append(child);
		return [quote];
	}
	const blocks = wrapInlineRuns(children, source);
	if (blocks.length > 0) return blocks;
	const fallback = normalizeText(source.getTextContent(), 0);
	if (fallback.length > 0) return wrapInlineRuns(fallback, source);
	// Пустой настоящий абзац сохраняется; пустые служебные контейнеры не создают контент.
	if (source.getType() === LEXICAL_NODE_TYPE_PARAGRAPH) {
		const paragraph = $createParagraphNode();
		copyBlockDirection(paragraph, source);
		return [paragraph];
	}
	return [];
}

function normalizeNode(source: LexicalNode, context: ClipboardNormalizationContext): LexicalNode[] {
	if ($isTextNode(source)) return normalizeText(source.getTextContent(), source.getFormat() & context.inlineFormatMask);
	if ($isLineBreakNode(source)) return [$createLineBreakNode()];
	if ($isElementNode(source)) return normalizeElement(source, context);
	// Незнакомый leaf-узел теряет оформление, но не доступное текстовое представление.
	return normalizeText(source.getTextContent(), 0);
}

/**
 * Применяет явно заданный профиль к новому clipboard-fragment внутри Lexical update.
 * Все узлы создаются заново: исходный fragment, текущий документ и его selection не меняются.
 */
export function normalizeTextEditorClipboardNodes(nodes: readonly LexicalNode[], profile: TextEditorClipboardProfile): LexicalNode[] {
	const context: ClipboardNormalizationContext = {
		blockStyles: new Set(profile.blockStyles),
		inlineFormatMask: profile.inlineStyles.reduce((mask, style) => mask | inlineFormatFlags[style], 0),
		normalizeLinkUrl: profile.normalizeLinkUrl
	};
	return wrapInlineRuns(normalizeNodes(nodes, context));
}
