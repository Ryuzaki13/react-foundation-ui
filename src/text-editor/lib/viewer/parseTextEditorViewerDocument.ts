import { isPlainObject, isRecord } from "@ryuzaki13/react-foundation-lib/validators";
import { IS_BOLD, IS_CODE, IS_HIGHLIGHT, IS_ITALIC, IS_STRIKETHROUGH, IS_SUBSCRIPT, IS_SUPERSCRIPT, IS_UNDERLINE } from "lexical";

import {
	LEXICAL_NODE_TYPE_TEXT,
	LEXICAL_NODE_TYPE_LINEBREAK,
	LEXICAL_NODE_TYPE_LINK,
	LEXICAL_NODE_TYPE_PARAGRAPH,
	LEXICAL_NODE_TYPE_QUOTE,
	LEXICAL_NODE_TYPE_HEADING,
	LEXICAL_NODE_TYPE_LIST,
	LEXICAL_NODE_TYPE_LISTITEM,
	LEXICAL_SERIALIZED_NODE_VERSION,
	LEXICAL_LIST_TYPE_BULLET,
	LEXICAL_LIST_TYPE_NUMBER,
	LEXICAL_NODE_TYPE_ACCESSIBLE_LINK
} from "../../model/textEditorLexicalNodeConstants";
import { TEXT_EDITOR_LEXICAL_RAW_FORMAT, TEXT_EDITOR_LEXICAL_RAW_VERSION } from "../../model/textEditorLexicalRawConstants";
import { TEXT_EDITOR_LINK_TARGET_SELF, TEXT_EDITOR_LINK_TARGET_BLANK } from "../../model/textEditorLinkConstants";
import { TEXT_EDITOR_VIEWER_INVALID, TEXT_EDITOR_VIEWER_VALID } from "../../model/textEditorViewerStatusConstants";
import {
	type TextEditorViewerBlock,
	type TextEditorViewerDocument,
	type TextEditorViewerElement,
	type TextEditorViewerInline,
	type TextEditorViewerLineBreak,
	type TextEditorViewerList,
	type TextEditorViewerListItem,
	type TextEditorViewerNode,
	type TextEditorViewerText
} from "../../model/textEditorViewerTypes";

import { resolveTextEditorViewerLink } from "./resolveTextEditorViewerLink";

const MAX_NODE_COUNT = 10_000;
const MAX_NODE_DEPTH = 32;
const MAX_TEXT_UNITS = 1_000_000;
const MAX_INDENT = 32;
const INLINE_FORMAT_MASK = IS_BOLD | IS_ITALIC | IS_STRIKETHROUGH | IS_UNDERLINE | IS_CODE | IS_SUBSCRIPT | IS_SUPERSCRIPT | IS_HIGHLIGHT;
const ELEMENT_FIELDS = ["type", "version", "children", "direction", "format", "indent", "textFormat", "textStyle"];
const LINK_FIELDS = [...ELEMENT_FIELDS, "url", "target", "rel", "title"];
const ACCESSIBLE_LINK_FIELDS = [...LINK_FIELDS, "ariaLabel", "qrCode", "add", "text"];
const INVALID_DOCUMENT: TextEditorViewerDocument = { status: TEXT_EDITOR_VIEWER_INVALID };

type ViewerParseBudget = { nodes: number; textUnits: number };

/** Accessor и prototype objects не являются сериализованными данными; не вызываем чужой getter при render. */
function readPlainRecord(input: unknown): Record<string, unknown> | null {
	if (!isRecord(input) || !isPlainObject(input)) return null;
	const keys = Reflect.ownKeys(input);
	if (keys.length > ACCESSIBLE_LINK_FIELDS.length) return null;
	for (const key of keys) {
		if (typeof key !== "string") return null;
		const descriptor = Object.getOwnPropertyDescriptor(input, key);
		if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) return null;
	}
	return input;
}

function hasOnlyFields(input: Record<string, unknown>, fields: readonly string[]): boolean {
	return Object.keys(input).every((key) => fields.includes(key));
}

function isInlineFormat(input: unknown): input is number {
	return (
		typeof input === "number" &&
		Number.isSafeInteger(input) &&
		input >= 0 &&
		input <= INLINE_FORMAT_MASK &&
		(input & ~INLINE_FORMAT_MASK) === 0
	);
}

function consumeText(input: unknown, budget: ViewerParseBudget): input is string {
	if (typeof input !== "string") return false;
	budget.textUnits += input.length;
	return budget.textUnits <= MAX_TEXT_UNITS;
}

function isPositiveInteger(input: unknown): input is number {
	return typeof input === "number" && Number.isSafeInteger(input) && input > 0;
}

