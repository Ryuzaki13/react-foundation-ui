import React, { createContext, useContext } from "react";

import { Placement, useFloating } from "@floating-ui/react";
import { createMissingContextError } from "@ryuzaki13/react-foundation-lib/error";

interface PopoverContextValue {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	refs: ReturnType<typeof useFloating>["refs"];
	floatingStyles: React.CSSProperties;
	placement: Placement;
	middlewareData: ReturnType<typeof useFloating>["middlewareData"];
	arrowRef: React.RefObject<HTMLDivElement | null>;
}

export const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopoverContext() {
	const context = useContext(PopoverContext);
	if (!context) {
		throw createMissingContextError({
			hookName: "usePopoverContext",
			providerName: "Popover"
		});
	}
	return context;
}
