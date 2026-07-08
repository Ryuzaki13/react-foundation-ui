import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { autoUpdate, flip, offset, Placement, shift, useFloating } from "@floating-ui/react";

import {
	closeMenu,
	createVirtualAnchor,
	getMenuPointFromEvent,
	getMenuPointFromRect,
	initialMenuState,
	openMenu
} from "@ryuzaki13/react-foundation-lib/context-menu";

import { MenuContext, MenuTriggerMode } from "./MenuContext";

interface MenuRootProps {
	children: React.ReactNode;
	mode: MenuTriggerMode;
	placement?: Placement;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export const MenuRoot: React.FC<MenuRootProps> = ({
	children,
	mode,
	placement = mode === "click" ? "bottom-start" : "right-start",
	open: controlledOpen,
	defaultOpen,
	onOpenChange
}) => {
	const [menuState, setMenuState] = useState(initialMenuState);
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : uncontrolledOpen;
	const triggerElementRef = useRef<HTMLElement | null>(null);

	const { refs, floatingStyles, update } = useFloating({
		placement,
		strategy: mode === "contextmenu" ? "fixed" : "absolute",
		transform: false,
		middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
		whileElementsMounted: autoUpdate
	});

	const setOpen = useCallback(
		(nextOpen: boolean) => {
			if (!isControlled) {
				setUncontrolledOpen(nextOpen);
			}
			onOpenChange?.(nextOpen);
			if (!nextOpen) {
				setMenuState((state) => closeMenu(state));
			}
		},
		[isControlled, onOpenChange]
	);

	const closeMenuHandler = useCallback(() => {
		setOpen(false);
	}, [setOpen]);

	useEffect(() => {
		if (!open) {
			setMenuState((state) => closeMenu(state));
		}
	}, [open]);

	const openAtElement = useCallback(
		(element: HTMLElement, source: "click" | "keyboard") => {
			refs.setReference(element);
			setMenuState(
				openMenu({
					source,
					anchor: {
						type: "element",
						element
					}
				})
			);
			setOpen(true);
		},
		[refs, setOpen]
	);

	const openAtPoint = useCallback(
		(point: { x: number; y: number }, source: "contextmenu" | "keyboard", contextElement?: HTMLElement | null) => {
			refs.setReference(createVirtualAnchor(point, contextElement));
			setMenuState(
				openMenu({
					source,
					anchor: {
						type: "point",
						point,
						contextElement
					}
				})
			);
			setOpen(true);
			update();
		},
		[refs, setOpen, update]
	);

	const registerTriggerElement = useCallback(
		(node: HTMLElement | null) => {
			triggerElementRef.current = node;
			if (mode === "click") {
				refs.setReference(node);
			}
		},
		[mode, refs]
	);

	const onTriggerClick = useCallback(
		(event: React.MouseEvent<HTMLElement>) => {
			if (mode !== "click") return;
			const element = event.currentTarget;

			if (open && menuState.anchor?.type === "element" && menuState.anchor.element === element) {
				closeMenuHandler();
				return;
			}

			openAtElement(element, "click");
		},
		[mode, open, menuState.anchor, closeMenuHandler, openAtElement]
	);

	const onTriggerContextMenu = useCallback(
		(event: React.MouseEvent<HTMLElement>) => {
			if (mode !== "contextmenu") return;
			event.preventDefault();

			const element = event.currentTarget;
			const point = getMenuPointFromEvent(event);
			openAtPoint(point, "contextmenu", element);
		},
		[mode, openAtPoint]
	);

	const onTriggerKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLElement>) => {
			const isContextMenuKeyboardOpen = event.key === "ContextMenu" || (event.shiftKey && event.key === "F10");
			if (!isContextMenuKeyboardOpen) return;

			event.preventDefault();
			const element = event.currentTarget;

			if (mode === "click") {
				openAtElement(element, "keyboard");
				return;
			}

			const point = getMenuPointFromRect(element.getBoundingClientRect());
			openAtPoint(point, "keyboard", element);
		},
		[mode, openAtElement, openAtPoint]
	);

	const visible = open && menuState.anchor !== null;
	const anchorPoint = useMemo(() => {
		if (!menuState.anchor) return null;

		if (menuState.anchor.type === "point") {
			return menuState.anchor.point;
		}

		const rect = menuState.anchor.element.getBoundingClientRect();
		return getMenuPointFromRect(rect);
	}, [menuState.anchor]);

	const value = useMemo(
		() => ({
			mode,
			open: visible,
			openSource: menuState.source,
			anchorPoint,
			floatingStyles,
			floatingRef: refs.floating,
			triggerRef: triggerElementRef,
			setFloating: refs.setFloating,
			registerTriggerElement,
			onTriggerClick,
			onTriggerContextMenu,
			onTriggerKeyDown,
			closeMenu: closeMenuHandler
		}),
		[
			mode,
			visible,
			menuState.source,
			anchorPoint,
			floatingStyles,
			refs.floating,
			refs.setFloating,
			registerTriggerElement,
			onTriggerClick,
			onTriggerContextMenu,
			onTriggerKeyDown,
			closeMenuHandler
		]
	);

	return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};
