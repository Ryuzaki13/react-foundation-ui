import React, { useCallback } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../../ui.module.scss";
import styles from "../ContextMenu.module.scss";

import { useMenuContext } from "./MenuContext";

export interface MenuItemProps {
	children: React.ReactNode;
	icon?: React.ReactNode;
	hotKey?: string;
	className?: string;
	disabled?: boolean;
	href?: string;
	target?: string;
	rel?: string;
	closeOnSelect?: boolean;
	onSelect?: (event: React.MouseEvent<HTMLElement>) => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({
	children,
	icon,
	hotKey,
	className,
	disabled,
	href,
	target,
	rel,
	closeOnSelect = true,
	onSelect
}) => {
	const { closeMenu } = useMenuContext();

	const handleClick = useCallback(
		(event: React.MouseEvent<HTMLElement>) => {
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

	const rootClassName = cn(uiStyles.uiPopupOption, styles.menuItem, className);

	if (href) {
		return (
			<a
				href={href}
				target={target}
				rel={rel}
				role="menuitem"
				tabIndex={-1}
				aria-disabled={disabled}
				data-menu-item="true"
				data-disabled={disabled ? "true" : undefined}
				data-ui="context-menu-item"
				data-action="select-context-menu-item"
				className={rootClassName}
				onClick={handleClick as React.MouseEventHandler<HTMLAnchorElement>}>
				{icon && <span className={cn(uiStyles.uiPopupOptionIcon, styles.menuItemIcon)}>{icon}</span>}
				<span className={cn(uiStyles.uiOptionText, styles.menuItemText)}>{children}</span>
				{hotKey && <kbd className={cn(uiStyles.keyboard, styles.menuItemHotKey)}>{hotKey}</kbd>}
			</a>
		);
	}

	return (
		<button
			type="button"
			role="menuitem"
			tabIndex={-1}
			disabled={disabled}
			data-menu-item="true"
			data-disabled={disabled ? "true" : undefined}
			data-ui="context-menu-item"
			data-action="select-context-menu-item"
			className={rootClassName}
			onClick={handleClick as React.MouseEventHandler<HTMLButtonElement>}>
			{icon && <span className={cn(uiStyles.uiPopupOptionIcon, styles.menuItemIcon)}>{icon}</span>}
			<span className={cn(uiStyles.uiOptionText, styles.menuItemText)}>{children}</span>
			{hotKey && <kbd className={cn(uiStyles.keyboard, styles.menuItemHotKey)}>{hotKey}</kbd>}
		</button>
	);
};
