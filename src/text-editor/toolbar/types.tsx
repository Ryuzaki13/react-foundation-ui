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

import {
	TEXT_EDITOR_BLOCK_STYLE_UNSTYLED,
	TEXT_EDITOR_BLOCK_STYLE_PARAGRAPH,
	TEXT_EDITOR_BLOCK_STYLE_HEADER_ONE,
	TEXT_EDITOR_BLOCK_STYLE_HEADER_TWO,
	TEXT_EDITOR_BLOCK_STYLE_HEADER_THREE,
	TEXT_EDITOR_BLOCK_STYLE_HEADER_FOUR,
	TEXT_EDITOR_BLOCK_STYLE_HEADER_FIVE,
	TEXT_EDITOR_BLOCK_STYLE_HEADER_SIX,
	TEXT_EDITOR_BLOCK_STYLE_CODE_BLOCK,
	TEXT_EDITOR_BLOCK_STYLE_BLOCKQUOTE,
	TEXT_EDITOR_BLOCK_STYLE_UNORDERED_LIST_ITEM,
	TEXT_EDITOR_BLOCK_STYLE_ORDERED_LIST_ITEM,
	TEXT_EDITOR_INLINE_STYLE_CODE,
	TEXT_EDITOR_INLINE_STYLE_BOLD,
	TEXT_EDITOR_INLINE_STYLE_UNDERLINE,
	TEXT_EDITOR_INLINE_STYLE_STRIKETHROUGH,
	TEXT_EDITOR_INLINE_STYLE_HIGHLIGHT,
	TEXT_EDITOR_INLINE_STYLE_ITALIC
} from "../model/textEditorStyleConstants";

import type { TextEditorElementTypes } from "../types";

interface TextEditorElement {
	label: string;
	style: TextEditorElementTypes;
	node: string;
	icon: JSX.Element;
}

