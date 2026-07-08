import { useCallback, useMemo, useState } from "react";

import { $generateHtmlFromNodes } from "@lexical/html";
import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { type LexicalEditor, type EditorState as LexicalEditorState } from "lexical";

import { TextEditorCoreProps, isLexicalTextRaw } from "./editorModel";
import { InitialHtmlPlugin, SelectionStatePlugin } from "./lexical/plugins";
import { createLexicalRaw } from "./lib/serialization/createLexicalRaw";
import { useTextEditorLexicalActions } from "./model/hooks/useTextEditorLexicalActions";
import { DEFAULT_TOOLBAR_STATE, type LexicalToolbarState } from "./model/textEditorTypes";
import { AccessibleLinkNode } from "./nodes/AccessibleLinkNode";
import { SemanticTagNode } from "./nodes/SemanticTagNode";
import TextEditorStyle from "./TextEditor.module.scss";
import "./TextEditor.scss";
import { TextEditorDialogs } from "./TextEditorDialogs";
import { type LinkTypes, type TagTypes, TextEditorToolbarLexical } from "./toolbar";

type TextEditorProps = TextEditorCoreProps;

/**
 * Редактор форматированного текста на базе Lexical. Поддерживает тулбар, бизнес-адаптеры и сериализацию контента в единый формат данных.
 */
export function TextEditorLexicalClient({ initialData, onChange, toolbarComponents, businessAdapters }: TextEditorProps) {
	const LocalLinkDialogComponent = businessAdapters?.LocalLinkDialogComponent;
	const [isFocused, setIsFocused] = useState(false);
	const [toolbarState, setToolbarState] = useState<LexicalToolbarState>(DEFAULT_TOOLBAR_STATE);
	const [editor, setEditor] = useState<LexicalEditor | null>(null);
	const [linkTypeDialog, setLinkTypeDialog] = useState<LinkTypes | null>(null);
	const [tagTypeDialog, setTagTypeDialog] = useState<TagTypes | null>(null);

	const lexicalRaw = isLexicalTextRaw(initialData?.raw) ? initialData.raw : null;
	const hasLexicalRaw = !!lexicalRaw;

	const initialEditorState = useMemo(() => {
		if (!lexicalRaw) return undefined;
		return JSON.stringify(lexicalRaw.editorState);
	}, [lexicalRaw]);

	const handleError = useCallback((error: Error) => {
		console.error("Ошибка редактора Lexical", error);
	}, []);

	const handleChange = useCallback(
		(editorState: LexicalEditorState, lexicalEditor: LexicalEditor) => {
			let html = "";
			editorState.read(() => {
				html = $generateHtmlFromNodes(lexicalEditor, null);
			});

			const raw = createLexicalRaw(editorState);
			onChange({ raw, html });
		},
		[onChange]
	);

	const openLinkDialog = useCallback((type: LinkTypes) => {
		setLinkTypeDialog(type);
	}, []);

	const openTagDialog = useCallback((type: TagTypes) => {
		setTagTypeDialog(type);
	}, []);

	const actions = useTextEditorLexicalActions({
		editor,
		toolbarState,
		hasLocalLinkDialog: !!LocalLinkDialogComponent,
		onOpenLinkDialog: openLinkDialog,
		onOpenTagDialog: openTagDialog
	});

	const initialConfig = useMemo(
		() => ({
			namespace: "KtkTextEditorLexical",
			onError: handleError,
			theme: {
				paragraph: "paragraph",
				text: {
					code: "lexicalTextCode",
					highlight: "lexicalTextHighlight",
					underline: "lexicalTextUnderline",
					strikethrough: "lexicalTextStrikethrough"
				}
			},
			nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, AccessibleLinkNode, SemanticTagNode],
			editorState: initialEditorState
		}),
		[handleError, initialEditorState]
	);

	return (
		<div className={TextEditorStyle.textEditor}>
			<div
				className={cn(TextEditorStyle.textEditorContent, {
					[TextEditorStyle.focused]: isFocused
				})}>
				<LexicalComposer initialConfig={initialConfig}>
					<TextEditorToolbarLexical
						toolbarComponents={toolbarComponents}
						state={toolbarState}
						onBlockStyleToggle={actions.handleBlockStyleToggle}
						onInlineStyleToggle={actions.handleInlineStyleToggle}
						onAlignmentChange={actions.handleAlignmentChange}
						onLinkClick={actions.handleLinkClick}
						onTagClick={actions.handleTagClick}
						onUndo={actions.handleUndo}
						onRedo={actions.handleRedo}
						onCleanTag={actions.handleCleanSemanticTag}
					/>
					<RichTextPlugin
						contentEditable={
							<ContentEditable
								className="lexicalEditorContentEditable"
								onFocus={() => setIsFocused(true)}
								onBlur={() => setIsFocused(false)}
							/>
						}
						placeholder={<div className="lexicalEditorPlaceholder">Введите текст...</div>}
						ErrorBoundary={LexicalErrorBoundary}
					/>
					<HistoryPlugin />
					<ListPlugin />
					<SelectionStatePlugin onEditorReady={setEditor} onStateChange={setToolbarState} />
					<InitialHtmlPlugin initialHTML={initialData?.html} shouldSkip={hasLexicalRaw} />
					<OnChangePlugin onChange={handleChange} ignoreSelectionChange />
				</LexicalComposer>
			</div>

			<TextEditorDialogs
				linkTypeDialog={linkTypeDialog}
				tagTypeDialog={tagTypeDialog}
				localLinkDialogComponent={LocalLinkDialogComponent}
				onCloseLinkDialog={() => setLinkTypeDialog(null)}
				onCloseTagDialog={() => setTagTypeDialog(null)}
				onAddLink={actions.handleAddLink}
				onAddLocalLink={actions.handleAddLocalLink}
				onInsertSemanticTag={actions.insertSemanticTagAtSelection}
				getCurrentSelectionText={actions.getCurrentSelectionText}
				getSelectedLinkState={actions.getSelectedLinkState}
			/>
		</div>
	);
}
