/** Приватная безопасная проекция: DOM получает только перечисленные свойства, а не исходный JSON. */
export type TextEditorViewerElement = Readonly<{
	direction: "ltr" | "rtl" | null;
	alignment: "" | "left" | "right" | "center" | "justify" | "start" | "end";
	indent: number;
}>;

export type TextEditorViewerText = Readonly<{ type: "text"; text: string; format: number }>;
export type TextEditorViewerLineBreak = Readonly<{ type: "linebreak" }>;
export type TextEditorViewerLink = Readonly<
	TextEditorViewerElement & {
		type: "link";
		url: string;
		target: "_self" | "_blank";
		ariaLabel: string | null;
		title: string | null;
		children: readonly (TextEditorViewerText | TextEditorViewerLineBreak)[];
	}
>;
export type TextEditorViewerInline = TextEditorViewerText | TextEditorViewerLineBreak | TextEditorViewerLink;

export type TextEditorViewerParagraph = Readonly<
	TextEditorViewerElement & { type: "paragraph"; children: readonly TextEditorViewerInline[] }
>;
export type TextEditorViewerQuote = Readonly<TextEditorViewerElement & { type: "quote"; children: readonly TextEditorViewerInline[] }>;
export type TextEditorViewerHeading = Readonly<
	TextEditorViewerElement & {
		type: "heading";
		tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
		children: readonly TextEditorViewerInline[];
	}
>;
export type TextEditorViewerList = Readonly<
	TextEditorViewerElement & {
		type: "list";
		listType: "bullet" | "number";
		start: number;
		children: readonly TextEditorViewerListItem[];
	}
>;
export type TextEditorViewerListItem = Readonly<
	TextEditorViewerElement & {
		type: "listitem";
		value: number;
		children: readonly (TextEditorViewerInline | TextEditorViewerList)[];
	}
>;
export type TextEditorViewerBlock = TextEditorViewerParagraph | TextEditorViewerQuote | TextEditorViewerHeading | TextEditorViewerList;
export type TextEditorViewerNode = TextEditorViewerBlock | TextEditorViewerInline | TextEditorViewerListItem;

/** Неподдержанный документ не возвращает частично разобранный content. */
export type TextEditorViewerDocument =
	| Readonly<{ status: "valid"; element: TextEditorViewerElement; children: readonly TextEditorViewerBlock[] }>
	| Readonly<{ status: "invalid" }>;
