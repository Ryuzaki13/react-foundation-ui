import {
	type LEXICAL_NODE_TYPE_TEXT,
	type LEXICAL_NODE_TYPE_LINEBREAK,
	type LEXICAL_NODE_TYPE_LINK,
	type LEXICAL_NODE_TYPE_PARAGRAPH,
	type LEXICAL_NODE_TYPE_QUOTE,
	type LEXICAL_NODE_TYPE_HEADING,
	type LEXICAL_NODE_TYPE_LIST,
	type LEXICAL_LIST_TYPE_BULLET,
	type LEXICAL_LIST_TYPE_NUMBER,
	type LEXICAL_NODE_TYPE_LISTITEM
} from "./textEditorLexicalNodeConstants";
import { type TEXT_EDITOR_LINK_TARGET_SELF, type TEXT_EDITOR_LINK_TARGET_BLANK } from "./textEditorLinkConstants";
import { type TEXT_EDITOR_VIEWER_VALID, type TEXT_EDITOR_VIEWER_INVALID } from "./textEditorViewerStatusConstants";
/** Приватная безопасная проекция: DOM получает только перечисленные свойства, а не исходный JSON. */
export type TextEditorViewerElement = Readonly<{
	direction: "ltr" | "rtl" | null;
	alignment: "" | "left" | "right" | "center" | "justify" | "start" | "end";
	indent: number;
}>;

export type TextEditorViewerText = Readonly<{ type: typeof LEXICAL_NODE_TYPE_TEXT; text: string; format: number }>;
export type TextEditorViewerLineBreak = Readonly<{ type: typeof LEXICAL_NODE_TYPE_LINEBREAK }>;
export type TextEditorViewerLink = Readonly<
	TextEditorViewerElement & {
		type: typeof LEXICAL_NODE_TYPE_LINK;
		url: string;
		target: typeof TEXT_EDITOR_LINK_TARGET_SELF | typeof TEXT_EDITOR_LINK_TARGET_BLANK;
		ariaLabel: string | null;
		title: string | null;
		children: readonly (TextEditorViewerText | TextEditorViewerLineBreak)[];
	}
>;
export type TextEditorViewerInline = TextEditorViewerText | TextEditorViewerLineBreak | TextEditorViewerLink;

export type TextEditorViewerParagraph = Readonly<
	TextEditorViewerElement & { type: typeof LEXICAL_NODE_TYPE_PARAGRAPH; children: readonly TextEditorViewerInline[] }
>;
export type TextEditorViewerQuote = Readonly<
	TextEditorViewerElement & { type: typeof LEXICAL_NODE_TYPE_QUOTE; children: readonly TextEditorViewerInline[] }
>;
export type TextEditorViewerHeading = Readonly<
	TextEditorViewerElement & {
		type: typeof LEXICAL_NODE_TYPE_HEADING;
		tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
		children: readonly TextEditorViewerInline[];
	}
>;
export type TextEditorViewerList = Readonly<
	TextEditorViewerElement & {
		type: typeof LEXICAL_NODE_TYPE_LIST;
		listType: typeof LEXICAL_LIST_TYPE_BULLET | typeof LEXICAL_LIST_TYPE_NUMBER;
		start: number;
		children: readonly TextEditorViewerListItem[];
	}
>;
export type TextEditorViewerListItem = Readonly<
	TextEditorViewerElement & {
		type: typeof LEXICAL_NODE_TYPE_LISTITEM;
		value: number;
		children: readonly (TextEditorViewerInline | TextEditorViewerList)[];
	}
>;
export type TextEditorViewerBlock = TextEditorViewerParagraph | TextEditorViewerQuote | TextEditorViewerHeading | TextEditorViewerList;
export type TextEditorViewerNode = TextEditorViewerBlock | TextEditorViewerInline | TextEditorViewerListItem;

/** Неподдержанный документ не возвращает частично разобранный content. */
export type TextEditorViewerDocument =
	| Readonly<{ status: typeof TEXT_EDITOR_VIEWER_VALID; element: TextEditorViewerElement; children: readonly TextEditorViewerBlock[] }>
	| Readonly<{ status: typeof TEXT_EDITOR_VIEWER_INVALID }>;
