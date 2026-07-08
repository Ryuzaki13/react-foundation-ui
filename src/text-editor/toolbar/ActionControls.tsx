import { Save } from "lucide-react";

import ToolbarStyle from "./Toolbar.module.scss";
import { ToolbarControl } from "./ToolbarControl";

interface ActionControlsProps {
	onChange?: () => void;
}

/**
 * Группа базовых действий тулбара текстового редактора. Содержит переключатели форматирования для повседневного редактирования.
 */
export function ActionControls({ onChange }: ActionControlsProps) {
	return (
		<div className={ToolbarStyle.groupControls}>
			<ToolbarControl title={"Сохранить текущее состояние"} icon={<Save />} onClick={onChange} />
		</div>
	);
}
