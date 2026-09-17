import React, { useCallback, useRef } from "react";

import { FloatingPortal } from "@floating-ui/react";
import { useClickOutside, useEscapeDismiss, useOverlayFocus } from "@ryuzaki13/react-foundation-lib/dom";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { TooltipArrow } from "../../floating-arrow";

import styles from "./Popover.module.scss";
import { usePopoverContext } from "./PopoverContext";

export type PopoverContentProps = Readonly<{
	children: React.ReactNode | ((ctx: { setClose: () => void }) => React.ReactNode);
	onClose?: () => void;
	closeOnOutside?: boolean;
	closeOnEscape?: boolean;
	disableOutsideClick?: boolean;
	background?: "primary" | "secondary";
}> &
	Pick<React.HTMLAttributes<HTMLDivElement>, "role" | "aria-label" | "aria-labelledby" | "aria-describedby">;

/**
 * Содержимое немодального Popover, отображаемое в портале.
 * Компонент не навязывает ARIA-role: consumer задаёт семантику содержимого
 * явно и добавляет доступное имя для ролей, которым оно требуется.
 */
export function PopoverContent({
	children,
	onClose,
	closeOnOutside = true,
	closeOnEscape = true,
	disableOutsideClick = false,
	background = "secondary",
	role,
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy,
	"aria-describedby": ariaDescribedBy
}: PopoverContentProps) {
	const { open, setOpen, refs, floatingStyles, middlewareData, placement, arrowRef, contentId } = usePopoverContext();
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
				id={contentId}
				ref={setFloating}
				style={floatingStyles}
				className={cn(styles.popover, styles[background])}
				role={role}
				aria-label={ariaLabel}
				aria-labelledby={ariaLabelledBy}
				aria-describedby={ariaDescribedBy}
				tabIndex={-1}>
				{typeof children === "function" ? children({ setClose }) : children}
				<TooltipArrow ref={arrowRef} placement={placement} middlewareData={middlewareData} />
			</div>
		</FloatingPortal>
	);
}
