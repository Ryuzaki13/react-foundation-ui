import { type HistoryState } from "@lexical/react/LexicalHistoryPlugin";
import { type LexicalEditor } from "lexical";

export type TextEditorLifecycle = Readonly<{
	getSnapshot: () => number;
	subscribe: (listener: () => void) => () => void;
	attach: (editor: LexicalEditor) => () => void;
	invalidate: () => void;
	canEdit: (editor: LexicalEditor, expectedGeneration: number) => boolean;
}>;

export type TextEditorHistory = Readonly<{
	state: HistoryState;
	reset: (editor: LexicalEditor) => void;
}>;
