import React, { useRef, useState } from "react";

import { XIcon } from "lucide-react";

import { UI_APPEARANCE_OUTLINE, UI_APPEARANCE_SOLID, UI_TONE_ERROR } from "../uiSchemeConstants";

import { Button } from "./Button";

type ButtonRemoveProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onClick"> & {
	confirmTimeout?: number;
	onConfirm: () => void;
	onPreConfirm?: () => void;
};

/**
 * Специализированная кнопка удаления сущности или вложения. Инкапсулирует подтверждающее поведение перед окончательным вызовом `onRemove`.
 */
export function ButtonRemove({ onPreConfirm, onConfirm, confirmTimeout = 1500, ...props }: ButtonRemoveProps) {
	const [confirmRemove, setConfirmRemove] = useState(false);
	const timeoutRef = useRef<number | null>(null);

	const handleRemoveClick = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();

		if (timeoutRef.current) {
			window.clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		if (confirmRemove) {
			onConfirm();
			setConfirmRemove(false);
		} else {
			onPreConfirm?.();
			setConfirmRemove(true);
			timeoutRef.current = window.setTimeout(() => {
				setConfirmRemove(false);
			}, confirmTimeout);
		}
	};

	return (
		<Button
			{...props}
			icon={<XIcon />}
			onClick={handleRemoveClick}
			tone={UI_TONE_ERROR}
			appearance={confirmRemove ? UI_APPEARANCE_SOLID : UI_APPEARANCE_OUTLINE}
		/>
	);
}
