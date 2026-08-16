import { type HTMLAttributeAnchorTarget, type MouseEvent, type ReactNode, useCallback } from "react";

import { Option, OptionButton, OptionLink } from "../../option";

import { useMenuContext } from "./MenuContext";

export interface MenuItemProps {
	children: string;
	icon?: ReactNode;
	hotKey?: string;
	className?: string;
	disabled?: boolean;
	href?: string;
	target?: HTMLAttributeAnchorTarget;
	rel?: string;
	closeOnSelect?: boolean;
	onSelect?: (event: MouseEvent<HTMLElement>) => void;
}

export function MenuItem({
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
}: MenuItemProps) {
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
			<Option disabled={disabled} className={className}>
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
					onClick={handleClick as React.MouseEventHandler<HTMLAnchorElement>}
				/>
			</Option>
		);
	}

	return (
		<Option disabled={disabled} className={className}>
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
				onClick={handleClick as React.MouseEventHandler<HTMLButtonElement>}
			/>
		</Option>
	);
}
