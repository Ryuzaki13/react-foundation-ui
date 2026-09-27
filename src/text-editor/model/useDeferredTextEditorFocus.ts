import { useCallback, useEffect, useRef } from "react";

import { type LexicalEditor } from "lexical";

/**
 * Возвращает фокус после удаления popup/dialog и отменяет работу старого editor.
 * DOM-фокус задаётся явно: смена DOM selection сама по себе не гарантирует
 * activeElement на всех платформах. preventScroll сохраняет позицию host-экрана.
 */
export function useDeferredTextEditorFocus(editor: LexicalEditor | null) {
	const focusFrame = useRef<number | null>(null);
	const cancelPendingFocus = useCallback(() => {
		if (focusFrame.current === null) return;
		cancelAnimationFrame(focusFrame.current);
		focusFrame.current = null;
	}, []);

	useEffect(() => cancelPendingFocus, [cancelPendingFocus, editor]);

	const restoreFocus = useCallback(
		(afterFocus?: () => void) => {
			cancelPendingFocus();
			focusFrame.current = requestAnimationFrame(() => {
				focusFrame.current = null;
				const root = editor?.getRootElement();
				if (!editor || !root?.isConnected) return;
				root.focus({ preventScroll: true });
				editor.focus();
				afterFocus?.();
			});
		},
		[cancelPendingFocus, editor]
	);

	return { cancelPendingFocus, restoreFocus };
}
