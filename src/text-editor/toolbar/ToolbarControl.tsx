import { type MouseEvent, type ReactNode } from "react";

import { Button } from "../../button";

type ToolbarControlProps = {
	isActive?: boolean;
	onClick?: (style: string) => void;
	title?: string;
	style?: string;
	disabled?: boolean;
	icon?: ReactNode;
};

/**
 * Унифицированная кнопка действия в тулбаре текстового редактора. Отвечает за активное состояние, disabled-режим и визуальное представление иконки.
 */
export function ToolbarControl({ isActive, disabled, style, title, icon, onClick }: ToolbarControlProps) {
	const handleMouseDown = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		onClick?.(style || "");
	};

	return (
		<Button
			title={title}
			disabled={disabled}
			appearance="outline"
			tone={isActive ? "info" : undefined}
			onMouseDown={handleMouseDown}
			icon={icon}
		/>
	);
}
