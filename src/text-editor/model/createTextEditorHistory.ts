import { createEmptyHistoryState } from "@lexical/react/LexicalHistoryPlugin";

import { type TextEditorHistory } from "./textEditorLifecycleTypes";

/** История живёт вместе с документом, в том числе до passive-регистрации HistoryPlugin. */
export function createTextEditorHistory(): TextEditorHistory {
	const state = createEmptyHistoryState();
	return {
		state,
		reset: (editor) => {
			state.undoStack = [];
			state.redoStack = [];
			state.current = { editor, editorState: editor.getEditorState() };
		}
	};
}
