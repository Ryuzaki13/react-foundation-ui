import React, { type HTMLAttributeAnchorTarget, useCallback } from "react";

import { OptionButton, OptionLink } from "../../option";

import { useMenuContext } from "./MenuContext";

export interface MenuItemProps {
	children: React.ReactNode;
	icon?: React.ReactNode;
	hotKey?: string;
	className?: string;
	disabled?: boolean;
	href?: string;
	target?: HTMLAttributeAnchorTarget;
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

	if (href) {
		return (
			<OptionLink
				icon={icon}
				hotkey={hotKey}
				text={children}
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
				className={className}
				onClick={handleClick as React.MouseEventHandler<HTMLAnchorElement>}
			/>
		);
	}

	return (
		<OptionButton
			icon={icon}
			hotkey={hotKey}
			text={children}
			role="menuitem"
			tabIndex={-1}
			disabled={disabled}
			data-menu-item="true"
			data-disabled={disabled ? "true" : undefined}
			data-ui="context-menu-item"
			data-action="select-context-menu-item"
			className={className}
			onClick={handleClick as React.MouseEventHandler<HTMLButtonElement>}
		/>
	);
};
