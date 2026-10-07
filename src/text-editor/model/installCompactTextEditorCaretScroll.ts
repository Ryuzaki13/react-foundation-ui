import {
	$addUpdateTag,
	COMMAND_PRIORITY_CRITICAL,
	KEY_DOWN_COMMAND,
	type LexicalEditor,
	REDO_COMMAND,
	RootNode,
	SELECTION_CHANGE_COMMAND,
	SKIP_SCROLL_INTO_VIEW_TAG,
	UNDO_COMMAND
} from "lexical";

import { revealTextEditorCaretInEditable } from "../lib/selection/revealTextEditorCaretInEditable";

/**
 * Root transform выполняется до DOM reconciliation, update listener — после.
 * Эта пара заменяет ancestor reveal Lexical адресным раскрытием каретки без
 * изменения документа или отдельного React-состояния.
 */
export function installCompactTextEditorCaretScroll(editor: LexicalEditor): () => void {
	const suppressAncestorReveal = () => {
		$addUpdateTag(SKIP_SCROLL_INTO_VIEW_TAG);
		return false;
	};
	const disposers = [
		editor.registerNodeTransform(RootNode, suppressAncestorReveal),
		// Selection-only keyboard и undo/redo не обязаны делать root dirty.
		// Обработчики не поглощают команду и не заменяют поведение Lexical.
		editor.registerCommand(KEY_DOWN_COMMAND, suppressAncestorReveal, COMMAND_PRIORITY_CRITICAL),
		editor.registerCommand(UNDO_COMMAND, suppressAncestorReveal, COMMAND_PRIORITY_CRITICAL),
		editor.registerCommand(REDO_COMMAND, suppressAncestorReveal, COMMAND_PRIORITY_CRITICAL),
		editor.registerCommand(SELECTION_CHANGE_COMMAND, suppressAncestorReveal, COMMAND_PRIORITY_CRITICAL),
		editor.registerUpdateListener(() => {
			const root = editor.getRootElement();
			if (root && editor.isEditable()) revealTextEditorCaretInEditable(root);
		})
	];
	return () => {
		for (const dispose of disposers) dispose();
	};
}
