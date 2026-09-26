import { type ReactNode } from "react";

import { IS_BOLD, IS_CODE, IS_HIGHLIGHT, IS_ITALIC, IS_STRIKETHROUGH, IS_SUBSCRIPT, IS_SUPERSCRIPT, IS_UNDERLINE } from "lexical";

import { type TextEditorViewerText as TextEditorViewerTextModel } from "../../model/textEditorViewerTypes";

export type TextEditorViewerTextProps = Readonly<{ node: TextEditorViewerTextModel }>;

/** Семантические обёртки сохраняют сочетания форматов, React экранирует сам текст. */
export function TextEditorViewerText({ node }: TextEditorViewerTextProps) {
	let content: ReactNode = node.text;
	if (node.format & IS_BOLD) content = <strong>{content}</strong>;
	if (node.format & IS_ITALIC) content = <em>{content}</em>;
	if (node.format & IS_UNDERLINE) content = <u>{content}</u>;
	if (node.format & IS_STRIKETHROUGH) content = <s>{content}</s>;
	if (node.format & IS_CODE) content = <code>{content}</code>;
	if (node.format & IS_HIGHLIGHT) content = <mark>{content}</mark>;
	if (node.format & IS_SUBSCRIPT) content = <sub>{content}</sub>;
	if (node.format & IS_SUPERSCRIPT) content = <sup>{content}</sup>;
	return content;
}
