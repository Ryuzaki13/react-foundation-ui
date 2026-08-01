import type { ComponentType } from "react";

import { EmailDialog } from "./EmailDialog";
import { LinkDialog } from "./LinkDialog";
import { PhoneDialog } from "./PhoneDialog";
import { SemanticDialog } from "./SemanticDialog";
import { SemanticTagConfigs } from "./semanticTagConfigs";
import { TimeDialog } from "./TimeDialog";
import { LinkTypes, TagTypes } from "./toolbar";

import type { LocalLinkDialogAdapterProps } from "./editorModel";
import type { LinkType } from "./model/textEditorTypes";

interface TextEditorDialogsProps {
	linkTypeDialog: LinkTypes | null;
	tagTypeDialog: TagTypes | null;
	localLinkDialogComponent?: ComponentType<LocalLinkDialogAdapterProps>;
	onCloseLinkDialog: () => void;
	onCloseTagDialog: () => void;
	onAddLink: (url: string, text: string, add: string, ariaLabel: string, showQrCode: boolean) => void;
	onAddLocalLink: (url: string, caption: string) => void;
	onInsertSemanticTag: (tagName: string, text: string, attributes: Record<string, string>) => void;
	getCurrentSelectionText: () => string;
	getSelectedLinkState: () => LinkType;
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
	getCurrentSelectionText,
	getSelectedLinkState
}: TextEditorDialogsProps) {
	const LocalLinkDialogComponent = localLinkDialogComponent;

	return (
		<>
			{linkTypeDialog === LinkTypes.LOCAL_LINK && LocalLinkDialogComponent ? (
				<LocalLinkDialogComponent isOpen={true} onClose={onCloseLinkDialog} onConfirm={onAddLocalLink} />
			) : null}

			{linkTypeDialog === LinkTypes.LINK ? (
				<LinkDialog initialState={getSelectedLinkState()} onClose={onCloseLinkDialog} onConfirm={onAddLink} />
			) : null}

			{linkTypeDialog === LinkTypes.PHONE ? (
				<PhoneDialog initialState={getSelectedLinkState()} onClose={onCloseLinkDialog} onConfirm={onAddLink} />
			) : null}

			{linkTypeDialog === LinkTypes.EMAIL ? (
				<EmailDialog initialState={getSelectedLinkState()} onClose={onCloseLinkDialog} onConfirm={onAddLink} />
			) : null}

			{tagTypeDialog &&
				(tagTypeDialog !== TagTypes.time ? (
					<SemanticDialog
						onClose={onCloseTagDialog}
						onConfirm={onInsertSemanticTag}
						config={SemanticTagConfigs[tagTypeDialog]}
						initialText={getCurrentSelectionText()}
					/>
				) : (
					<TimeDialog onClose={onCloseTagDialog} onConfirm={onInsertSemanticTag} />
				))}
		</>
	);
}
