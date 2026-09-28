import { useEffect, useRef, useState } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, SKIP_SCROLL_INTO_VIEW_TAG } from "lexical";

type TextEditorInitialFocusPluginProps = Readonly<{
	autoFocus: boolean;
	readOnly: boolean;
}>;

/**
 * Начальный фокус принадлежит документу, а не lifecycle панели или readOnly.
 * Одноразовый snapshot не превращает позднее разрешение ввода в команду focus.
 */
export function TextEditorInitialFocusPlugin({ autoFocus, readOnly }: TextEditorInitialFocusPluginProps) {
	const [editor] = useLexicalComposerContext();
	const [shouldInitiallyFocus] = useState(() => autoFocus && !readOnly);
	const attempted = useRef(false);

	useEffect(() => {
		if (attempted.current) return;
		attempted.current = true;
		const rootElement = editor.getRootElement();
		if (!shouldInitiallyFocus || !editor.isEditable() || !rootElement?.isConnected) return;

		// Native focus и Lexical selection — разные механизмы. Оба не должны
		// прокручивать host-экран; discrete update не оставляет поздней focus-задачи
		// после отмены документа или повторной установки effect в StrictMode.
		rootElement.focus({ preventScroll: true });
		editor.update(
			() => {
				$getRoot().selectEnd();
				editor.focus();
			},
			{ discrete: true, tag: SKIP_SCROLL_INTO_VIEW_TAG }
		);
	}, [editor, shouldInitiallyFocus]);

	return null;
}
