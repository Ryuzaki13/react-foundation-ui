import { useCallback, useLayoutEffect, useRef } from "react";

import { $getSelection, $isRangeSelection, type LexicalEditor, SKIP_SCROLL_INTO_VIEW_TAG } from "lexical";

import { $restoreEditorDialogSelection } from "../lib/selection/restoreEditorDialogSelection";

/**
 * Возвращает фокус после удаления popup/dialog и отменяет работу старого editor.
 * DOM-фокус задаётся явно: смена DOM selection сама по себе не гарантирует
 * activeElement на всех платформах. preventScroll сохраняет позицию host-экрана.
 */
export function useDeferredTextEditorFocus(editor: LexicalEditor | null, canEdit: () => boolean) {
	const focusFrame = useRef<number | null>(null);
	const generation = useRef(0);
	const cancelPendingFocus = useCallback(() => {
		generation.current += 1;
		if (focusFrame.current === null) return;
		cancelAnimationFrame(focusFrame.current);
		focusFrame.current = null;
	}, []);

	useLayoutEffect(() => cancelPendingFocus, [cancelPendingFocus, editor, canEdit]);

	const restoreFocus = useCallback(
		(afterFocus?: () => void) => {
			cancelPendingFocus();
			const selection = editor?.getEditorState().read(() => {
				const current = $getSelection();
				return $isRangeSelection(current) ? current.clone() : null;
			});
			const expectedGeneration = generation.current;
			focusFrame.current = requestAnimationFrame(() => {
				if (generation.current !== expectedGeneration || !canEdit()) return;
				focusFrame.current = null;
				const root = editor?.getRootElement();
				if (!editor || !root?.isConnected) return;
				root.focus({ preventScroll: true });
				// DOM preventScroll не запрещает Lexical отдельно прокручивать каретку.
				// Закрытие overlay могло изменить DOM selection: возвращаем snapshot
				// именно после cleanup и native focus, а не только до закрытия диалога.
				editor.update(
					() => {
						$restoreEditorDialogSelection(selection ?? null);
						editor.focus();
					},
					{ discrete: true, tag: SKIP_SCROLL_INTO_VIEW_TAG }
				);
				afterFocus?.();
			});
		},
		[cancelPendingFocus, canEdit, editor]
	);

	return { cancelPendingFocus, restoreFocus };
}
