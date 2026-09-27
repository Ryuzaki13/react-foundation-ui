import { useCallback, useState } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { type TextEditorCoreProps } from "./editorModel";
import { useTextEditorLexicalActions } from "./model/hooks/useTextEditorLexicalActions";
import { type TextEditorLifecycle } from "./model/textEditorLifecycleTypes";
import { type LexicalToolbarState } from "./model/textEditorTypes";
import { TextEditorDialogs } from "./TextEditorDialogs";
import { type LinkTypes, type TagTypes, TextEditorToolbarLexical } from "./toolbar";
import { TextEditorCompactToolbar } from "./toolbar/TextEditorCompactToolbar";

type TextEditorInteractionsProps = Readonly<
	Pick<TextEditorCoreProps, "presentation" | "toolbarComponents" | "businessAdapters" | "externalLinkOptions" | "readOnly"> & {
		lifecycle: TextEditorLifecycle;
		generation: number;
		state: LexicalToolbarState;
	}
>;

/** Сессии инструментов можно отозвать отдельно, не уничтожая документ и его DOM. */
export function TextEditorInteractions({
	lifecycle,
	generation,
	state,
	readOnly,
	presentation,
	toolbarComponents,
	businessAdapters,
	externalLinkOptions
}: TextEditorInteractionsProps) {
	const [editor] = useLexicalComposerContext();
	const [linkTypeDialog, setLinkTypeDialog] = useState<LinkTypes | null>(null);
	const [tagTypeDialog, setTagTypeDialog] = useState<TagTypes | null>(null);
	const canEdit = useCallback(() => !readOnly && lifecycle.canEdit(editor, generation), [editor, generation, lifecycle, readOnly]);
	const actions = useTextEditorLexicalActions({
		editor,
		toolbarState: state,
		hasLocalLinkDialog: !!businessAdapters?.LocalLinkDialogComponent,
		onOpenLinkDialog: setLinkTypeDialog,
		onOpenTagDialog: setTagTypeDialog,
		canEdit
	});
	const toolbarProps = {
		toolbarComponents,
		state,
		disabled: readOnly,
		onBlockStyleToggle: actions.handleBlockStyleToggle,
		onInlineStyleToggle: actions.handleInlineStyleToggle,
		onAlignmentChange: actions.handleAlignmentChange,
		onLinkClick: actions.handleLinkClick,
		onTagClick: actions.handleTagClick,
		onUndo: actions.handleUndo,
		onRedo: actions.handleRedo,
		onCleanTag: actions.handleCleanSemanticTag
	};

	return (
		<>
			{presentation === "compact" ? (
				<TextEditorCompactToolbar {...toolbarProps} canEdit={canEdit} />
			) : (
				<TextEditorToolbarLexical {...toolbarProps} />
			)}
			{!readOnly && (
				<TextEditorDialogs
					externalLinkOptions={externalLinkOptions}
					linkTypeDialog={linkTypeDialog}
					tagTypeDialog={tagTypeDialog}
					localLinkDialogComponent={businessAdapters?.LocalLinkDialogComponent}
					onCloseLinkDialog={() => {
						actions.closeLinkDialog();
						setLinkTypeDialog(null);
					}}
					onCloseTagDialog={() => {
						actions.closeTagDialog();
						setTagTypeDialog(null);
					}}
					onAddLink={actions.handleAddLink}
					onAddLocalLink={actions.handleAddLocalLink}
					onInsertSemanticTag={actions.insertSemanticTagAtSelection}
					semanticDialogState={actions.semanticDialogState}
					linkDialogState={actions.linkDialogState}
				/>
			)}
		</>
	);
}
