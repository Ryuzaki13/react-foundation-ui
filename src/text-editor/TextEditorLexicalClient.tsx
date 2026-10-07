import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

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

import { type TextEditorCoreProps, isLexicalTextRaw } from "./editorModel";
import { SelectionStatePlugin } from "./lexical/plugins";
import { TextEditorCompactCaretScrollPlugin } from "./lexical/plugins/TextEditorCompactCaretScrollPlugin";
import { TextEditorInitialFocusPlugin } from "./lexical/plugins/TextEditorInitialFocusPlugin";
import { TextEditorLifecyclePlugin } from "./lexical/plugins/TextEditorLifecyclePlugin";
import { createLexicalRaw } from "./lib/serialization/createLexicalRaw";
import { initializeTextEditorHtml } from "./lib/serialization/initializeTextEditorHtml";
import { createTextEditorHistory } from "./model/createTextEditorHistory";
import { createTextEditorLifecycle } from "./model/createTextEditorLifecycle";
import { DEFAULT_TOOLBAR_STATE, type LexicalToolbarState } from "./model/textEditorTypes";
import { AccessibleLinkNode } from "./nodes/AccessibleLinkNode";
import { SemanticTagNode } from "./nodes/SemanticTagNode";
import styles from "./TextEditor.module.scss";
import "./TextEditor.scss";
import { TextEditorInteractions } from "./TextEditorInteractions";

type TextEditorLexicalClientProps = TextEditorCoreProps;

/**
 * Редактор форматированного текста на базе Lexical. Поддерживает тулбар, бизнес-адаптеры и сериализацию контента в единый формат данных.
 */
export function TextEditorLexicalClient({
	initialData,
	onChange,
	toolbarComponents,
	businessAdapters,
	editableProps,
	externalLinkOptions,
	readOnly = false,
	autoFocus = false,
	ref,
	presentation = "document",
	placeholder
}: TextEditorLexicalClientProps) {
	const [isFocused, setIsFocused] = useState(false);
	const [toolbarState, setToolbarState] = useState<LexicalToolbarState>(DEFAULT_TOOLBAR_STATE);
	const [lifecycle] = useState(createTextEditorLifecycle);
	const [history] = useState(createTextEditorHistory);
	const generation = useSyncExternalStore(lifecycle.subscribe, lifecycle.getSnapshot, lifecycle.getSnapshot);

	const lexicalRaw = isLexicalTextRaw(initialData?.raw) ? initialData.raw : null;

	const initialEditorState = useMemo(() => {
		if (lexicalRaw) return JSON.stringify(lexicalRaw.editorState);
		// HTML инициализируется в самом Composer до публикации imperative ref.
		// Поздний effect больше не может восстановить исходный текст после clear.
		return (editor: LexicalEditor) => initializeTextEditorHtml(editor, initialData.html);
	}, [initialData.html, lexicalRaw]);

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

	const initialConfig = useMemo(
		() => ({
			editable: !readOnly,
			namespace: "TextEditorLexical",
			onError: handleError,
			theme: {
				paragraph: "paragraph",
				text: {
					code: styles.lexicalTextCode,
					highlight: styles.lexicalTextHighlight,
					underline: styles.lexicalTextUnderline,
					strikethrough: styles.lexicalTextStrikethrough
				}
			},
			nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, AccessibleLinkNode, SemanticTagNode],
			editorState: initialEditorState
		}),
		[handleError, initialEditorState, readOnly]
	);

	return (
		<div className={styles.textEditor}>
			<div
				className={cn(styles.textEditorContent, {
					[styles.focused]: isFocused,
					[styles.compact]: presentation === "compact"
				})}>
				<LexicalComposer initialConfig={initialConfig}>
					<TextEditorInteractions
						key={`${generation}:${readOnly}`}
						lifecycle={lifecycle}
						generation={generation}
						readOnly={readOnly}
						presentation={presentation}
						businessAdapters={businessAdapters}
						externalLinkOptions={externalLinkOptions}
						toolbarComponents={toolbarComponents}
						state={toolbarState}
					/>
					<RichTextPlugin
						contentEditable={
							<ContentEditable
								id={editableProps?.id}
								aria-label={editableProps?.["aria-label"]}
								aria-labelledby={editableProps?.["aria-labelledby"]}
								aria-describedby={editableProps?.["aria-describedby"]}
								aria-invalid={editableProps?.["aria-invalid"]}
								aria-required={editableProps?.["aria-required"]}
								className={cn(
									styles.lexicalEditorContentEditable,
									"scrollableY",
									presentation === "compact" && styles.compactEditable
								)}
								onFocus={() => setIsFocused(true)}
								onBlur={() => setIsFocused(false)}
							/>
						}
						placeholder={placeholder ? <div className={styles.lexicalEditorPlaceholder}>{placeholder}</div> : null}
						ErrorBoundary={LexicalErrorBoundary}
					/>
					<HistoryPlugin externalHistoryState={history.state} />
					{presentation === "compact" && <TextEditorCompactCaretScrollPlugin />}
					<ListPlugin />
					<SelectionStatePlugin onStateChange={setToolbarState} />
					<OnChangePlugin onChange={handleChange} ignoreSelectionChange />
					<TextEditorLifecyclePlugin lifecycle={lifecycle} history={history} readOnly={readOnly} editorRef={ref} />
					<TextEditorInitialFocusPlugin autoFocus={autoFocus} readOnly={readOnly} />
				</LexicalComposer>
			</div>
		</div>
	);
}