function readElement(input: Record<string, unknown>): TextEditorViewerElement | null {
	const direction = input.direction;
	const alignment = input.format;
	const indent = input.indent;
	if (direction !== null && direction !== "ltr" && direction !== "rtl") return null;
	if (
		alignment !== "" &&
		alignment !== "left" &&
		alignment !== "right" &&
		alignment !== "center" &&
		alignment !== "justify" &&
		alignment !== "start" &&
		alignment !== "end"
	)
		return null;
	if (typeof indent !== "number" || !Number.isSafeInteger(indent) || indent < 0 || indent > MAX_INDENT) return null;
	if ((input.textFormat !== undefined && !isInlineFormat(input.textFormat)) || (input.textStyle !== undefined && input.textStyle !== ""))
		return null;
	return { direction, alignment, indent };
}

function isInline(node: TextEditorViewerNode): node is TextEditorViewerInline {
	return node.type === LEXICAL_NODE_TYPE_TEXT || node.type === LEXICAL_NODE_TYPE_LINEBREAK || node.type === LEXICAL_NODE_TYPE_LINK;
}

function isLinkChild(node: TextEditorViewerNode): node is TextEditorViewerText | TextEditorViewerLineBreak {
	return node.type === LEXICAL_NODE_TYPE_TEXT || node.type === LEXICAL_NODE_TYPE_LINEBREAK;
}

function isBlock(node: TextEditorViewerNode): node is TextEditorViewerBlock {
	return (
		node.type === LEXICAL_NODE_TYPE_PARAGRAPH ||
		node.type === LEXICAL_NODE_TYPE_QUOTE ||
		node.type === LEXICAL_NODE_TYPE_HEADING ||
		node.type === LEXICAL_NODE_TYPE_LIST
	);
}

function isListItem(node: TextEditorViewerNode): node is TextEditorViewerListItem {
	return node.type === LEXICAL_NODE_TYPE_LISTITEM;
}

function isListItemChild(node: TextEditorViewerNode): node is TextEditorViewerInline | TextEditorViewerList {
	return isInline(node) || node.type === LEXICAL_NODE_TYPE_LIST;
}

/** Только плотный JSON-массив: не вызываем собственные iterator/getter, depth/node budget отсекают циклы. */
function readChildren<Node extends TextEditorViewerNode>(
	input: unknown,
	budget: ViewerParseBudget,
	depth: number,
	accept: (node: TextEditorViewerNode) => node is Node
): readonly Node[] | null {
	if (!Array.isArray(input) || Object.getPrototypeOf(input) !== Array.prototype || input.length > MAX_NODE_COUNT) return null;
	if (Reflect.ownKeys(input).length !== input.length + 1) return null;
	const children: Node[] = [];
	for (let index = 0; index < input.length; index++) {
		const descriptor = Object.getOwnPropertyDescriptor(input, index);
		if (!descriptor || !("value" in descriptor)) return null;
		const node = readNode(descriptor.value, budget, depth);
		if (!node || !accept(node)) return null;
		children.push(node);
	}
	return children;
}

