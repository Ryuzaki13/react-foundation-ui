import { type KeyboardEvent, type ReactNode, type RefObject, useCallback, useEffect } from "react";

import { useClickOutside, useEscapeDismiss, useOverlayFocus } from "@ryuzaki13/react-foundation-lib/dom";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";

import { PickerOptions } from "../../picker";
import styles from "../ContextMenu.module.scss";

import { useMenuContext } from "./MenuContext";
import {
	MENU_INITIAL_FOCUS_LAST,
	MENU_KEY_ARROW_DOWN,
	MENU_KEY_ARROW_UP,
	MENU_KEY_END,
	MENU_KEY_HOME,
	MENU_KEY_SPACE,
	MENU_KEY_TAB,
	MENU_NAVIGABLE_ITEM_SELECTOR,
	MENU_TRIGGER_CONTEXT_MENU
} from "./menuInteractionConstants";

const MENU_CLOSED_SCALE = 0.96;
const MENU_CLOSED_OFFSET_PX = -2;
const MENU_TRANSITION_SECONDS = 0.14;

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

		return Array.from(floatingElement.querySelectorAll<HTMLElement>(MENU_NAVIGABLE_ITEM_SELECTOR));
	}, [floatingRef]);

	useOverlayFocus<HTMLElement>({
		active: open,
		initialFocus: (container) => {
			const items = getNavigableItems();
			return (initialFocus === MENU_INITIAL_FOCUS_LAST ? items[items.length - 1] : items[0]) ?? container;
		},
		restoreFocus,
		restoreFocusTarget: () => triggerRef.current,
		containerRef: floatingRef
	});

	useEffect(() => {
		if (!open || openSource !== MENU_TRIGGER_CONTEXT_MENU || !anchorPoint) return;

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
			if (event.key === MENU_KEY_TAB) {
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

			if (event.key === MENU_KEY_ARROW_DOWN) {
				event.preventDefault();
				const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % items.length : 0;
				items[nextIndex]?.focus();
				return;
			}

			if (event.key === MENU_KEY_ARROW_UP) {
				event.preventDefault();
				const nextIndex = currentIndex >= 0 ? (currentIndex - 1 + items.length) % items.length : items.length - 1;
				items[nextIndex]?.focus();
				return;
			}

			if (event.key === MENU_KEY_HOME) {
				event.preventDefault();
				items[0]?.focus();
				return;
			}

			if (event.key === MENU_KEY_END) {
				event.preventDefault();
				items[items.length - 1]?.focus();
				return;
			}

			if (event.key.length === 1 && event.key !== MENU_KEY_SPACE && !event.altKey && !event.ctrlKey && !event.metaKey) {
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
					initial={{ opacity: 0, scale: MENU_CLOSED_SCALE, y: MENU_CLOSED_OFFSET_PX }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: MENU_CLOSED_SCALE, y: MENU_CLOSED_OFFSET_PX }}
					transition={{ duration: MENU_TRANSITION_SECONDS, ease: "easeOut" }}>
					<PickerOptions className={cn(styles.menuOptions, className)}>
						{typeof children === "function" ? children({ closeMenu }) : children}
					</PickerOptions>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body
	);
}
