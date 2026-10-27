import { $getRoot, $getSelection, $setSelection, type LexicalEditor, SKIP_SCROLL_INTO_VIEW_TAG } from "lexical";

import { type TextEditorFocusOptions } from "../editorModel";

/** Native focus и Lexical selection согласуются в одном синхронном update без изменения документа. */
export function focusTextEditor(editor: LexicalEditor, options?: TextEditorFocusOptions): void {
	const rootElement = editor.getRootElement();
	if (!editor.isEditable() || !rootElement?.isConnected) return;
	const preventScroll = options?.preventScroll ?? true;
	// Lexical восстанавливает сохранённое выделение, а при его отсутствии ставит
	// каретку в конец. Native focus может синхронно создать DOM selection в начале:
	// сохраняем исходный диапазон до него, внутри того же защищённого update.
	editor.update(
		() => {
			const selection = $getSelection()?.clone() ?? null;
			rootElement.focus({ preventScroll });
			if (selection === null) $getRoot().selectEnd();
			else $setSelection(selection);
			editor.focus(undefined, { defaultSelection: "rootEnd" });
		},
		{ discrete: true, tag: preventScroll ? SKIP_SCROLL_INTO_VIEW_TAG : undefined }
	);
}
