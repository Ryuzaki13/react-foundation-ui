import { useEffect } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalEditor } from "lexical";

import { resolveToolbarState } from "../../lib/toolbar/resolveToolbarState";

import type { LexicalToolbarState } from "../../model/textEditorTypes";

interface SelectionStatePluginProps {
	onEditorReady: (editor: LexicalEditor) => void;
	onStateChange: (state: LexicalToolbarState) => void;
}

/**
 * Плагин Lexical, отслеживающий состояние выделения и готовность редактора.
 */
export function SelectionStatePlugin({ onEditorReady, onStateChange }: SelectionStatePluginProps) {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		onEditorReady(editor);

		return editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				onStateChange(resolveToolbarState());
			});
		});
	}, [editor, onEditorReady, onStateChange]);

	return null;
}
