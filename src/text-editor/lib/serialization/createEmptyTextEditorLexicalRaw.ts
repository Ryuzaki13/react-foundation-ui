import { $createParagraphNode, $getRoot, createEditor } from "lexical";

import { type TextEditorLexicalRaw } from "../../editorModel";

import { createLexicalRaw } from "./createLexicalRaw";

/** Создаёт независимый JSON-снимок с одним пустым абзацем без DOM и монтирования редактора. */
export function createEmptyTextEditorLexicalRaw(): TextEditorLexicalRaw {
	const editor = createEditor({
		namespace: "TextEditorLexicalEmptyRaw",
		onError: (error) => {
			throw error;
		}
	});
	editor.update(() => $getRoot().append($createParagraphNode()), { discrete: true });
	return createLexicalRaw(editor.getEditorState());
}
