export type TextAlignment = "left" | "center" | "right" | "justify";

export type TextEditorBlockStyle =
	| "header-one"
	| "header-two"
	| "header-three"
	| "header-four"
	| "header-five"
	| "header-six"
	| "blockquote"
	| "code-block"
	| "ordered-list-item"
	| "unordered-list-item"
	| "unstyled"
	| "paragraph";

export type TextEditorInlineStyle = "BOLD" | "ITALIC" | "UNDERLINE" | "STRIKETHROUGH" | "HIGHLIGHT" | "CODE";

export type TextEditorElementTypes = TextEditorBlockStyle | TextEditorInlineStyle;

export interface TextEditorLinkState {
	ariaLabel: string;
	text: string;
	url: string;
	add: string;
	qrCode?: boolean;
}

export type LinkType = TextEditorLinkState | string;

export interface LexicalToolbarState {
	blockType: string;
	isTextUnselected: boolean;
	activeInlineStyles: Record<TextEditorInlineStyle, boolean>;
	activeAlignment: TextAlignment | null;
}

export const DEFAULT_TOOLBAR_STATE: LexicalToolbarState = {
	blockType: "unstyled",
	isTextUnselected: true,
	activeInlineStyles: {
		BOLD: false,
		ITALIC: false,
		UNDERLINE: false,
		STRIKETHROUGH: false,
		HIGHLIGHT: false,
		CODE: false
	},
	activeAlignment: null
};
