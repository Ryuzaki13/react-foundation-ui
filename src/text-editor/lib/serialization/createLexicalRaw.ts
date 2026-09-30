import { isRecord } from "@ryuzaki13/react-foundation-lib/validators";
import { type EditorState as LexicalEditorState } from "lexical";

import { type TextEditorLexicalRaw } from "../../editorModel";

export const createLexicalRaw = (editorState: LexicalEditorState): TextEditorLexicalRaw => {
	// toJSON SDK может оставлять enumerable undefined в optional полях узлов.
	// Consumer получает именно JSON-снимок: roundtrip убирает эти поля без
	// изменения EditorState и сохраняет обычную семантику сериализации Lexical.
	const serializedState: unknown = JSON.parse(JSON.stringify(editorState.toJSON()));
	if (!isRecord(serializedState) || !isRecord(serializedState.root)) {
		throw new Error("Сериализованное состояние Lexical должно содержать объект root");
	}

	return {
		format: "lexical",
		version: 1,
		editorState: serializedState
	};
};
