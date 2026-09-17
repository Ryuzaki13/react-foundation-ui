import { type KeyboardEvent, type MouseEvent, type ReactNode, useCallback, useId, useMemo, useRef, useState } from "react";

import { autoUpdate, flip, offset, type Placement, shift, useFloating } from "@floating-ui/react";
import {
	closeMenu,
	createVirtualAnchor,
	getMenuPointFromEvent,
	getMenuPointFromRect,
	initialMenuState,
	openMenu
} from "@ryuzaki13/react-foundation-lib/context-menu";

import { MenuContext, type MenuInitialFocus, type MenuTriggerMode } from "./MenuContext";

interface MenuRootProps {
	children: ReactNode;
	mode: MenuTriggerMode;
	placement?: Placement;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function MenuRoot({
	children,
	mode,
	placement = mode === "click" ? "bottom-start" : "right-start",
	open: controlledOpen,
	defaultOpen,
	onOpenChange
}: MenuRootProps) {
	const generatedId = useId();
	const menuId = `${generatedId}-menu`;
	const defaultTriggerId = `${generatedId}-trigger`;
	const [menuState, setMenuState] = useState(initialMenuState);
	const [initialFocus, setInitialFocus] = useState<MenuInitialFocus>("first");
	const [triggerId, setTriggerId] = useState(defaultTriggerId);
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : uncontrolledOpen;
	const triggerElementRef = useRef<HTMLElement | null>(null);
	const registeredTriggerElementRef = useRef<HTMLElement | null>(null);

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

	const openAtElement = useCallback(
		(element: HTMLElement, source: "click" | "keyboard", nextInitialFocus: MenuInitialFocus = "first") => {
			refs.setReference(element);
			setInitialFocus(nextInitialFocus);
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
			setInitialFocus("first");
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
			const previous = registeredTriggerElementRef.current;
			registeredTriggerElementRef.current = node;
			if (node) {
				setTriggerId(node.id || defaultTriggerId);
			}
			// Повторный ref-callback общего контейнера не должен заменить делегированную цель,
			// иначе после закрытия фокус вернётся на всю таблицу вместо исходной ячейки.
			if (triggerElementRef.current === null || triggerElementRef.current === previous) {
				triggerElementRef.current = node;
			}
			if (mode === "click") {
				refs.setReference(node);
			}
		},
		[defaultTriggerId, mode, refs]
	);

	const onTriggerClick = useCallback(
		(event: MouseEvent<HTMLElement>) => {
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
		(event: MouseEvent<HTMLElement>, triggerElement = event.currentTarget) => {
			if (mode !== "contextmenu") return;
			event.preventDefault();

			const point = getMenuPointFromEvent(event);
			triggerElementRef.current = triggerElement;
			openAtPoint(point, "contextmenu", triggerElement);
		},
		[mode, openAtPoint]
	);

	const onTriggerKeyDown = useCallback(
		(event: KeyboardEvent<HTMLElement>, triggerElement = event.currentTarget) => {
			if (mode === "click" && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
				event.preventDefault();
				triggerElementRef.current = triggerElement;
				openAtElement(triggerElement, "keyboard", event.key === "ArrowUp" ? "last" : "first");
				return;
			}

			const isContextMenuKeyboardOpen = event.key === "ContextMenu" || (event.shiftKey && event.key === "F10");
			if (!isContextMenuKeyboardOpen) return;

			event.preventDefault();
			triggerElementRef.current = triggerElement;

			if (mode === "click") {
				openAtElement(triggerElement, "keyboard");
				return;
			}

			const point = getMenuPointFromRect(triggerElement.getBoundingClientRect());
			openAtPoint(point, "keyboard", triggerElement);
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
			initialFocus,
			menuId,
			triggerId,
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
			initialFocus,
			menuId,
			triggerId,
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
}
