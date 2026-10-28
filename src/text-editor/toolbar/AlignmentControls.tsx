import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from "lucide-react";

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
				isActive={activeAlignment === "left"}
				onClick={() => onAlignmentChange("left")}
			/>
			<ToolbarControl
				disabled={disabled}
				title="По центру"
				icon={<AlignCenter />}
				isActive={activeAlignment === "center"}
				onClick={() => onAlignmentChange("center")}
			/>
			<ToolbarControl
				disabled={disabled}
				title="По правому краю"
				icon={<AlignRight />}
				isActive={activeAlignment === "right"}
				onClick={() => onAlignmentChange("right")}
			/>
			<ToolbarControl
				disabled={disabled}
				title="По ширине"
				icon={<AlignJustify />}
				isActive={activeAlignment === "justify"}
				onClick={() => onAlignmentChange("justify")}
			/>
		</>
	);
}
