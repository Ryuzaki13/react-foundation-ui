/* eslint-disable react-refresh/only-export-components */
import React, { useCallback, useRef, useState } from "react";

import { arrow, autoUpdate, flip, offset, Placement, shift, useFloating } from "@floating-ui/react";

import { PopoverContent } from "./PopoverContent";
import { PopoverContext } from "./PopoverContext";
import { PopoverTrigger } from "./PopoverTrigger";

export interface PopoverProps {
	children: React.ReactNode;
	placement?: Placement;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}

/**
 * Контролируемый Popover.
 * Используется в связке с Popover.Trigger и Popover.Content.
 */
const PopoverRoot: React.FC<PopoverProps> = ({ children, open: controlledOpen, defaultOpen, onOpenChange, placement = "bottom" }) => {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);

	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : uncontrolledOpen;
	const setOpen = useCallback<React.Dispatch<React.SetStateAction<boolean>>>(
		(value) => {
			const next = typeof value === "function" ? value(open) : value;
			if (!isControlled) setUncontrolledOpen(next);
			onOpenChange?.(next);
		},
		[isControlled, onOpenChange, open]
	);

	const arrowRef = useRef<HTMLDivElement | null>(null);

	const {
		refs,
		floatingStyles,
		middlewareData,
		placement: actualPlacement
	} = useFloating({
		open,
		onOpenChange: setOpen,
		placement,
		// eslint-disable-next-line react-hooks/refs
		middleware: [offset(8), flip(), shift({ padding: 16 }), arrow({ element: arrowRef.current })],
		whileElementsMounted: autoUpdate
	});

	return (
		<PopoverContext.Provider value={{ open, setOpen, refs, floatingStyles, placement: actualPlacement, middlewareData, arrowRef }}>
			{children}
		</PopoverContext.Provider>
	);
};

/**
 * Композиционное API:
 * <Popover>
 *   <Popover.Trigger />
 *   <Popover.Content />
 * </Popover>
 */
export const Popover = Object.assign(PopoverRoot, {
	Trigger: PopoverTrigger,
	Content: PopoverContent
});
