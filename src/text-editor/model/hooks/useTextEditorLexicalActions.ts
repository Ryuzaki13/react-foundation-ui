import { useCallback } from "react";

import { $isLinkNode } from "@lexical/link";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from "@lexical/list";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $findMatchingParent } from "@lexical/utils";
import {
	$createParagraphNode,
	$createTextNode,
	$getSelection,
	$isRangeSelection,
	ElementFormatType,
	FORMAT_ELEMENT_COMMAND,
	FORMAT_TEXT_COMMAND,
	type LexicalEditor,
	type LexicalNode,
	REDO_COMMAND,
	UNDO_COMMAND
} from "lexical";

import { getSemanticTagDepth } from "../../lib/semantic/getSemanticTagDepth";
import { getHeadingTagByStyle, getLexicalInlineStyle } from "../../lib/toolbar/styleMappers";
import { $createAccessibleLinkNode, $isAccessibleLinkNode } from "../../nodes/AccessibleLinkNode";
import { $createSemanticTagNode, $isSemanticTagNode, type SemanticTagNode } from "../../nodes/SemanticTagNode";
import { LinkTypes, TagTypes } from "../../toolbar";
import { type LexicalToolbarState, type LinkType, type TextAlignment } from "../textEditorTypes";

interface InsertLinkPayload {
	url: string;
	text: string;
	add: string;
	ariaLabel: string;
	qrCode: boolean;
}

interface UseTextEditorLexicalActionsParams {
	editor: LexicalEditor | null;
	toolbarState: LexicalToolbarState;
	hasLocalLinkDialog: boolean;
	onOpenLinkDialog: (type: LinkTypes) => void;
	onOpenTagDialog: (type: TagTypes) => void;
}

