import { useCallback, useEffect, useRef, useState } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	HISTORY_MERGE_TAG,
	type RangeSelection,
	SKIP_DOM_SELECTION_TAG,
	SKIP_SCROLL_INTO_VIEW_TAG
} from "lexical";

import { $restoreEditorDialogSelection } from "../lib/selection/restoreEditorDialogSelection";
import { resolveToolbarState } from "../lib/toolbar/resolveToolbarState";

import { type LexicalToolbarState } from "./textEditorTypes";

type FormattingSession = {
	readonly selection: RangeSelection | null;
	readonly state: LexicalToolbarState;
};

/**
 * Раскрытая панель остаётся частью редактора. Последнее действительное выделение
 * обновляется при вводе и выборе другого диапазона, но переживает переход к кнопкам.
 * Обычные команды возвращают фокус в том же пользовательском событии: отложенный
 * focus после закрытия overlay не гарантирует экранную клавиатуру в iOS Safari.
 */
export function useCompactTextEditorToolbar(canEdit: () => boolean) {
	const [editor] = useLexicalComposerContext();
	const [session, setSession] = useState<FormattingSession | null>(null);
	const latestSelection = useRef<FormattingSession | null>(null);

	useEffect(
		() =>
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					const selection = $getSelection();
					if (!$isRangeSelection(selection)) return;

					const snapshot = { selection: selection.clone(), state: resolveToolbarState() };
					latestSelection.current = snapshot;
					setSession((current) => {
						if (
							current === null ||
							(current.selection?.is(selection) &&
								current.state.blockType === snapshot.state.blockType &&
								current.state.activeAlignment === snapshot.state.activeAlignment)
						)
							return current;

						return snapshot;
					});
				});
			}),
		[editor]
	);

	const onOpenChange = useCallback(
		(open: boolean) => {
			if (!open) {
				setSession(null);
				return;
			}
			if (!canEdit()) return;
			editor.getEditorState().read(() => {
				const selection = $getSelection();
				const snapshot = $isRangeSelection(selection)
					? {
							selection: selection.clone(),
							state: resolveToolbarState()
						}
					: (latestSelection.current ?? { selection: null, state: resolveToolbarState() });
				latestSelection.current = snapshot;
				setSession(snapshot);
			});
		},
		[canEdit, editor]
	);

	const runCommand = useCallback(
		(command: () => void, nextFocus: "editor" | "dialog" = "editor") => {
			if (!session || !canEdit()) return;
			const root = editor.getRootElement();
			if (!root?.isConnected) return;

			const snapshot = latestSelection.current ?? session;
			if (nextFocus === "editor") root.focus({ preventScroll: true });
			// Отдельный selection-only commit сохраняет baseline undo перед первой
			// командой. Диалог получает диапазон, не конкурируя за DOM-фокус.
			editor.update(() => $restoreEditorDialogSelection(snapshot.selection), {
				discrete: true,
				tag: [HISTORY_MERGE_TAG, SKIP_DOM_SELECTION_TAG, SKIP_SCROLL_INTO_VIEW_TAG]
			});
			if (nextFocus === "dialog") command();
			else editor.update(command, { discrete: true, tag: SKIP_SCROLL_INTO_VIEW_TAG });
		},
		[canEdit, editor, session]
	);

	return { open: session !== null, state: session?.state, onOpenChange, runCommand };
}
