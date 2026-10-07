import { useEffect } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { installCompactTextEditorCaretScroll } from "../../model/installCompactTextEditorCaretScroll";

/** Компактная поверхность не распоряжается прокруткой окружающего экрана. */
export function TextEditorCompactCaretScrollPlugin() {
	const [editor] = useLexicalComposerContext();
	useEffect(() => installCompactTextEditorCaretScroll(editor), [editor]);
	return null;
}
