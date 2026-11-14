import { createContext, type CSSProperties, type KeyboardEvent, type MouseEvent, type RefObject, useContext } from "react";

import { type MenuOpenSource, type MenuPoint } from "@ryuzaki13/react-foundation-lib/context-menu";
import { createMissingContextError } from "@ryuzaki13/react-foundation-lib/error";

import {
	type MENU_INITIAL_FOCUS_FIRST,
	type MENU_INITIAL_FOCUS_LAST,
	type MENU_TRIGGER_CLICK,
	type MENU_TRIGGER_CONTEXT_MENU
} from "./menuInteractionConstants";
export type MenuTriggerMode = typeof MENU_TRIGGER_CLICK | typeof MENU_TRIGGER_CONTEXT_MENU;
export type MenuInitialFocus = typeof MENU_INITIAL_FOCUS_FIRST | typeof MENU_INITIAL_FOCUS_LAST;

interface MenuContextValue {
	mode: MenuTriggerMode;
	open: boolean;
	openSource: MenuOpenSource | null;
	initialFocus: MenuInitialFocus;
	menuId: string;
	triggerId: string;
	anchorPoint: MenuPoint | null;
	floatingStyles: CSSProperties;
	floatingRef: RefObject<HTMLElement | null>;
	triggerRef: RefObject<HTMLElement | null>;
	setFloating: (node: HTMLElement | null) => void;
	registerTriggerElement: (node: HTMLElement | null) => void;
	onTriggerClick: (event: MouseEvent<HTMLElement>) => void;
	onTriggerContextMenu: (event: MouseEvent<HTMLElement>, triggerElement?: HTMLElement) => void;
	onTriggerKeyDown: (event: KeyboardEvent<HTMLElement>, triggerElement?: HTMLElement) => void;
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
