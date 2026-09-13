import { type ComponentType } from "react";

import { type LocalLinkDialogAdapterProps } from "./editorModel";
import { EmailDialog } from "./EmailDialog";
import { getTimeDialogInitialState } from "./lib/semantic/getTimeDialogInitialState";
import { LinkDialog } from "./LinkDialog";
import { type SemanticDialogState } from "./model/semanticDialogState";
import { type LinkType } from "./model/textEditorTypes";
import { PhoneDialog } from "./PhoneDialog";
import { SemanticDialog } from "./SemanticDialog";
import { SemanticTagConfigs } from "./semanticTagConfigs";
import { TimeDialog } from "./TimeDialog";
import { LinkTypes, TagTypes } from "./toolbar";

interface TextEditorDialogsProps {
	linkTypeDialog: LinkTypes | null;
	tagTypeDialog: TagTypes | null;
	localLinkDialogComponent?: ComponentType<LocalLinkDialogAdapterProps>;
	onCloseLinkDialog: () => void;
	onCloseTagDialog: () => void;
	onAddLink: (url: string, text: string, add: string, ariaLabel: string, showQrCode: boolean) => void;
	onAddLocalLink: (url: string, caption: string) => void;
	onInsertSemanticTag: (tagName: string, text: string, attributes: Record<string, string>) => void;
	semanticDialogState: SemanticDialogState;
	linkDialogState: LinkType;
}

/**
 * Монтирует только активную dialog-session редактора. Граница монтирования создаёт
 * свежий draft из текущего selection state без синхронизирующих setState-effects.
 */
export function TextEditorDialogs({
	linkTypeDialog,
	tagTypeDialog,
	localLinkDialogComponent,
	onCloseLinkDialog,
	onCloseTagDialog,
	onAddLink,
	onAddLocalLink,
	onInsertSemanticTag,
	semanticDialogState,
	linkDialogState
}: TextEditorDialogsProps) {
	const LocalLinkDialogComponent = localLinkDialogComponent;

	return (
		<>
			{linkTypeDialog === LinkTypes.LOCAL_LINK && LocalLinkDialogComponent ? (
				<LocalLinkDialogComponent isOpen={true} onClose={onCloseLinkDialog} onConfirm={onAddLocalLink} />
			) : null}

			{linkTypeDialog === LinkTypes.LINK ? (
				<LinkDialog initialState={linkDialogState} onClose={onCloseLinkDialog} onConfirm={onAddLink} />
			) : null}

			{linkTypeDialog === LinkTypes.PHONE ? (
				<PhoneDialog initialState={linkDialogState} onClose={onCloseLinkDialog} onConfirm={onAddLink} />
			) : null}

			{linkTypeDialog === LinkTypes.EMAIL ? (
				<EmailDialog initialState={linkDialogState} onClose={onCloseLinkDialog} onConfirm={onAddLink} />
			) : null}

			{tagTypeDialog &&
				(tagTypeDialog !== TagTypes.time ? (
					<SemanticDialog
						onClose={onCloseTagDialog}
						onConfirm={onInsertSemanticTag}
						config={SemanticTagConfigs[tagTypeDialog]}
						initialText={semanticDialogState.text}
						initialState={semanticDialogState.attributes}
					/>
				) : (
					<TimeDialog
						onClose={onCloseTagDialog}
						onConfirm={onInsertSemanticTag}
						initialState={getTimeDialogInitialState(semanticDialogState.attributes.datetime)}
					/>
				))}
		</>
	);
}
