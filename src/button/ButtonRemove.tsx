import React, { useRef, useState } from "react";

import { XIcon } from "lucide-react";

import { Button } from "./Button";

interface ButtonRemoveProps {
	onRemove: () => void;
	onPreRemove?: () => void;
	className?: string;
}

/**
 * Специализированная кнопка удаления сущности или вложения. Инкапсулирует подтверждающее поведение перед окончательным вызовом `onRemove`.
 */
export function ButtonRemove({ onPreRemove, onRemove, className }: ButtonRemoveProps) {
	const [confirmRemove, setConfirmRemove] = useState(false);
	const timeoutRef = useRef<number | null>(null);

	const handleRemoveClick = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();

		if (timeoutRef.current) {
			window.clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		if (confirmRemove) {
			onRemove();
			setConfirmRemove(false);
		} else {
			onPreRemove?.();
			setConfirmRemove(true);
			timeoutRef.current = window.setTimeout(() => {
				setConfirmRemove(false);
			}, 1500);
		}
	};

	return (
		<Button
			icon={<XIcon />}
			onClick={handleRemoveClick}
			tone="error"
			appearance={confirmRemove ? "solid" : "outline"}
			className={className}
		/>
	);
}
