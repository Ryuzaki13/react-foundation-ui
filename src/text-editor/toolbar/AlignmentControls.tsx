import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from "lucide-react";

import {
	TEXT_EDITOR_ALIGNMENT_LEFT,
	TEXT_EDITOR_ALIGNMENT_CENTER,
	TEXT_EDITOR_ALIGNMENT_RIGHT,
	TEXT_EDITOR_ALIGNMENT_JUSTIFY
} from "../model/textEditorStyleConstants";

import { ToolbarControl } from "./ToolbarControl";

import type { TextAlignment } from "../model/textEditorTypes";

interface AlignmentControlsProps {
	disabled?: boolean;
	onAlignmentChange: (alignment: TextAlignment) => void;
	activeAlignment?: TextAlignment | null;
}

/**
 * Кнопки управления выравниванием содержимого в текстовом редакторе. Используются в тулбаре для смены текстового alignment.
 */
export function AlignmentControls({ onAlignmentChange, activeAlignment, disabled }: AlignmentControlsProps) {
	return (
		<>
			<ToolbarControl
				disabled={disabled}
				title="По левому краю"
				icon={<AlignLeft />}
				isActive={activeAlignment === TEXT_EDITOR_ALIGNMENT_LEFT}
				onClick={() => onAlignmentChange(TEXT_EDITOR_ALIGNMENT_LEFT)}
			/>
			<ToolbarControl
				disabled={disabled}
				title="По центру"
				icon={<AlignCenter />}
				isActive={activeAlignment === TEXT_EDITOR_ALIGNMENT_CENTER}
				onClick={() => onAlignmentChange(TEXT_EDITOR_ALIGNMENT_CENTER)}
			/>
			<ToolbarControl
				disabled={disabled}
				title="По правому краю"
				icon={<AlignRight />}
				isActive={activeAlignment === TEXT_EDITOR_ALIGNMENT_RIGHT}
				onClick={() => onAlignmentChange(TEXT_EDITOR_ALIGNMENT_RIGHT)}
			/>
			<ToolbarControl
				disabled={disabled}
				title="По ширине"
				icon={<AlignJustify />}
				isActive={activeAlignment === TEXT_EDITOR_ALIGNMENT_JUSTIFY}
				onClick={() => onAlignmentChange(TEXT_EDITOR_ALIGNMENT_JUSTIFY)}
			/>
		</>
	);
}
