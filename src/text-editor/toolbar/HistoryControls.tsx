import { Redo, Undo } from "lucide-react";

import ToolbarStyle from "./Toolbar.module.scss";
import { ToolbarControl } from "./ToolbarControl";

interface HistoryControlsProps {
	disabled?: boolean;
	onUndo: () => void;
	onRedo: () => void;
}

/**
 * Кнопки отмены и повтора действий для текстового редактора. Отвечают за работу с историей изменений документа.
 */
export function HistoryControls({ onUndo, onRedo, disabled }: HistoryControlsProps) {
	return (
		<div className={ToolbarStyle.groupControls}>
			<ToolbarControl disabled={disabled} style="undo" title="Отменить последнее действие" icon={<Undo />} onClick={onUndo} />
			<ToolbarControl disabled={disabled} style="redo" title="Повторить предыдущее действие" icon={<Redo />} onClick={onRedo} />
		</div>
	);
}
