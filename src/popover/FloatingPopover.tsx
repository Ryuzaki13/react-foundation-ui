/* eslint-disable react-hooks/refs */
import React, { useLayoutEffect, useRef, useState } from "react";

import {
	arrow,
	autoUpdate,
	flip,
	offset,
	type Placement,
	shift,
	useDismiss,
	useFocus,
	useFloating,
	useHover,
	useInteractions,
	useRole
} from "@floating-ui/react";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { createPortal } from "react-dom";

import { FloatingArrow } from "../floating-arrow/FloatingArrow";

import { FloatingPopoverAnchor } from "./FloatingPopoverAnchor";
import styles from "./Popover.module.scss";

const DEFAULT_PLACEMENT = "bottom";
const DEFAULT_OPEN_DELAY_MS = 200;
const DEFAULT_CLOSE_DELAY_MS = 100;
const POPOVER_ANCHOR_GAP_PX = 8;
const POPOVER_VIEWPORT_PADDING_PX = 8;
const POPOVER_ARROW_PADDING_PX = 8;

/**
 * Пассивная floating-подсказка. По умолчанию создаёт span для произвольного
 * содержимого; asChild сохраняет участие самого trigger в Grid/Flex-раскладке.
 */
export type FloatingPopoverProps = {
	readonly content: React.ReactNode;
	readonly openOnHover?: boolean;
	readonly placement?: Placement;
	readonly openDelay?: number;
	readonly closeDelay?: number;
	readonly maxWidth?: number;
	readonly state?: "information" | "error" | "warning" | "success" | "negative";
	readonly tooltip?: true;
	/**
	 * Изменяется вместе с CSS-координатой trigger, когда её изменение не отслеживается `autoUpdate`.
	 * После commit React выполняется повторный расчёт позиции открытой floating-панели.
	 */
	readonly positionUpdateKey?: unknown;
} & (
	| {
			/**
			 * Передаёт reference, события и ARIA единственному дочернему элементу.
			 * Пользовательский компонент обязан передать их и ref своему DOM-элементу.
			 * Fragment не может быть якорем; нативный disabled сохраняет свою семантику.
			 */
			readonly asChild: true;
			readonly children: React.ReactElement<React.HTMLProps<HTMLElement>>;
	  }
	| {
			readonly asChild?: false;
			readonly children: React.ReactNode;
	  }
);

export function FloatingPopover({
	content,
	children,
	asChild = false,
	openOnHover = true,
	placement = DEFAULT_PLACEMENT,
	openDelay = DEFAULT_OPEN_DELAY_MS,
	closeDelay = DEFAULT_CLOSE_DELAY_MS,
	maxWidth,
	state,
	tooltip,
	positionUpdateKey
}: FloatingPopoverProps) {
	const [open, setOpen] = useState(false);
	const arrowRef = useRef<HTMLDivElement>(null);

	const {
		refs,
		floatingStyles,
		middlewareData,
		context,
		placement: computedPlacement,
		update
	} = useFloating({
		open,
		onOpenChange: setOpen,
		placement,
		middleware: [
			offset(POPOVER_ANCHOR_GAP_PX),
			flip({ fallbackAxisSideDirection: "end", fallbackPlacements: ["top", "right", DEFAULT_PLACEMENT] }),
			shift({ padding: POPOVER_VIEWPORT_PADDING_PX }),
			arrow({ element: arrowRef, padding: POPOVER_ARROW_PADDING_PX })
		],
		whileElementsMounted: autoUpdate
	});

	useLayoutEffect(() => {
		if (open) {
			void update();
		}
	}, [open, positionUpdateKey, update]);

	const hover = useHover(context, {
		enabled: openOnHover,
		// Touch не имеет устойчивого hover: совместимые mouse-события после tap
		// не должны оставлять подсказку над открытым диалогом.
		mouseOnly: tooltip === true,
		move: false,
		delay: {
			open: openDelay,
			close: closeDelay
		}
	});
	// Hover-подсказка обязана иметь ту же пассивную точку входа с клавиатуры.
	// Связываем focus с тем же флагом, чтобы `openOnHover={false}` не менял
	// управляемые сценарии, которые не запрашивали автоматическое открытие.
	const focus = useFocus(context, { enabled: openOnHover });
	// Штатный reference-press закрывает подсказку и отменяет отложенное hover-открытие,
	// сохраняя событие активации children и открытие с клавиатурного фокуса.
	const dismiss = useDismiss(context, { referencePress: tooltip === true });
	const role = useRole(context, { role: "tooltip" });

	const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

	return (
		<>
			{asChild ? (
				<FloatingPopoverAnchor referenceRef={refs.setReference} getReferenceProps={getReferenceProps}>
					{children}
				</FloatingPopoverAnchor>
			) : (
				<span ref={refs.setReference} {...getReferenceProps()} style={{ lineHeight: 1 }}>
					{children}
				</span>
			)}

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
}
