import React, { useCallback } from "react";

import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";

import { useClickOutside, useEscapeDismiss, useOverlayFocus } from "@ryuzaki13/react-foundation-lib/dom";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "../ContextMenu.module.scss";

import { useMenuContext } from "./MenuContext";

export interface MenuContentProps {
	children: React.ReactNode | ((ctx: { closeMenu: () => void }) => React.ReactNode);
	className?: string;
	closeOnOutside?: boolean;
	closeOnEscape?: boolean;
	disableOutsideClick?: boolean;
	restoreFocus?: boolean;
}

export const MenuContent: React.FC<MenuContentProps> = ({
	children,
	className,
	closeOnOutside = true,
	closeOnEscape = true,
	disableOutsideClick = false,
	restoreFocus = true
}) => {
	const { open, floatingStyles, floatingRef, triggerRef, setFloating, closeMenu } = useMenuContext();

	const getNavigableItems = useCallback(() => {
		const floatingElement = floatingRef.current;
		if (!floatingElement) return [];

		return Array.from(floatingElement.querySelectorAll<HTMLElement>('[data-menu-item="true"]:not([data-disabled="true"])'));
	}, [floatingRef]);

	useOverlayFocus<HTMLElement>({
		active: open,
		initialFocus: (container) => getNavigableItems()[0] ?? container,
		restoreFocus,
		restoreFocusTarget: () => triggerRef.current,
		containerRef: floatingRef
	});

	useEscapeDismiss({
		active: open,
		enabled: closeOnEscape,
		onDismiss: closeMenu,
		containerRef: floatingRef
	});

	const outsideClose = useCallback(() => {
		if (!open || disableOutsideClick) return;
		if (closeOnOutside) {
			closeMenu();
		}
	}, [open, disableOutsideClick, closeOnOutside, closeMenu]);

	useClickOutside([floatingRef as React.RefObject<HTMLElement>, triggerRef as React.RefObject<HTMLElement>], outsideClose);

	const onMenuKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLElement>) => {
			const items = getNavigableItems();
			if (items.length === 0) {
				return;
			}

			const activeElement = document.activeElement as HTMLElement | null;
			const currentIndex = activeElement ? items.indexOf(activeElement) : -1;

			if (event.key === "ArrowDown") {
				event.preventDefault();
				const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % items.length : 0;
				items[nextIndex]?.focus();
				return;
			}

			if (event.key === "ArrowUp") {
				event.preventDefault();
				const nextIndex = currentIndex >= 0 ? (currentIndex - 1 + items.length) % items.length : items.length - 1;
				items[nextIndex]?.focus();
				return;
			}

			if (event.key === "Home") {
				event.preventDefault();
				items[0]?.focus();
				return;
			}

			if (event.key === "End") {
				event.preventDefault();
				items[items.length - 1]?.focus();
			}
		},
		[getNavigableItems]
	);

	if (typeof document === "undefined") return null;

	return createPortal(
		<AnimatePresence>
			{open && (
				<motion.div
					ref={setFloating}
					style={floatingStyles}
					role="menu"
					tabIndex={-1}
					className={cn(styles.menuPanel, className)}
					onKeyDown={onMenuKeyDown}
					initial={{ opacity: 0, scale: 0.96, y: -2 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.96, y: -2 }}
					transition={{ duration: 0.14, ease: "easeOut" }}>
					<div className={cn(styles.menuScroller, "scrollable")}>
						{typeof children === "function" ? children({ closeMenu }) : children}
					</div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body
	);
};
