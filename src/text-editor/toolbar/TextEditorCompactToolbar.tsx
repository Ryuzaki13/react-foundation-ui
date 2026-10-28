import { type KeyboardEvent, useId, useRef } from "react";

import { TextCursorInput } from "lucide-react";

import { Button } from "../../button";
import { useCompactTextEditorToolbar } from "../model/useCompactTextEditorToolbar";

import { TextEditorToolbarLexical, type TextEditorToolbarLexicalProps } from "./TextEditorToolbarLexical";
import styles from "./Toolbar.module.scss";

type TextEditorCompactToolbarProps = TextEditorToolbarLexicalProps & Readonly<{ canEdit: () => boolean }>;

/** Кнопка остаётся слева от поля; раскрытые инструменты занимают отдельную строку над ними. */
export function TextEditorCompactToolbar({ state, canEdit, ...props }: TextEditorCompactToolbarProps) {
	const panel = useCompactTextEditorToolbar(canEdit);
	const panelId = useId();
	const toggleRef = useRef<HTMLButtonElement>(null);
	const closeOnEscape = (event: KeyboardEvent<HTMLElement>) => {
		if (event.key !== "Escape" || !panel.open) return;

		event.preventDefault();
		event.stopPropagation();
		panel.onOpenChange(false);
		toggleRef.current?.focus({ preventScroll: true });
	};

	return (
		<>
			<Button
				ref={toggleRef}
				className={styles.compactToolbar}
				data-action="toggle-text-editor-formatting"
				disabled={props.disabled}
				title="Форматирование"
				appearance={panel.open ? "solid" : "ghost"}
				tone={panel.open ? "accent" : "neutral"}
				icon={<TextCursorInput />}
				aria-expanded={panel.open}
				aria-controls={panelId}
				onKeyDownCapture={closeOnEscape}
				onMouseDown={(event) => event.preventDefault()}
				onClick={() => panel.onOpenChange(!panel.open)}
			/>
			{panel.open && (
				<div
					id={panelId}
					className={styles.compactPanel}
					role="group"
					aria-label="Форматирование текста"
					onKeyDownCapture={closeOnEscape}>
					<TextEditorToolbarLexical
						{...props}
						state={panel.state ?? state}
						onBlockStyleToggle={(style) => panel.runCommand(() => props.onBlockStyleToggle(style))}
						onInlineStyleToggle={(style) => panel.runCommand(() => props.onInlineStyleToggle(style))}
						onAlignmentChange={(alignment) => panel.runCommand(() => props.onAlignmentChange(alignment))}
						onLinkClick={(type) => panel.runCommand(() => props.onLinkClick(type), "dialog")}
						onTagClick={(type) => panel.runCommand(() => props.onTagClick(type), "dialog")}
						onUndo={() => panel.runCommand(props.onUndo)}
						onRedo={() => panel.runCommand(props.onRedo)}
						onCleanTag={() => panel.runCommand(() => props.onCleanTag?.())}
					/>
				</div>
			)}
		</>
	);
}
