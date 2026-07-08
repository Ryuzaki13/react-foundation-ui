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
 * Контейнер набора диалогов, которые используются редактором для вставки ссылок и семантических сущностей.
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
			{linkTypeDialog && (
				<>
					{LocalLinkDialogComponent && (
						<LocalLinkDialogComponent
							isOpen={linkTypeDialog === LinkTypes.LOCAL_LINK}
							onClose={onCloseLinkDialog}
							onConfirm={onAddLocalLink}
						/>
					)}

					<LinkDialog
						isOpen={linkTypeDialog === LinkTypes.LINK}
						initialState={getSelectedLinkState()}
						onClose={onCloseLinkDialog}
						onConfirm={onAddLink}
					/>

					<PhoneDialog
						isOpen={linkTypeDialog === LinkTypes.PHONE}
						initialState={getSelectedLinkState()}
						onClose={onCloseLinkDialog}
						onConfirm={onAddLink}
					/>

					<EmailDialog
						isOpen={linkTypeDialog === LinkTypes.EMAIL}
						initialState={getSelectedLinkState()}
						onClose={onCloseLinkDialog}
						onConfirm={onAddLink}
					/>
				</>
			)}

			{tagTypeDialog &&
				(tagTypeDialog !== TagTypes.time ? (
					<SemanticDialog
						isOpen={true}
						onClose={onCloseTagDialog}
						onConfirm={onInsertSemanticTag}
						config={SemanticTagConfigs[tagTypeDialog]}
						initialText={getCurrentSelectionText()}
					/>
				) : (
					<TimeDialog isOpen={true} onClose={onCloseTagDialog} onConfirm={onInsertSemanticTag} />
				))}
		</>
	);
}
