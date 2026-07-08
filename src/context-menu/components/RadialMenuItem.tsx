import React, { useCallback } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "../ContextMenu.module.scss";

import { useMenuContext } from "./MenuContext";

export interface RadialMenuItemProps {
	children: React.ReactNode;
	icon?: React.ReactNode;
	className?: string;
	disabled?: boolean;
	closeOnSelect?: boolean;
	onSelect?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const RadialMenuItem: React.FC<RadialMenuItemProps> = ({ children, icon, className, disabled, closeOnSelect = true, onSelect }) => {
	const { closeMenu } = useMenuContext();

	const handleClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			if (disabled) {
				event.preventDefault();
				event.stopPropagation();
				return;
			}

			onSelect?.(event);
			if (event.defaultPrevented) return;

			if (closeOnSelect) {
				closeMenu();
			}
		},
		[disabled, onSelect, closeOnSelect, closeMenu]
	);

	return (
		<button
			type="button"
			role="menuitem"
			tabIndex={-1}
			disabled={disabled}
			aria-disabled={disabled}
			data-menu-item="true"
			data-disabled={disabled ? "true" : undefined}
			data-ui="radial-menu-item"
			data-action="select-radial-menu-item"
			className={cn(styles.radialItem, className)}
			onClick={handleClick}>
			{icon && <span className={styles.radialItemIcon}>{icon}</span>}
			<span className={styles.radialItemText}>{children}</span>
		</button>
	);
};
