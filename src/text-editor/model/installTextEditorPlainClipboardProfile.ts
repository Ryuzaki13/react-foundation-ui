import {
	$addUpdateTag,
	$createParagraphNode,
	$createTextNode,
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_HIGH,
	type LexicalEditor,
	PASTE_COMMAND,
	PASTE_TAG,
	tokenizeRawText
} from "lexical";

import { type TextEditorClipboardProfile } from "../editorModel";

import { normalizeTextEditorClipboardNodes } from "./normalizeTextEditorClipboardNodes";

/** SDK вставляет text/plain без clipboard-nodes command; обрабатываем только эту отдельную ветку. */
export function installTextEditorPlainClipboardProfile(
	editor: LexicalEditor,
	profile: TextEditorClipboardProfile,
	onError: (error: Error) => void
): () => void {
	return editor.registerCommand(
		PASTE_COMMAND,
		(event) => {
			if (!editor.isEditable() || typeof ClipboardEvent === "undefined" || !(event instanceof ClipboardEvent)) return false;
			try {
				const clipboard = event.clipboardData;
				if (!clipboard || clipboard.files.length > 0) return false;
				if (clipboard.getData("text/html") || clipboard.getData("application/x-lexical-editor")) return false;
				const text = clipboard.getData("text/plain");
				const selection = $getSelection();
				if (!text || !$isRangeSelection(selection)) return false;

				let paragraph = $createParagraphNode();
				const paragraphs = [paragraph];
				const format = selection.format;
				tokenizeRawText(text, {
					linebreak: () => {
						paragraph = $createParagraphNode();
						paragraphs.push(paragraph);
					},
					tab: () => paragraph.append($createTextNode(" ").setFormat(format)),
					text: (part) => paragraph.append($createTextNode(part).setFormat(format))
				});
				const normalized = normalizeTextEditorClipboardNodes(paragraphs, profile);
				event.preventDefault();
				if (normalized.length > 0) {
					$addUpdateTag(PASTE_TAG);
					selection.insertNodes(normalized);
				}
				return true;
			} catch (error) {
				// Ошибка профиля не должна незаметно возвращать обходящий его штатный импорт.
				event.preventDefault();
				onError(error instanceof Error ? error : new Error("Не удалось подготовить вставляемый текст", { cause: error }));
				return true;
			}
		},
		COMMAND_PRIORITY_HIGH
	);
}
