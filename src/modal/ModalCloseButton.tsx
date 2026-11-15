import { X } from "lucide-react";

import { Button } from "../button";
import { UI_APPEARANCE_GHOST } from "../uiSchemeConstants";

type ModalCloseButtonProps = {
	className?: string;
	onClose: () => void;
};

/** Даёт обоим видам модального окна одинаковую кнопку и доступное имя действия. */
export function ModalCloseButton({ className, onClose }: ModalCloseButtonProps) {
	return (
		<Button icon={<X />} appearance={UI_APPEARANCE_GHOST} className={className} aria-label="Закрыть модальное окно" onClick={onClose} />
	);
}
