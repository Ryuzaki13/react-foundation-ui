import { useCallback, useState } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, HISTORY_MERGE_TAG, type RangeSelection, SKIP_DOM_SELECTION_TAG } from "lexical";

import { $restoreEditorDialogSelection } from "../lib/selection/restoreEditorDialogSelection";
import { resolveToolbarState } from "../lib/toolbar/resolveToolbarState";

import { type LexicalToolbarState } from "./textEditorTypes";
import { useDeferredTextEditorFocus } from "./useDeferredTextEditorFocus";

type FormattingSession = Readonly<{
	selection: RangeSelection | null;
	state: LexicalToolbarState;
}>;

/**
 * Панель переносит DOM-фокус из editable, но команда должна относиться к месту
 * открытия. Snapshot живёт только до выбора/закрытия и не меняет документ при отмене.
 */
export function useCompactTextEditorToolbar(canEdit: () => boolean) {
	const [editor] = useLexicalComposerContext();
	const [session, setSession] = useState<FormattingSession | null>(null);
	const { cancelPendingFocus, restoreFocus } = useDeferredTextEditorFocus(editor, canEdit);

	const onOpenChange = useCallback(
		(open: boolean) => {
			cancelPendingFocus();
			if (!open) {
				setSession(null);
				return;
			}
			if (!canEdit()) return;
			editor.getEditorState().read(() => {
				const selection = $getSelection();
				setSession({
					selection: $isRangeSelection(selection) ? selection.clone() : null,
					state: resolveToolbarState()
				});
			});
		},
		[cancelPendingFocus, canEdit, editor]
	);

	const runCommand = useCallback(
		(command: () => void, nextFocus: "editor" | "dialog" = "editor") => {
			if (!session || !canEdit()) return;
			cancelPendingFocus();
			// Selection-only commit не создаёт отдельный undo-шаг. SKIP_DOM_SELECTION
			// оставляет фокус popup до его закрытия и не борется с открываемым диалогом.
			editor.update(() => $restoreEditorDialogSelection(session.selection), {
				discrete: true,
				tag: [HISTORY_MERGE_TAG, SKIP_DOM_SELECTION_TAG]
			});
			setSession(null);
			if (nextFocus === "editor") command();
			// Диалог открывается после cleanup popup: он не должен запомнить уже
			// удаляемую кнопку как return-focus target или спорить с его focus restore.
			restoreFocus(nextFocus === "dialog" ? command : undefined);
		},
		[cancelPendingFocus, canEdit, editor, restoreFocus, session]
	);

	return { open: session !== null, state: session?.state, onOpenChange, runCommand };
}
