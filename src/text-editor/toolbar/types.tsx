import { JSX } from "react";

import {
	Bold,
	Code,
	Heading1,
	Heading2,
	Heading3,
	Heading4,
	Heading5,
	Heading6,
	Highlighter,
	Italic,
	List,
	ListOrdered,
	Pilcrow,
	Strikethrough,
	TextQuote,
	Type,
	Underline
} from "lucide-react";

import type { TextEditorElementTypes } from "../types";

interface TextEditorElement {
	label: string;
	style: TextEditorElementTypes;
	node: string;
	icon: JSX.Element;
}

const TextEditorElements: Record<TextEditorElementTypes, TextEditorElement> = {
	unstyled: { label: "Параграф", node: "p", style: "unstyled", icon: <Type /> },
	paragraph: { label: "Параграф", node: "p", style: "paragraph", icon: <Pilcrow /> },
	"header-one": { label: "Заголовок первого уровня", node: "h1", style: "header-one", icon: <Heading1 /> },
	"header-two": { label: "Заголовок второго уровня", node: "h2", style: "header-two", icon: <Heading2 /> },
	"header-three": { label: "Заголовок третьего уровня", node: "h3", style: "header-three", icon: <Heading3 /> },
	"header-four": { label: "Заголовок четвертого уровня", node: "h4", style: "header-four", icon: <Heading4 /> },
	"header-five": { label: "Заголовок пятого уровня", node: "h5", style: "header-five", icon: <Heading5 /> },
	"header-six": { label: "Заголовок шестого уровня", node: "h6", style: "header-six", icon: <Heading6 /> },
	"code-block": { label: "Блок кода", node: "pre", style: "code-block", icon: <Code /> },
	blockquote: { label: "Цитата", node: "blockquote", style: "blockquote", icon: <TextQuote /> },
	"unordered-list-item": { label: "Маркированный список", node: "ul", style: "unordered-list-item", icon: <List /> },
	"ordered-list-item": { label: "Нумерованный список", node: "ol", style: "ordered-list-item", icon: <ListOrdered /> },
	CODE: { label: "Моноширинный код", node: "code", style: "CODE", icon: <Code /> },
	BOLD: { label: "Выделение жирным", node: "strong", style: "BOLD", icon: <Bold /> },
	UNDERLINE: { label: "Выделение подчеркнутым", node: "u", style: "UNDERLINE", icon: <Underline /> },
	STRIKETHROUGH: { label: "Выделение зачеркнутым", node: "s", style: "STRIKETHROUGH", icon: <Strikethrough /> },
	HIGHLIGHT: { label: "Подсветка цветом", node: "span", style: "HIGHLIGHT", icon: <Highlighter /> },
	ITALIC: { label: "Выделение курсивным", node: "i", style: "ITALIC", icon: <Italic /> }
};

export const getElementFromElementStyle = (style: TextEditorElementTypes) => {
	const element = TextEditorElements[style];
	if (!element) {
		return "div";
	}
	return element.node;
};

export const getTagFromElementStyle = (style: TextEditorElementTypes) => {
	const element = TextEditorElements[style];
	if (!element) {
		return null;
	}
	return element.node;
};

export const TextEditorBlockControls = [
	TextEditorElements.unstyled,
	TextEditorElements["header-three"],
	TextEditorElements["header-four"],
	TextEditorElements["header-five"],
	TextEditorElements["header-six"],
	TextEditorElements["ordered-list-item"],
	TextEditorElements["unordered-list-item"],
	TextEditorElements.blockquote
];

export const TextEditorInlineControls = [
	TextEditorElements.BOLD,
	TextEditorElements.ITALIC,
	TextEditorElements.UNDERLINE,
	TextEditorElements.STRIKETHROUGH,
	TextEditorElements.HIGHLIGHT,
	TextEditorElements.CODE
];

export const TextEditorStyleClasses = {
	CODE: {
		color: "rgb(8, 89, 114)",
		padding: "0.15em 0.4em",
		margin: "0",
		fontFamily: "monospace",
		fontSize: "85%",
		backgroundColor: "rgba(40, 68, 77, 0.05)",
		borderRadius: "var(--radius-md)",
		lineHeight: "1"
	},
	HIGHLIGHT: {
		paddingInline: "0.15em",
		backgroundColor: "rgb(234,255,142)",
		borderRadius: "var(--radius-md)"
	},
	unstyled: {
		marginBottom: "1.5em"
	},
	BOLD: { fontWeight: "bold" },
	ITALIC: { fontStyle: "italic" },
	UNDERLINE: { textDecoration: "underline" },
	STRIKETHROUGH: { textDecoration: "line-through" }
};

export enum LinkTypes {
	LINK = "link",
	LOCAL_LINK = "localLink",
	PHONE = "phone",
	EMAIL = "email"
}

export enum TagTypes {
	abbr = "abbr",
	lang = "lang",
	time = "time",
	cite = "cite",
	ins = "ins",
	del = "del"
}
