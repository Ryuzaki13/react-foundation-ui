import { COMMAND_PRIORITY_HIGH, type LexicalEditor, SELECTION_INSERT_CLIPBOARD_NODES_COMMAND } from "lexical";

import { type TextEditorClipboardProfile } from "../editorModel";

import { installTextEditorPlainClipboardProfile } from "./installTextEditorPlainClipboardProfile";
import { normalizeTextEditorClipboardNodes } from "./normalizeTextEditorClipboardNodes";

/** Полный импорт уже завершён; текущий документ и штатная вставка остаются у Lexical. */
export function installTextEditorClipboardProfile(
	editor: LexicalEditor,
	profile: TextEditorClipboardProfile,
	onError: (error: Error) => void
): () => void {
	const removePlain = installTextEditorPlainClipboardProfile(editor, profile, onError);
	const removeImportedNodes = editor.registerCommand(
		SELECTION_INSERT_CLIPBOARD_NODES_COMMAND,
		({ nodes }) => {
			try {
				const normalized = normalizeTextEditorClipboardNodes(nodes, profile);
				if (normalized.length === 0) return true;
				// SDK продолжает читать исходный массив payload; меняем его содержимое, не ссылку.
				nodes.splice(0, nodes.length);
				for (const node of normalized) nodes.push(node);
				return false;
			} catch (error) {
				// Исключение наружу запустило бы скрытый fallback SDK на text/plain.
				onError(error instanceof Error ? error : new Error("Не удалось подготовить вставляемое содержимое", { cause: error }));
				return true;
			}
		},
		COMMAND_PRIORITY_HIGH
	);
	return () => {
		removeImportedNodes();
		removePlain();
	};
}
