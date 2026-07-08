import React, { useCallback, useRef } from "react";

import { FloatingPortal } from "@floating-ui/react";
import { useClickOutside, useEscapeDismiss, useOverlayFocus } from "@ryuzaki13/react-foundation-lib/dom";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { TooltipArrow } from "../../floating-arrow";

import styles from "./Popover.module.scss";
import { usePopoverContext } from "./PopoverContext";

export interface PopoverContentProps {
	children: React.ReactNode | ((ctx: { setClose: () => void }) => React.ReactNode);
	onClose?: () => void;
	closeOnOutside?: boolean;
	closeOnEscape?: boolean;
	disableOutsideClick?: boolean;
	background?: "primary" | "secondary";
}

/**
 * Содержимое Popover, отображаемое в портале.
 */
export const PopoverContent: React.FC<PopoverContentProps> = ({
	children,
	onClose,
	closeOnOutside = true,
	closeOnEscape = true,
	disableOutsideClick = false,
	background = "secondary"
}) => {
	const { open, setOpen, refs, floatingStyles, middlewareData, placement, arrowRef } = usePopoverContext();
	const floatingElementRef = useRef<HTMLDivElement | null>(null);
	const setFloating = useCallback(
		(node: HTMLDivElement | null) => {
			floatingElementRef.current = node;
			refs.setFloating(node);
		},
		[refs]
	);

	const floatingRef = useOverlayFocus<HTMLDivElement>({
		active: open,
		initialFocus: "container",
		restoreFocus: true,
		containerRef: floatingElementRef
	});

	const setClose = useCallback(() => {
		if (!open) return;
		setOpen(false);
		onClose?.();
	}, [setOpen, onClose, open]);

	useEscapeDismiss({
		active: open,
		enabled: closeOnEscape,
		onDismiss: setClose,
		containerRef: floatingRef as React.RefObject<HTMLElement | null>
	});

	const outsideClose = useCallback(() => {
		if (!open || disableOutsideClick) return;
		if (closeOnOutside) setClose();
	}, [open, disableOutsideClick, closeOnOutside, setClose]);

	useClickOutside([refs.floating as React.RefObject<HTMLElement>, refs.reference as React.RefObject<HTMLElement>], outsideClose);

	if (!open) return null;

	return (
		<FloatingPortal>
			<div
				ref={setFloating}
				style={floatingStyles}
				className={cn(styles.popover, styles[background])}
				role="dialog"
				aria-modal="true"
				tabIndex={-1}>
				{typeof children === "function" ? children({ setClose }) : children}
				<TooltipArrow ref={arrowRef} placement={placement} middlewareData={middlewareData} />
			</div>
		</FloatingPortal>
	);
};
