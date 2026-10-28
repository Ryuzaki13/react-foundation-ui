import { Save } from "lucide-react";

import { ToolbarControl } from "./ToolbarControl";

interface ActionControlsProps {
	onChange?: () => void;
}

/**
 * Группа базовых действий тулбара текстового редактора. Содержит переключатели форматирования для повседневного редактирования.
 */
export function ActionControls({ onChange }: ActionControlsProps) {
	return <ToolbarControl title={"Сохранить текущее состояние"} icon={<Save />} onClick={onChange} />;
}
