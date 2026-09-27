import { TextCursorInput } from "lucide-react";

import { Button } from "../../button";
import { Popover } from "../../popover";
import { useCompactTextEditorToolbar } from "../model/useCompactTextEditorToolbar";

import { TextEditorToolbarLexical, type TextEditorToolbarLexicalProps } from "./TextEditorToolbarLexical";
import styles from "./Toolbar.module.scss";

type TextEditorCompactToolbarProps = TextEditorToolbarLexicalProps & Readonly<{ canEdit: () => boolean }>;

/** Один вход в прежние команды: компактность не уменьшает touch-target и не меняет профиль raw. */
export function TextEditorCompactToolbar({ state, canEdit, ...props }: TextEditorCompactToolbarProps) {
	const panel = useCompactTextEditorToolbar(canEdit);

	return (
		<div className={styles.compactToolbar}>
			<Popover open={panel.open} onOpenChange={panel.onOpenChange} placement="top-start">
				<Popover.Trigger>
					<Button
						data-action="toggle-text-editor-formatting"
						disabled={props.disabled}
						appearance="ghost"
						icon={<TextCursorInput />}
						onMouseDown={(event) => event.preventDefault()}>
						Форматирование
					</Button>
				</Popover.Trigger>
				<Popover.Content role="group" aria-label="Форматирование текста">
					<div className={styles.compactPanel}>
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
				</Popover.Content>
			</Popover>
		</div>
	);
}