function readNode(input: unknown, budget: ViewerParseBudget, depth: number): TextEditorViewerNode | null {
	if (++budget.nodes > MAX_NODE_COUNT || depth > MAX_NODE_DEPTH) return null;
	const node = readPlainRecord(input);
	if (!node || node.version !== LEXICAL_SERIALIZED_NODE_VERSION) return null;
	if (node.type === LEXICAL_NODE_TYPE_TEXT) {
		if (
			!hasOnlyFields(node, ["type", "version", "detail", "format", "mode", "style", "text"]) ||
			node.detail !== 0 ||
			node.mode !== "normal" ||
			node.style !== "" ||
			!isInlineFormat(node.format) ||
			!consumeText(node.text, budget)
		)
			return null;
		return { type: LEXICAL_NODE_TYPE_TEXT, text: node.text, format: node.format };
	}
	if (node.type === LEXICAL_NODE_TYPE_LINEBREAK)
		return hasOnlyFields(node, ["type", "version"]) ? { type: LEXICAL_NODE_TYPE_LINEBREAK } : null;
	const element = readElement(node);
	if (!element) return null;
	switch (node.type) {
		case LEXICAL_NODE_TYPE_PARAGRAPH:
		case LEXICAL_NODE_TYPE_QUOTE: {
			if (!hasOnlyFields(node, ELEMENT_FIELDS)) return null;
			const children = readChildren(node.children, budget, depth + 1, isInline);
			return children ? { ...element, type: node.type, children } : null;
		}
		case LEXICAL_NODE_TYPE_HEADING: {
			if (!hasOnlyFields(node, [...ELEMENT_FIELDS, "tag"])) return null;
			const tag = node.tag;
			if (tag !== "h1" && tag !== "h2" && tag !== "h3" && tag !== "h4" && tag !== "h5" && tag !== "h6") return null;
			const children = readChildren(node.children, budget, depth + 1, isInline);
			return children ? { ...element, type: LEXICAL_NODE_TYPE_HEADING, tag, children } : null;
		}
		case LEXICAL_NODE_TYPE_LIST: {
			if (!hasOnlyFields(node, [...ELEMENT_FIELDS, "listType", "tag", "start"]) || !isPositiveInteger(node.start)) return null;
			const listType = node.listType;
			if (!(
				(listType === LEXICAL_LIST_TYPE_BULLET && node.tag === "ul") ||
				(listType === LEXICAL_LIST_TYPE_NUMBER && node.tag === "ol")
			))
				return null;
			const children = readChildren(node.children, budget, depth + 1, isListItem);
			return children ? { ...element, type: LEXICAL_NODE_TYPE_LIST, listType, start: node.start, children } : null;
		}
		case LEXICAL_NODE_TYPE_LISTITEM: {
			if (
				!hasOnlyFields(node, [...ELEMENT_FIELDS, "value", "checked"]) ||
				!isPositiveInteger(node.value) ||
				node.checked !== undefined
			)
				return null;
			const children = readChildren(node.children, budget, depth + 1, isListItemChild);
			return children ? { ...element, type: LEXICAL_NODE_TYPE_LISTITEM, value: node.value, children } : null;
		}
		case LEXICAL_NODE_TYPE_LINK:
		case LEXICAL_NODE_TYPE_ACCESSIBLE_LINK: {
			if (!hasOnlyFields(node, node.type === LEXICAL_NODE_TYPE_LINK ? LINK_FIELDS : ACCESSIBLE_LINK_FIELDS)) return null;
			if (!consumeText(node.url, budget)) return null;
			const url = resolveTextEditorViewerLink(node.url);
			if (
				!url ||
				(node.target !== null &&
					node.target !== undefined &&
					node.target !== TEXT_EDITOR_LINK_TARGET_SELF &&
					node.target !== TEXT_EDITOR_LINK_TARGET_BLANK)
			)
				return null;
			if (node.rel !== undefined && node.rel !== null && !consumeText(node.rel, budget)) return null;
			if (node.title !== undefined && node.title !== null && !consumeText(node.title, budget)) return null;
			if (
				node.type === LEXICAL_NODE_TYPE_ACCESSIBLE_LINK &&
				((node.qrCode !== undefined && node.qrCode !== false) ||
					(node.add !== undefined && node.add !== null) ||
					(node.text !== undefined && node.text !== null && !consumeText(node.text, budget)) ||
					(node.ariaLabel !== undefined && node.ariaLabel !== null && !consumeText(node.ariaLabel, budget)))
			)
				return null;
			const children = readChildren(node.children, budget, depth + 1, isLinkChild);
			if (!children) return null;
			return {
				...element,
				type: LEXICAL_NODE_TYPE_LINK,
				url,
				target: node.target === TEXT_EDITOR_LINK_TARGET_BLANK ? TEXT_EDITOR_LINK_TARGET_BLANK : TEXT_EDITOR_LINK_TARGET_SELF,
				ariaLabel: typeof node.ariaLabel === "string" ? node.ariaLabel : null,
				title: typeof node.title === "string" ? node.title : null,
				children
			};
		}
		default:
			return null;
	}
}

/** Чистая bounded-проекция; отсутствие DOM/Lexical editor сохраняет одинаковый SSR и browser render. */
export function parseTextEditorViewerDocument(input: unknown): TextEditorViewerDocument {
	const envelope = readPlainRecord(input);
	if (
		!envelope ||
		!hasOnlyFields(envelope, ["format", "version", "editorState"]) ||
		envelope.format !== TEXT_EDITOR_LEXICAL_RAW_FORMAT ||
		envelope.version !== TEXT_EDITOR_LEXICAL_RAW_VERSION
	)
		return INVALID_DOCUMENT;
	const editorState = readPlainRecord(envelope.editorState);
	if (!editorState || !hasOnlyFields(editorState, ["root"])) return INVALID_DOCUMENT;
	const root = readPlainRecord(editorState.root);
	if (!root || !hasOnlyFields(root, ELEMENT_FIELDS) || root.type !== "root" || root.version !== LEXICAL_SERIALIZED_NODE_VERSION)
		return INVALID_DOCUMENT;
	const element = readElement(root);
	if (!element) return INVALID_DOCUMENT;
	const children = readChildren(root.children, { nodes: 1, textUnits: 0 }, 1, isBlock);
	return children ? { status: TEXT_EDITOR_VIEWER_VALID, element, children } : INVALID_DOCUMENT;
}
