import { useCallback, useRef, useState } from "react";

import { $isLinkNode } from "@lexical/link";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from "@lexical/list";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
	$createParagraphNode,
	$createTextNode,
	$getSelection,
	$getNodeByKey,
	$isRangeSelection,
	type ElementFormatType,
	FORMAT_ELEMENT_COMMAND,
	FORMAT_TEXT_COMMAND,
	HISTORY_MERGE_TAG,
	HISTORY_PUSH_TAG,
	type LexicalEditor,
	type LexicalNode,
	type RangeSelection,
	REDO_COMMAND,
	SKIP_DOM_SELECTION_TAG,
	UNDO_COMMAND
} from "lexical";

import { $findSelectedInlineNode } from "../../lib/selection/findSelectedInlineNode";
import { $restoreEditorDialogSelection } from "../../lib/selection/restoreEditorDialogSelection";
import { getSemanticTagDepth } from "../../lib/semantic/getSemanticTagDepth";
import { getHeadingTagByStyle, getLexicalInlineStyle } from "../../lib/toolbar/styleMappers";
import { $createAccessibleLinkNode, $isAccessibleLinkNode } from "../../nodes/AccessibleLinkNode";
import { $createSemanticTagNode, $isSemanticTagNode, type SemanticTagNode } from "../../nodes/SemanticTagNode";
import { LinkTypes, TagTypes } from "../../toolbar";
import { type SemanticDialogState } from "../semanticDialogState";
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
	// Snapshot принадлежит одной сессии ссылки и конкретному editor, не внешнему
	// каталогу. Каждое открытие заменяет его, в том числе после отмены диалога.
	const linkSelectionRef = useRef<{ editor: LexicalEditor; selection: RangeSelection | null; key: string | null; local: boolean } | null>(
		null
	);
	const semanticSelectionRef = useRef<{ editor: LexicalEditor; selection: RangeSelection | null; key: string | null } | null>(null);
	const [linkDialogState, setLinkDialogState] = useState<LinkType>("");
	const [semanticDialogState, setSemanticDialogState] = useState<SemanticDialogState>({ text: "", attributes: {} });
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

	const insertLinkAtSelection = useCallback(
		(payload: InsertLinkPayload) => {
			if (!editor) return;

			const snapshot = linkSelectionRef.current;
			linkSelectionRef.current = null;
			// Отдельный selection-only commit создаёт baseline HistoryPlugin даже
			// до первого ввода. Вставка затем отменяется одним undo и не сливается
			// с предыдущим набором текста; фокус передаём только после закрытия диалога.
			editor.update(
				() => {
					$restoreEditorDialogSelection(snapshot?.editor === editor ? snapshot.selection : null);
				},
				{ discrete: true, tag: [HISTORY_MERGE_TAG, SKIP_DOM_SELECTION_TAG] }
			);
			editor.update(
				() => {
					const selection = $getSelection();
					if (!$isRangeSelection(selection)) return;
					const existing = snapshot?.editor === editor && snapshot.key ? $getNodeByKey(snapshot.key) : null;
					if ($isAccessibleLinkNode(existing) && existing.isAttached()) {
						existing
							.setURL(payload.url)
							.setAriaLabel(payload.ariaLabel)
							.setQrCode(payload.qrCode)
							.setAdd(payload.add || null);
						// Изменение адреса не стирает rich-text дочерних узлов.
						if (snapshot?.local && payload.text !== existing.getTextContent())
							existing.clear().append($createTextNode(payload.text));
						existing.setText(existing.getTextContent());
						existing.selectEnd();
						return;
					}
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
				},
				{ tag: HISTORY_PUSH_TAG }
			);

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

	const readSelectedLinkState = useCallback((): LinkType => {
		if (!editor) return "";

		let state: LinkType = "";
		editor.getEditorState().read(() => {
			const selection = $getSelection();
			if (!$isRangeSelection(selection)) {
				state = "";
				return;
			}

			const selectionText = selection.getTextContent();
			const linkNode = $findSelectedInlineNode($isLinkNode);

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
			if (!editor) return;
			editor.getEditorState().read(() => {
				const selection = $getSelection();
				linkSelectionRef.current = {
					editor,
					selection: $isRangeSelection(selection) ? selection.clone() : null,
					key: $findSelectedInlineNode($isAccessibleLinkNode)?.getKey() ?? null,
					local: type === LinkTypes.LOCAL_LINK
				};
			});
			setLinkDialogState(readSelectedLinkState());
			onOpenLinkDialog(type);
		},
		[editor, hasLocalLinkDialog, onOpenLinkDialog, readSelectedLinkState]
	);

	const insertSemanticTagAtSelection = useCallback(
		(tag: string, text: string, attributes: Record<string, string>) => {
			if (!editor) return;
			const snapshot = semanticSelectionRef.current;
			semanticSelectionRef.current = null;
			editor.update(
				() => {
					$restoreEditorDialogSelection(snapshot?.editor === editor ? snapshot.selection : null);
				},
				{ discrete: true, tag: [HISTORY_MERGE_TAG, SKIP_DOM_SELECTION_TAG] }
			);
			editor.update(
				() => {
					const selection = $getSelection();
					if (!$isRangeSelection(selection) || !text.trim()) return;
					const existing = snapshot?.editor === editor && snapshot.key ? $getNodeByKey(snapshot.key) : null;
					if ($isSemanticTagNode(existing) && existing.isAttached() && existing.getTag() === tag) {
						existing.setAttributes(attributes).setText(text);
						if (text !== existing.getTextContent()) existing.clear().append($createTextNode(text));
						existing.selectEnd();
					} else {
						const node = $createSemanticTagNode(tag, attributes, text);
						const content = $createTextNode(text);
						content.setFormat(selection.format).setStyle(selection.style);
						node.append(content);
						selection.insertNodes([node]);
					}
				},
				{ tag: HISTORY_PUSH_TAG }
			);
			requestAnimationFrame(() => editor.focus());
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
			if (!editor) return;
			editor.getEditorState().read(() => {
				const selection = $getSelection();
				const node = $findSelectedInlineNode($isSemanticTagNode);
				const matching = node?.getTag() === (type === TagTypes.lang ? "span" : type) ? node : null;
				semanticSelectionRef.current = {
					editor,
					selection: $isRangeSelection(selection) ? selection.clone() : null,
					key: matching?.getKey() ?? null
				};
				setSemanticDialogState({
					text: matching?.getTextContent() ?? ($isRangeSelection(selection) ? selection.getTextContent() : ""),
					attributes: { ...matching?.getAttributes() }
				});
			});
			onOpenTagDialog(type);
		},
		[editor, onOpenTagDialog]
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
		semanticDialogState,
		linkDialogState,
		insertSemanticTagAtSelection
	};
}
