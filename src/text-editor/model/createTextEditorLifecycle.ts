import { type LexicalEditor } from "lexical";

import { type TextEditorLifecycle } from "./textEditorLifecycleTypes";

/**
 * Поколение относится к документу, а не к DOM редактора. Очистка и смена режима
 * отзывают сохранённые действия popup/dialog даже до следующего React render.
 */
export function createTextEditorLifecycle(): TextEditorLifecycle {
	let generation = 0;
	let activeEditor: LexicalEditor | null = null;
	const listeners = new Set<() => void>();
	const invalidate = () => {
		generation += 1;
		listeners.forEach((listener) => listener());
	};

	return {
		getSnapshot: () => generation,
		subscribe: (listener: () => void) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		attach: (editor: LexicalEditor) => {
			activeEditor = editor;
			invalidate();
			return () => {
				activeEditor = null;
				// Cleanup отзывает callbacks синхронно, но не уведомляет уже снимаемый UI.
				generation += 1;
			};
		},
		invalidate,
		canEdit: (editor: LexicalEditor, expectedGeneration: number) =>
			activeEditor === editor && generation === expectedGeneration && editor.isEditable() && !!editor.getRootElement()?.isConnected
	};
}