const TextEditorElements: Record<TextEditorElementTypes, TextEditorElement> = {
	[TEXT_EDITOR_BLOCK_STYLE_UNSTYLED]: { label: "Параграф", node: "p", style: TEXT_EDITOR_BLOCK_STYLE_UNSTYLED, icon: <Type /> },
	[TEXT_EDITOR_BLOCK_STYLE_PARAGRAPH]: { label: "Параграф", node: "p", style: TEXT_EDITOR_BLOCK_STYLE_PARAGRAPH, icon: <Pilcrow /> },
	[TEXT_EDITOR_BLOCK_STYLE_HEADER_ONE]: {
		label: "Заголовок первого уровня",
		node: "h1",
		style: TEXT_EDITOR_BLOCK_STYLE_HEADER_ONE,
		icon: <Heading1 />
	},
	[TEXT_EDITOR_BLOCK_STYLE_HEADER_TWO]: {
		label: "Заголовок второго уровня",
		node: "h2",
		style: TEXT_EDITOR_BLOCK_STYLE_HEADER_TWO,
		icon: <Heading2 />
	},
	[TEXT_EDITOR_BLOCK_STYLE_HEADER_THREE]: {
		label: "Заголовок третьего уровня",
		node: "h3",
		style: TEXT_EDITOR_BLOCK_STYLE_HEADER_THREE,
		icon: <Heading3 />
	},
	[TEXT_EDITOR_BLOCK_STYLE_HEADER_FOUR]: {
		label: "Заголовок четвертого уровня",
		node: "h4",
		style: TEXT_EDITOR_BLOCK_STYLE_HEADER_FOUR,
		icon: <Heading4 />
	},
	[TEXT_EDITOR_BLOCK_STYLE_HEADER_FIVE]: {
		label: "Заголовок пятого уровня",
		node: "h5",
		style: TEXT_EDITOR_BLOCK_STYLE_HEADER_FIVE,
		icon: <Heading5 />
	},
	[TEXT_EDITOR_BLOCK_STYLE_HEADER_SIX]: {
		label: "Заголовок шестого уровня",
		node: "h6",
		style: TEXT_EDITOR_BLOCK_STYLE_HEADER_SIX,
		icon: <Heading6 />
	},
	[TEXT_EDITOR_BLOCK_STYLE_CODE_BLOCK]: { label: "Блок кода", node: "pre", style: TEXT_EDITOR_BLOCK_STYLE_CODE_BLOCK, icon: <Code /> },
	[TEXT_EDITOR_BLOCK_STYLE_BLOCKQUOTE]: {
		label: "Цитата",
		node: "blockquote",
		style: TEXT_EDITOR_BLOCK_STYLE_BLOCKQUOTE,
		icon: <TextQuote />
	},
	[TEXT_EDITOR_BLOCK_STYLE_UNORDERED_LIST_ITEM]: {
		label: "Маркированный список",
		node: "ul",
		style: TEXT_EDITOR_BLOCK_STYLE_UNORDERED_LIST_ITEM,
		icon: <List />
	},
	[TEXT_EDITOR_BLOCK_STYLE_ORDERED_LIST_ITEM]: {
		label: "Нумерованный список",
		node: "ol",
		style: TEXT_EDITOR_BLOCK_STYLE_ORDERED_LIST_ITEM,
		icon: <ListOrdered />
	},
	[TEXT_EDITOR_INLINE_STYLE_CODE]: { label: "Моноширинный код", node: "code", style: TEXT_EDITOR_INLINE_STYLE_CODE, icon: <Code /> },
	[TEXT_EDITOR_INLINE_STYLE_BOLD]: { label: "Выделение жирным", node: "strong", style: TEXT_EDITOR_INLINE_STYLE_BOLD, icon: <Bold /> },
	[TEXT_EDITOR_INLINE_STYLE_UNDERLINE]: {
		label: "Выделение подчеркнутым",
		node: "u",
		style: TEXT_EDITOR_INLINE_STYLE_UNDERLINE,
		icon: <Underline />
	},
	[TEXT_EDITOR_INLINE_STYLE_STRIKETHROUGH]: {
		label: "Выделение зачеркнутым",
		node: "s",
		style: TEXT_EDITOR_INLINE_STYLE_STRIKETHROUGH,
		icon: <Strikethrough />
	},
	[TEXT_EDITOR_INLINE_STYLE_HIGHLIGHT]: {
		label: "Подсветка цветом",
		node: "span",
		style: TEXT_EDITOR_INLINE_STYLE_HIGHLIGHT,
		icon: <Highlighter />
	},
	[TEXT_EDITOR_INLINE_STYLE_ITALIC]: { label: "Выделение курсивным", node: "i", style: TEXT_EDITOR_INLINE_STYLE_ITALIC, icon: <Italic /> }
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
	TextEditorElements[TEXT_EDITOR_BLOCK_STYLE_UNSTYLED],
	TextEditorElements[TEXT_EDITOR_BLOCK_STYLE_HEADER_THREE],
	TextEditorElements[TEXT_EDITOR_BLOCK_STYLE_HEADER_FOUR],
	TextEditorElements[TEXT_EDITOR_BLOCK_STYLE_HEADER_FIVE],
	TextEditorElements[TEXT_EDITOR_BLOCK_STYLE_HEADER_SIX],
	TextEditorElements[TEXT_EDITOR_BLOCK_STYLE_ORDERED_LIST_ITEM],
	TextEditorElements[TEXT_EDITOR_BLOCK_STYLE_UNORDERED_LIST_ITEM],
	TextEditorElements[TEXT_EDITOR_BLOCK_STYLE_BLOCKQUOTE]
];

export const TextEditorInlineControls = [
	TextEditorElements[TEXT_EDITOR_INLINE_STYLE_BOLD],
	TextEditorElements[TEXT_EDITOR_INLINE_STYLE_ITALIC],
	TextEditorElements[TEXT_EDITOR_INLINE_STYLE_UNDERLINE],
	TextEditorElements[TEXT_EDITOR_INLINE_STYLE_STRIKETHROUGH],
	TextEditorElements[TEXT_EDITOR_INLINE_STYLE_HIGHLIGHT],
	TextEditorElements[TEXT_EDITOR_INLINE_STYLE_CODE]
];

export const TextEditorStyleClasses = {
	CODE: {
		color: "var(--text-primary)",
		padding: "0.15em 0.4em",
		margin: "0",
		fontFamily: "monospace",
		fontSize: "85%",
		backgroundColor: "var(--bg-sunken)",
		borderRadius: "var(--radius-md)",
		lineHeight: "1"
	},
	HIGHLIGHT: {
		color: "var(--highlight-text)",
		paddingInline: "0.15em",
		backgroundColor: "var(--highlight-bg)",
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
	// eslint-disable-next-line @typescript-eslint/naming-convention
	LOCAL_LINK = "localLink",
	PHONE = "phone",
	EMAIL = "email"
}

export enum TagTypes {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	abbr = "abbr",
	// eslint-disable-next-line @typescript-eslint/naming-convention
	lang = "lang",
	// eslint-disable-next-line @typescript-eslint/naming-convention
	time = "time",
	// eslint-disable-next-line @typescript-eslint/naming-convention
	cite = "cite",
	// eslint-disable-next-line @typescript-eslint/naming-convention
	ins = "ins",
	// eslint-disable-next-line @typescript-eslint/naming-convention
	del = "del"
}
