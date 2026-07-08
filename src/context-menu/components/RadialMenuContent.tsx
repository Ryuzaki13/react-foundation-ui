import React, { Children, useCallback, useEffect, useMemo } from "react";

import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";

import { useClickOutside, useEscapeDismiss, useOverlayFocus } from "@ryuzaki13/react-foundation-lib/dom";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "../ContextMenu.module.scss";

import { useMenuContext } from "./MenuContext";

export interface RadialMenuContentProps {
	children: React.ReactNode | ((ctx: { closeMenu: () => void }) => React.ReactNode);
	className?: string;
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

export const RadialMenuContent: React.FC<RadialMenuContentProps> = ({
	children,
	className,
	closeOnOutside = true,
	closeOnEscape = true,
	disableOutsideClick = false,
	restoreFocus = true,
	radius = 76,
	itemSize = 64,
	closeLabel = "Закрыть"
}) => {
	const { open, anchorPoint, floatingRef, triggerRef, setFloating, closeMenu } = useMenuContext();

	const resolvedChildren = typeof children === "function" ? children({ closeMenu }) : children;
	const itemNodes = useMemo(() => Children.toArray(resolvedChildren), [resolvedChildren]);
	const itemCount = itemNodes.length;
	const panelSize = radius * 2 + itemSize;

	const panelPoint = useMemo(() => {
		if (typeof window === "undefined" || !anchorPoint) return null;

		// Радиальное меню центрируется на точке вызова, но не выходит за границы viewport.
		const safeOffset = panelSize / 2 + 8;
		return {
			x: clamp(anchorPoint.x, safeOffset, window.innerWidth - safeOffset),
			y: clamp(anchorPoint.y, safeOffset, window.innerHeight - safeOffset)
		};
	}, [anchorPoint, panelSize]);

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

	useClickOutside([floatingRef as React.RefObject<HTMLElement>, triggerRef as React.RefObject<HTMLElement>], outsideClose);

	const onMenuKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLElement>) => {
			const items = getNavigableItems();
			if (items.length === 0) return;

			const activeElement = document.activeElement as HTMLElement | null;
			const currentIndex = activeElement ? items.indexOf(activeElement) : -1;

			if (event.key === "ArrowRight" || event.key === "ArrowDown") {
				event.preventDefault();
				const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % items.length : 0;
				items[nextIndex]?.focus();
				return;
			}

			if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
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
			{open && panelPoint && (
				<motion.div
					ref={setFloating}
					style={
						{
							"--radial-panel-size": `${panelSize}px`,
							"--radial-radius": `${radius}px`,
							"--radial-item-size": `${itemSize}px`,
							left: panelPoint.x - panelSize / 2,
							top: panelPoint.y - panelSize / 2,
							transformOrigin: "center"
						} as React.CSSProperties
					}
					role="menu"
					tabIndex={-1}
					className={cn(styles.radialPanel, className)}
					onKeyDown={onMenuKeyDown}
					initial={{ opacity: 0, scale: 0.78 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.78 }}
					transition={{ duration: 0.16, ease: "easeOut" }}>
					<div className={styles.radialRing} aria-hidden="true" />
					<button
						type="button"
						role="menuitem"
						className={styles.radialCenterButton}
						aria-label={closeLabel}
						data-menu-item="true"
						data-radial-close="true"
						onClick={closeMenu}>
						<span className={styles.radialCenterButtonText}>{closeLabel}</span>
					</button>
					<div className={styles.radialItems}>
						{itemNodes.map((item, index) => {
							const angle = itemCount > 0 ? -90 + (360 / itemCount) * index : -90;
							return (
								<div
									// Индекс допустим: порядок пунктов полностью задает геометрию кольца.
									key={index}
									className={styles.radialItemSlot}
									style={{ "--radial-item-angle": `${angle}deg` } as React.CSSProperties}>
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
};
