/* eslint-disable react-hooks/refs */
import React, { useRef, useState } from "react";

import {
	arrow,
	autoUpdate,
	flip,
	offset,
	Placement,
	shift,
	useDismiss,
	useFloating,
	useHover,
	useInteractions,
	useRole
} from "@floating-ui/react";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { createPortal } from "react-dom";

import { FloatingArrow } from "../floating-arrow/FloatingArrow";

import styles from "./Popover.module.scss";

interface FloatingPopoverProps {
	content: React.ReactNode;
	children: React.ReactNode;
	openOnHover?: boolean;
	placement?: Placement;
	openDelay?: number;
	closeDelay?: number;
	maxWidth?: number;
	state?: "information" | "error" | "warning" | "success" | "negative";
	tooltip?: true;
}

export const FloatingPopover: React.FC<FloatingPopoverProps> = ({
	content,
	children,
	openOnHover = true,
	placement = "bottom",
	openDelay = 200,
	closeDelay = 100,
	maxWidth,
	state,
	tooltip
}) => {
	const [open, setOpen] = useState(false);
	const arrowRef = useRef<HTMLDivElement>(null);

	const {
		refs,
		floatingStyles,
		middlewareData,
		context,
		placement: computedPlacement
	} = useFloating({
		open,
		onOpenChange: setOpen,
		placement,
		middleware: [
			offset(8),
			flip({ fallbackAxisSideDirection: "end", fallbackPlacements: ["top", "right", "bottom"] }),
			shift({ padding: 16 }),
			arrow({ element: arrowRef, padding: 8 })
		],
		whileElementsMounted: autoUpdate
	});

	const hover = useHover(context, {
		enabled: openOnHover,
		move: false,
		delay: {
			open: openDelay,
			close: closeDelay
		}
	});
	const dismiss = useDismiss(context);
	const role = useRole(context);

	const { getReferenceProps, getFloatingProps } = useInteractions([hover, dismiss, role]);

	return (
		<>
			<span ref={refs.setReference} {...getReferenceProps()} style={{ lineHeight: 1 }}>
				{children}
			</span>

			{open &&
				createPortal(
					<div
						ref={refs.setFloating}
						style={{ ...floatingStyles, zIndex: "var(--z-tooltip)", maxWidth: maxWidth ? `${maxWidth}em` : undefined }}
						{...getFloatingProps()}
						role="tooltip"
						className={cn(styles.tooltipPanel, tooltip && styles.tooltip, state && styles[state])}>
						{content}

						<FloatingArrow ref={arrowRef} placement={computedPlacement} middlewareData={middlewareData} />
					</div>,
					document.body
				)}
		</>
	);
};
