import { Children, type CSSProperties, type KeyboardEvent, type ReactNode, type RefObject, useCallback, useEffect, useMemo } from "react";

import { useClickOutside, useEscapeDismiss, useOverlayFocus } from "@ryuzaki13/react-foundation-lib/dom";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";

import styles from "../ContextMenu.module.scss";

import { useMenuContext } from "./MenuContext";
import {
	MENU_KEY_ARROW_DOWN,
	MENU_KEY_ARROW_UP,
	MENU_KEY_END,
	MENU_KEY_HOME,
	MENU_KEY_SPACE,
	MENU_KEY_TAB,
	MENU_NAVIGABLE_ITEM_SELECTOR
} from "./menuInteractionConstants";

const DEFAULT_RADIAL_RADIUS_PX = 76;
const DEFAULT_RADIAL_ITEM_SIZE_PX = 64;
const RADIAL_VIEWPORT_PADDING_PX = 8;
const RADIAL_MENU_CLOSED_SCALE = 0.78;
const RADIAL_MENU_TRANSITION_SECONDS = 0.16;
const RADIAL_START_ANGLE_DEG = -90;
const FULL_CIRCLE_DEG = 360;

export interface RadialMenuContentProps {
	children: ReactNode | ((ctx: { closeMenu: () => void }) => ReactNode);
	className?: string;
	"aria-label"?: string;
	"aria-labelledby"?: string;
	closeOnOutside?: boolean;
	closeOnEscape?: boolean;
	disableOutsideClick?: boolean;
	restoreFocus?: boolean;
	radius?: number;
	itemSize?: number;
	closeLabel?: string;
}

function clamp(value: number, min: number, max: number) {
	if (max < min) return min;
	return Math.min(Math.max(value, min), max);
}

export function RadialMenuContent({
	children,
	className,
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy,
	closeOnOutside = true,
	closeOnEscape = true,
	disableOutsideClick = false,
	restoreFocus = true,
	radius = DEFAULT_RADIAL_RADIUS_PX,
	itemSize = DEFAULT_RADIAL_ITEM_SIZE_PX,
	closeLabel = "Закрыть"
}: RadialMenuContentProps) {
	const { open, menuId, triggerId, anchorPoint, floatingRef, triggerRef, setFloating, closeMenu } = useMenuContext();

	const resolvedChildren = typeof children === "function" ? children({ closeMenu }) : children;
	const itemNodes = useMemo(() => Children.toArray(resolvedChildren), [resolvedChildren]);
	const itemCount = itemNodes.length;
	const panelSize = radius * 2 + itemSize;

	const panelPoint = useMemo(() => {
		if (typeof window === "undefined" || !anchorPoint) return null;

		// Радиальное меню центрируется на точке вызова, но не выходит за границы viewport.
		const safeOffset = panelSize / 2 + RADIAL_VIEWPORT_PADDING_PX;
		return {
			x: clamp(anchorPoint.x, safeOffset, window.innerWidth - safeOffset),
			y: clamp(anchorPoint.y, safeOffset, window.innerHeight - safeOffset)
		};
	}, [anchorPoint, panelSize]);

	const getNavigableItems = useCallback(() => {
		const floatingElement = floatingRef.current;
		if (!floatingElement) return [];

		return Array.from(floatingElement.querySelectorAll<HTMLElement>(MENU_NAVIGABLE_ITEM_SELECTOR));
	}, [floatingRef]);

	useOverlayFocus<HTMLElement>({
		active: open,
		initialFocus: (container) => getNavigableItems()[0] ?? container,
		restoreFocus,
		restoreFocusTarget: () => triggerRef.current,
		containerRef: floatingRef
	});

	useEffect(() => {
		if (!open || !anchorPoint) return;

		let rafId = 0;

		/**
		 * Повторный правый клик при уже открытом меню меняет только якорь, поэтому общий
		 * эффект начального фокуса не перезапускается. Возвращаем фокус в меню явно.
		 */
		const focusMenuOnReposition = () => {
			const focusTarget = getNavigableItems()[0] ?? floatingRef.current;
			focusTarget?.focus();
		};

		rafId = window.requestAnimationFrame(focusMenuOnReposition);
		return () => window.cancelAnimationFrame(rafId);
	}, [open, anchorPoint, getNavigableItems, floatingRef]);

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
				// Portal расположен в конце body, поэтому перед browser default action
				// продолжаем tab-порядок от исходного trigger.
				triggerRef.current?.focus({ preventScroll: true });
				closeMenu();
				return;
			}

			const items = getNavigableItems();
			if (items.length === 0) return;

			const activeElement = document.activeElement as HTMLElement | null;
			const currentIndex = activeElement ? items.indexOf(activeElement) : -1;

			if (event.key === "ArrowRight" || event.key === MENU_KEY_ARROW_DOWN) {
				event.preventDefault();
				const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % items.length : 0;
				items[nextIndex]?.focus();
				return;
			}

			if (event.key === "ArrowLeft" || event.key === MENU_KEY_ARROW_UP) {
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
			{open && panelPoint && (
				<motion.div
					id={menuId}
					ref={setFloating}
					style={
						{
							"--radial-panel-size": `${panelSize}px`,
							"--radial-radius": `${radius}px`,
							"--radial-item-size": `${itemSize}px`,
							left: panelPoint.x - panelSize / 2,
							top: panelPoint.y - panelSize / 2,
							transformOrigin: "center"
						} as CSSProperties
					}
					role="menu"
					aria-label={ariaLabel}
					aria-labelledby={ariaLabel ? undefined : (ariaLabelledBy ?? triggerId)}
					tabIndex={-1}
					className={cn(styles.radialPanel, className)}
					onKeyDown={onMenuKeyDown}
					initial={{ opacity: 0, scale: RADIAL_MENU_CLOSED_SCALE }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: RADIAL_MENU_CLOSED_SCALE }}
					transition={{ duration: RADIAL_MENU_TRANSITION_SECONDS, ease: "easeOut" }}>
					<div className={styles.radialRing} aria-hidden="true" />
					<button
						type="button"
						role="menuitem"
						tabIndex={-1}
						className={styles.radialCenterButton}
						aria-label={closeLabel}
						data-menu-item="true"
						data-radial-close="true"
						onClick={closeMenu}>
						<span className={styles.radialCenterButtonText}>{closeLabel}</span>
					</button>
					<div className={styles.radialItems}>
						{itemNodes.map((item, index) => {
							const angle =
								itemCount > 0 ? RADIAL_START_ANGLE_DEG + (FULL_CIRCLE_DEG / itemCount) * index : RADIAL_START_ANGLE_DEG;
							return (
								<div
									// Индекс допустим: порядок пунктов полностью задает геометрию кольца.
									key={index}
									className={styles.radialItemSlot}
									style={{ "--radial-item-angle": `${angle}deg` } as CSSProperties}>
									{item}
								</div>
							);
						})}
					</div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body
	);
}
