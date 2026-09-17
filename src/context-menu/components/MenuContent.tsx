import { type KeyboardEvent, type ReactNode, type RefObject, useCallback, useEffect } from "react";

import { useClickOutside, useEscapeDismiss, useOverlayFocus } from "@ryuzaki13/react-foundation-lib/dom";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";

import { PickerOptions } from "../../picker";
import styles from "../ContextMenu.module.scss";

import { useMenuContext } from "./MenuContext";

export interface MenuContentProps {
	children: ReactNode | ((ctx: { closeMenu: () => void }) => ReactNode);
	className?: string;
	"aria-label"?: string;
	"aria-labelledby"?: string;
	closeOnOutside?: boolean;
	closeOnEscape?: boolean;
	disableOutsideClick?: boolean;
	restoreFocus?: boolean;
}

export function MenuContent({
	children,
	className,
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy,
	closeOnOutside = true,
	closeOnEscape = true,
	disableOutsideClick = false,
	restoreFocus = true
}: MenuContentProps) {
	const {
		open,
		openSource,
		initialFocus,
		menuId,
		triggerId,
		anchorPoint,
		floatingStyles,
		floatingRef,
		triggerRef,
		setFloating,
		closeMenu
	} = useMenuContext();

	const getNavigableItems = useCallback(() => {
		const floatingElement = floatingRef.current;
		if (!floatingElement) return [];

		return Array.from(floatingElement.querySelectorAll<HTMLElement>('[data-menu-item="true"]:not([data-disabled="true"])'));
	}, [floatingRef]);

	useOverlayFocus<HTMLElement>({
		active: open,
		initialFocus: (container) => {
			const items = getNavigableItems();
			return (initialFocus === "last" ? items[items.length - 1] : items[0]) ?? container;
		},
		restoreFocus,
		restoreFocusTarget: () => triggerRef.current,
		containerRef: floatingRef
	});

	useEffect(() => {
		if (!open || openSource !== "contextmenu" || !anchorPoint) return;

		const rafId = window.requestAnimationFrame(() => {
			const focusTarget = getNavigableItems()[0] ?? floatingRef.current;
			focusTarget?.focus({ preventScroll: true });
		});

		return () => window.cancelAnimationFrame(rafId);
	}, [open, openSource, anchorPoint, getNavigableItems, floatingRef]);

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

	useClickOutside([floatingRef as RefObject<HTMLElement>, triggerRef as RefObject<HTMLElement>], outsideClose);

	const onMenuKeyDown = useCallback(
		(event: KeyboardEvent<HTMLElement>) => {
			if (event.key === "Tab") {
				// Возвращаем точку отсчёта в tab-порядок до browser default action:
				// так Tab и Shift+Tab продолжают обход относительно trigger, а не portal в конце body.
				triggerRef.current?.focus({ preventScroll: true });
				closeMenu();
				return;
			}

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
				return;
			}

			if (event.key.length === 1 && event.key !== " " && !event.altKey && !event.ctrlKey && !event.metaKey) {
				const query = event.key.toLocaleLowerCase();
				const nextItems = [...items.slice(currentIndex + 1), ...items.slice(0, currentIndex + 1)];
				const match = nextItems.find((item) => item.textContent?.trim().toLocaleLowerCase().startsWith(query));
				if (match) {
					event.preventDefault();
					match.focus();
				}
			}
		},
		[getNavigableItems, triggerRef, closeMenu]
	);

	if (typeof document === "undefined") return null;

	return createPortal(
		<AnimatePresence>
			{open && (
				<motion.div
					id={menuId}
					ref={setFloating}
					style={floatingStyles}
					role="menu"
					aria-label={ariaLabel}
					aria-labelledby={ariaLabel ? undefined : (ariaLabelledBy ?? triggerId)}
					tabIndex={-1}
					className={styles.menuPositioner}
					onKeyDown={onMenuKeyDown}
					initial={{ opacity: 0, scale: 0.96, y: -2 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.96, y: -2 }}
					transition={{ duration: 0.14, ease: "easeOut" }}>
					<PickerOptions className={cn(styles.menuOptions, className)}>
						{typeof children === "function" ? children({ closeMenu }) : children}
					</PickerOptions>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body
	);
}
