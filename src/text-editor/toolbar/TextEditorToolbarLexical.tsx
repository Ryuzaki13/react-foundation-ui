import { BrushCleaning } from "lucide-react";

import { AlignmentControls } from "./AlignmentControls";
import { HistoryControls } from "./HistoryControls";
import { LinkButtons } from "./LinkButtons";
import { TagButtons } from "./TagButtons";
import ToolbarStyle from "./Toolbar.module.scss";
import { ToolbarControl } from "./ToolbarControl";
import { LinkTypes, TagTypes, TextEditorBlockControls, TextEditorInlineControls } from "./types";

import type { TextEditorToolbarComponents } from "../editorModel";
import type { LexicalToolbarState, TextAlignment } from "../model/textEditorTypes";

interface TextEditorToolbarLexicalProps {
	toolbarComponents?: TextEditorToolbarComponents;
	state: LexicalToolbarState;
	onBlockStyleToggle: (style: string) => void;
	onInlineStyleToggle: (style: string) => void;
	onAlignmentChange: (alignment: TextAlignment) => void;
	onLinkClick: (type: LinkTypes) => void;
	onTagClick: (type: TagTypes) => void;
	onUndo: () => void;
	onRedo: () => void;
	onCleanTag?: () => void;
}

/**
 * Основная панель инструментов редактора Lexical. Собирает управляющие блоки и синхронизирует их с текущим состоянием выделения.
 */
export function TextEditorToolbarLexical({
	toolbarComponents,
	state,
	onBlockStyleToggle,
	onInlineStyleToggle,
	onAlignmentChange,
	onLinkClick,
	onTagClick,
	onUndo,
	onRedo,
	onCleanTag
}: TextEditorToolbarLexicalProps) {
	const components = { history: true, ...(toolbarComponents || {}) };

	return (
		<div className={ToolbarStyle.toolbar}>
			{components.blocks && (
				<>
					<div className={ToolbarStyle.groupControls}>
						{TextEditorBlockControls.map((control) => (
							<ToolbarControl
								key={control.style}
								isActive={control.style === state.blockType}
								style={control.style}
								title={control.label}
								icon={control.icon}
								onClick={onBlockStyleToggle}
							/>
						))}
					</div>
					<hr />
				</>
			)}

			{components.inline && (
				<>
					<div className={ToolbarStyle.groupControls}>
						{TextEditorInlineControls.map((control) => (
							<ToolbarControl
								key={control.style}
								isActive={!!state.activeInlineStyles[control.style as keyof typeof state.activeInlineStyles]}
								title={control.label}
								style={control.style}
								icon={control.icon}
								disabled={state.isTextUnselected}
								onClick={onInlineStyleToggle}
							/>
						))}
					</div>
					<hr />
				</>
			)}

			{components.alignment && (
				<>
					<AlignmentControls activeAlignment={state.activeAlignment} onAlignmentChange={onAlignmentChange} />
					<hr />
				</>
			)}

			{components.links && (
				<>
					<LinkButtons disabled={state.isTextUnselected} onClick={onLinkClick} />
					<hr />
				</>
			)}

			{components.tags && (
				<>
					<TagButtons onClick={onTagClick} />
					<hr />
				</>
			)}

			{components.history && (
				<>
					<HistoryControls onUndo={onUndo} onRedo={onRedo} />
					<hr />
				</>
			)}

			<ToolbarControl
				disabled={state.isTextUnselected}
				title="Очистить выбранный тег"
				icon={<BrushCleaning />}
				onClick={onCleanTag}
			/>
		</div>
	);
}