export function useTextEditorLexicalActions({
	editor,
	toolbarState,
	hasLocalLinkDialog,
	onOpenLinkDialog,
	onOpenTagDialog
}: UseTextEditorLexicalActionsParams) {
	const handleBlockStyleToggle = useCallback(
		(style: string) => {
			if (!editor) return;

			if (style === "unordered-list-item") {
				if (toolbarState.blockType === "unordered-list-item") {
					editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
					return;
				}
				editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
				return;
			}

			if (style === "ordered-list-item") {
				if (toolbarState.blockType === "ordered-list-item") {
					editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
					return;
				}
				editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
				return;
			}

			editor.update(() => {
				const selection = $getSelection();
				if (!$isRangeSelection(selection)) return;

				if (style === "unstyled" || style === "paragraph") {
					$setBlocksType(selection, () => $createParagraphNode());
					return;
				}

				if (style === "blockquote") {
					$setBlocksType(selection, () => $createQuoteNode());
					return;
				}

				const headingTag = getHeadingTagByStyle(style);
				if (headingTag) {
					$setBlocksType(selection, () => $createHeadingNode(headingTag));
				}
			});
		},
		[editor, toolbarState.blockType]
	);

	const handleInlineStyleToggle = useCallback(
		(style: string) => {
			if (!editor) return;

			const lexicalStyle = getLexicalInlineStyle(style);
			if (!lexicalStyle) return;

			editor.dispatchCommand(FORMAT_TEXT_COMMAND, lexicalStyle as never);
		},
		[editor]
	);

	const handleAlignmentChange = useCallback(
		(alignment: TextAlignment) => {
			if (!editor) return;
			editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment as ElementFormatType);
		},
		[editor]
	);

	const handleUndo = useCallback(() => {
		if (!editor) return;
		editor.dispatchCommand(UNDO_COMMAND, undefined);
	}, [editor]);

	const handleRedo = useCallback(() => {
		if (!editor) return;
		editor.dispatchCommand(REDO_COMMAND, undefined);
	}, [editor]);

	const getCurrentSelectionText = useCallback((): string => {
		if (!editor) return "";

		let text = "";
		editor.getEditorState().read(() => {
			const selection = $getSelection();
			if (!$isRangeSelection(selection)) return;
			text = selection.getTextContent();
		});

		return text;
	}, [editor]);

	const insertLinkAtSelection = useCallback(
		(payload: InsertLinkPayload) => {
			if (!editor) return;

			editor.update(() => {
				const selection = $getSelection();
				if (!$isRangeSelection(selection)) return;

				const selectionText = selection.getTextContent();
				const finalText = payload.text.length > 0 ? payload.text : selectionText;
				if (!finalText.trim()) return;

				const linkNode = $createAccessibleLinkNode(payload.url, {
					target: "_blank",
					rel: "noopener noreferrer",
					ariaLabel: payload.ariaLabel || selectionText || finalText,
					qrCode: payload.qrCode,
					add: payload.add || null,
					text: finalText
				});

				const textNode = $createTextNode(finalText);
				linkNode.append(textNode);
				selection.insertNodes([linkNode]);
			});

			requestAnimationFrame(() => {
				editor.focus();
			});
		},
		[editor]
	);

	const handleAddLink = useCallback(
		(url: string, text: string, add: string, ariaLabel: string, showQrCode: boolean) => {
			insertLinkAtSelection({
				url,
				text,
				add,
				ariaLabel,
				qrCode: showQrCode
			});
		},
		[insertLinkAtSelection]
	);

	const handleAddLocalLink = useCallback(
		(url: string, caption: string) => {
			insertLinkAtSelection({
				url,
				text: caption,
				add: "",
				ariaLabel: "Внутренняя ссылка на статью: " + caption,
				qrCode: false
			});
		},
		[insertLinkAtSelection]
	);

	const getSelectedLinkState = useCallback((): LinkType => {
		if (!editor) return "";

		let state: LinkType = "";
		editor.getEditorState().read(() => {
			const selection = $getSelection();
			if (!$isRangeSelection(selection)) {
				state = "";
				return;
			}

			const selectionText = selection.getTextContent();
			const anchorNode = selection.anchor.getNode();
			const linkNode = $findMatchingParent(anchorNode, (node) => $isAccessibleLinkNode(node) || $isLinkNode(node));

			if ($isAccessibleLinkNode(linkNode)) {
				state = {
					url: linkNode.getURL(),
					ariaLabel: linkNode.getAriaLabel() || "",
					text: linkNode.getText() || selectionText,
					add: linkNode.getAdd() || "",
					qrCode: linkNode.getQrCode()
				};
				return;
			}

			if ($isLinkNode(linkNode)) {
				state = {
					url: linkNode.getURL(),
					ariaLabel: "",
					text: selectionText,
					add: "",
					qrCode: false
				};
				return;
			}

			state = selectionText;
		});

		return state;
	}, [editor]);

	const handleLinkClick = useCallback(
		(type: LinkTypes) => {
			if (type === LinkTypes.LOCAL_LINK && !hasLocalLinkDialog) {
				return;
			}

			onOpenLinkDialog(type);
		},
		[hasLocalLinkDialog, onOpenLinkDialog]
	);

	const insertSemanticTagAtSelection = useCallback(
		(tag: string, text: string, attributes: Record<string, string>) => {
			if (!editor) return;

			editor.update(() => {
				const selection = $getSelection();
				if (!$isRangeSelection(selection)) return;

				const selectionText = selection.getTextContent().trim();
				const finalText =
					text || selectionText || attributes["title"] || attributes["aria-label"] || Object.values(attributes).join(" ") || tag;

				if (!finalText.trim()) return;

				const node = $createSemanticTagNode(tag, attributes, finalText);
				node.append($createTextNode(finalText));
				selection.insertNodes([node]);
			});

			requestAnimationFrame(() => {
				editor.focus();
			});
		},
		[editor]
	);

	const handleCleanSemanticTag = useCallback(() => {
		if (!editor) return;

		editor.update(() => {
			const selection = $getSelection();
			if (!$isRangeSelection(selection) || selection.isCollapsed()) return;

			const selectedNodes = selection.getNodes();
			const semanticNodes = new Set<SemanticTagNode>();

			selectedNodes.forEach((node) => {
				let current: LexicalNode | null = node;
				while (current) {
					if ($isSemanticTagNode(current)) {
						semanticNodes.add(current);
					}
					current = current.getParent();
				}
			});

			const sortedNodes = Array.from(semanticNodes).sort((a, b) => getSemanticTagDepth(b) - getSemanticTagDepth(a));
			sortedNodes.forEach((node) => {
				if (!node.isAttached()) return;
				const children = node.getChildren();
				children.forEach((child) => node.insertBefore(child));
				node.remove();
			});
		});
	}, [editor]);

	const handleTagClick = useCallback(
		(type: TagTypes) => {
			onOpenTagDialog(type);
		},
		[onOpenTagDialog]
	);

	return {
		handleAddLink,
		handleAddLocalLink,
		handleAlignmentChange,
		handleBlockStyleToggle,
		handleCleanSemanticTag,
		handleInlineStyleToggle,
		handleLinkClick,
		handleRedo,
		handleTagClick,
		handleUndo,
		getCurrentSelectionText,
		getSelectedLinkState,
		insertSemanticTagAtSelection
	};
}
