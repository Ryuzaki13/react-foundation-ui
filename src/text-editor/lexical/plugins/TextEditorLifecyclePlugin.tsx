import { type Ref, useImperativeHandle, useLayoutEffect, useRef } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $getRoot, CLEAR_HISTORY_COMMAND, SKIP_DOM_SELECTION_TAG, SKIP_SCROLL_INTO_VIEW_TAG } from "lexical";

import { type TextEditorHandle } from "../../editorModel";
import { type TextEditorHistory, type TextEditorLifecycle } from "../../model/textEditorLifecycleTypes";

type TextEditorLifecyclePluginProps = Readonly<{
	lifecycle: TextEditorLifecycle;
	history: TextEditorHistory;
	readOnly: boolean;
	editorRef?: Ref<TextEditorHandle>;
}>;

/** Узкая граница imperative API: история и документ меняются в текущем Lexical instance. */
export function TextEditorLifecyclePlugin({ lifecycle, history, readOnly, editorRef }: TextEditorLifecyclePluginProps) {
	const [editor] = useLexicalComposerContext();
	const lease = useRef({ active: false, generation: 0 });
	useLayoutEffect(() => lifecycle.attach(editor), [editor, lifecycle]);
	useLayoutEffect(() => {
		const currentLease = lease.current;
		currentLease.generation += 1;
		currentLease.active = true;
		return () => {
			currentLease.active = false;
		};
	}, [editor, editorRef, lifecycle]);
	useLayoutEffect(() => {
		if (editor.isEditable() === !readOnly) return;
		editor.setEditable(!readOnly);
		lifecycle.invalidate();
	}, [editor, lifecycle, readOnly]);

	useImperativeHandle(editorRef, () => {
		// Ref cleanup отзывает и сохранённый consumer handle, включая StrictMode
		// и замену самого ref. Отозванный handle не должен очистить новую сессию.
		const generation = lease.current.generation;
		const handle: TextEditorHandle = {
			clear: () => {
				const rootElement = editor.getRootElement();
				if (!lease.current.active || lease.current.generation !== generation || !rootElement?.isConnected) return;
				const focused = rootElement.contains(rootElement.ownerDocument.activeElement);
				lifecycle.invalidate();
				// Сначала сбрасываем прошлую историю, затем фиксируем пустой baseline.
				// HISTORY_MERGE_TAG здесь не используется: consumer получает onChange.
				editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
				editor.update(
					() => {
						const paragraph = $createParagraphNode();
						$getRoot().clear().append(paragraph);
						paragraph.selectStart();
					},
					{ discrete: true, tag: focused ? SKIP_SCROLL_INTO_VIEW_TAG : SKIP_DOM_SELECTION_TAG }
				);
				// Первый ref callback предшествует passive HistoryPlugin. Явный baseline
				// делает следующий ввод отменяемым также в этой ранней фазе.
				history.reset(editor);
			}
		};
		return handle;
	}, [editor, history, lifecycle]);
	return null;
}
