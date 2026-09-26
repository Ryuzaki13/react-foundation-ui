import { isPlainObject, isRecord } from "@ryuzaki13/react-foundation-lib/validators";
import { IS_BOLD, IS_CODE, IS_HIGHLIGHT, IS_ITALIC, IS_STRIKETHROUGH, IS_SUBSCRIPT, IS_SUPERSCRIPT, IS_UNDERLINE } from "lexical";

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
const INVALID_DOCUMENT: TextEditorViewerDocument = { status: "invalid" };

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
	return node.type === "text" || node.type === "linebreak" || node.type === "link";
}

function isLinkChild(node: TextEditorViewerNode): node is TextEditorViewerText | TextEditorViewerLineBreak {
	return node.type === "text" || node.type === "linebreak";
}

function isBlock(node: TextEditorViewerNode): node is TextEditorViewerBlock {
	return node.type === "paragraph" || node.type === "quote" || node.type === "heading" || node.type === "list";
}

function isListItem(node: TextEditorViewerNode): node is TextEditorViewerListItem {
	return node.type === "listitem";
}

function isListItemChild(node: TextEditorViewerNode): node is TextEditorViewerInline | TextEditorViewerList {
	return isInline(node) || node.type === "list";
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
	if (!node || node.version !== 1) return null;
	if (node.type === "text") {
		if (
			!hasOnlyFields(node, ["type", "version", "detail", "format", "mode", "style", "text"]) ||
			node.detail !== 0 ||
			node.mode !== "normal" ||
			node.style !== "" ||
			!isInlineFormat(node.format) ||
			!consumeText(node.text, budget)
		)
			return null;
		return { type: "text", text: node.text, format: node.format };
	}
	if (node.type === "linebreak") return hasOnlyFields(node, ["type", "version"]) ? { type: "linebreak" } : null;
	const element = readElement(node);
	if (!element) return null;
	switch (node.type) {
		case "paragraph":
		case "quote": {
			if (!hasOnlyFields(node, ELEMENT_FIELDS)) return null;
			const children = readChildren(node.children, budget, depth + 1, isInline);
			return children ? { ...element, type: node.type, children } : null;
		}
		case "heading": {
			if (!hasOnlyFields(node, [...ELEMENT_FIELDS, "tag"])) return null;
			const tag = node.tag;
			if (tag !== "h1" && tag !== "h2" && tag !== "h3" && tag !== "h4" && tag !== "h5" && tag !== "h6") return null;
			const children = readChildren(node.children, budget, depth + 1, isInline);
			return children ? { ...element, type: "heading", tag, children } : null;
		}
		case "list": {
			if (!hasOnlyFields(node, [...ELEMENT_FIELDS, "listType", "tag", "start"]) || !isPositiveInteger(node.start)) return null;
			const listType = node.listType;
			if (!((listType === "bullet" && node.tag === "ul") || (listType === "number" && node.tag === "ol"))) return null;
			const children = readChildren(node.children, budget, depth + 1, isListItem);
			return children ? { ...element, type: "list", listType, start: node.start, children } : null;
		}
		case "listitem": {
			if (
				!hasOnlyFields(node, [...ELEMENT_FIELDS, "value", "checked"]) ||
				!isPositiveInteger(node.value) ||
				node.checked !== undefined
			)
				return null;
			const children = readChildren(node.children, budget, depth + 1, isListItemChild);
			return children ? { ...element, type: "listitem", value: node.value, children } : null;
		}
		case "link":
		case "accessible-link": {
			if (!hasOnlyFields(node, node.type === "link" ? LINK_FIELDS : ACCESSIBLE_LINK_FIELDS)) return null;
			if (!consumeText(node.url, budget)) return null;
			const url = resolveTextEditorViewerLink(node.url);
			if (!url || (node.target !== null && node.target !== undefined && node.target !== "_self" && node.target !== "_blank"))
				return null;
			if (node.rel !== undefined && node.rel !== null && !consumeText(node.rel, budget)) return null;
			if (node.title !== undefined && node.title !== null && !consumeText(node.title, budget)) return null;
			if (
				node.type === "accessible-link" &&
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
				type: "link",
				url,
				target: node.target === "_blank" ? "_blank" : "_self",
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
		envelope.format !== "lexical" ||
		envelope.version !== 1
	)
		return INVALID_DOCUMENT;
	const editorState = readPlainRecord(envelope.editorState);
	if (!editorState || !hasOnlyFields(editorState, ["root"])) return INVALID_DOCUMENT;
	const root = readPlainRecord(editorState.root);
	if (!root || !hasOnlyFields(root, ELEMENT_FIELDS) || root.type !== "root" || root.version !== 1) return INVALID_DOCUMENT;
	const element = readElement(root);
	if (!element) return INVALID_DOCUMENT;
	const children = readChildren(root.children, { nodes: 1, textUnits: 0 }, 1, isBlock);
	return children ? { status: "valid", element, children } : INVALID_DOCUMENT;
}
