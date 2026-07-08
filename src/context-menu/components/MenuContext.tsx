import { createContext, useContext } from "react";

import { createMissingContextError } from "@ryuzaki13/react-foundation-lib/error";

import type { MenuOpenSource, MenuPoint } from "@ryuzaki13/react-foundation-lib/context-menu";

export type MenuTriggerMode = "click" | "contextmenu";

interface MenuContextValue {
	mode: MenuTriggerMode;
	open: boolean;
	openSource: MenuOpenSource | null;
	anchorPoint: MenuPoint | null;
	floatingStyles: React.CSSProperties;
	floatingRef: React.RefObject<HTMLElement | null>;
	triggerRef: React.RefObject<HTMLElement | null>;
	setFloating: (node: HTMLElement | null) => void;
	registerTriggerElement: (node: HTMLElement | null) => void;
	onTriggerClick: (event: React.MouseEvent<HTMLElement>) => void;
	onTriggerContextMenu: (event: React.MouseEvent<HTMLElement>) => void;
	onTriggerKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
	closeMenu: () => void;
}

export const MenuContext = createContext<MenuContextValue | null>(null);

export function useMenuContext() {
	const context = useContext(MenuContext);
	if (!context) {
		throw createMissingContextError({
			hookName: "useMenuContext",
			providerName: "MenuRoot"
		});
	}
	return context;
}
