import { EditorState as LexicalEditorState } from "lexical";

import type { TextEditorLexicalRaw } from "../../editorModel";

export const createLexicalRaw = (editorState: LexicalEditorState): TextEditorLexicalRaw => {
	return {
		format: "lexical",
		version: 1,
		editorState: editorState.toJSON() as unknown as Record<string, unknown>
	};
};
