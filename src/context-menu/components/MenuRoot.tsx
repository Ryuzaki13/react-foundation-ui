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
import {
	MENU_INITIAL_FOCUS_FIRST,
	MENU_INITIAL_FOCUS_LAST,
	MENU_KEY_ARROW_DOWN,
	MENU_KEY_ARROW_UP,
	MENU_OPEN_SOURCE_KEYBOARD,
	MENU_TRIGGER_CLICK,
	MENU_TRIGGER_CONTEXT_MENU
} from "./menuInteractionConstants";

const MENU_ANCHOR_ELEMENT = "element";
const MENU_ANCHOR_POINT = "point";
const MENU_ANCHOR_GAP_PX = 6;
const MENU_VIEWPORT_PADDING_PX = 8;

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
	placement = mode === MENU_TRIGGER_CLICK ? "bottom-start" : "right-start",
	open: controlledOpen,
	defaultOpen,
	onOpenChange
}: MenuRootProps) {
	const generatedId = useId();
	const menuId = `${generatedId}-menu`;
	const defaultTriggerId = `${generatedId}-trigger`;
	const [menuState, setMenuState] = useState(initialMenuState);
	const [initialFocus, setInitialFocus] = useState<MenuInitialFocus>(MENU_INITIAL_FOCUS_FIRST);
	const [triggerId, setTriggerId] = useState(defaultTriggerId);
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : uncontrolledOpen;
	const triggerElementRef = useRef<HTMLElement | null>(null);
	const registeredTriggerElementRef = useRef<HTMLElement | null>(null);

	const { refs, floatingStyles, update } = useFloating({
		placement,
		strategy: mode === MENU_TRIGGER_CONTEXT_MENU ? "fixed" : "absolute",
		transform: false,
		middleware: [offset(MENU_ANCHOR_GAP_PX), flip({ padding: MENU_VIEWPORT_PADDING_PX }), shift({ padding: MENU_VIEWPORT_PADDING_PX })],
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
		(
			element: HTMLElement,
			source: typeof MENU_TRIGGER_CLICK | typeof MENU_OPEN_SOURCE_KEYBOARD,
			nextInitialFocus: MenuInitialFocus = MENU_INITIAL_FOCUS_FIRST
		) => {
			refs.setReference(element);
			setInitialFocus(nextInitialFocus);
			setMenuState(
				openMenu({
					source,
					anchor: {
						type: MENU_ANCHOR_ELEMENT,
						element
					}
				})
			);
			setOpen(true);
		},
		[refs, setOpen]
	);

	const openAtPoint = useCallback(
		(
			point: { x: number; y: number },
			source: typeof MENU_TRIGGER_CONTEXT_MENU | typeof MENU_OPEN_SOURCE_KEYBOARD,
			contextElement?: HTMLElement | null
		) => {
			refs.setReference(createVirtualAnchor(point, contextElement));
			setInitialFocus(MENU_INITIAL_FOCUS_FIRST);
			setMenuState(
				openMenu({
					source,
					anchor: {
						type: MENU_ANCHOR_POINT,
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
			if (mode === MENU_TRIGGER_CLICK) {
				refs.setReference(node);
			}
		},
		[defaultTriggerId, mode, refs]
	);

	const onTriggerClick = useCallback(
		(event: MouseEvent<HTMLElement>) => {
			if (mode !== MENU_TRIGGER_CLICK) return;
			const element = event.currentTarget;

			if (open && menuState.anchor?.type === MENU_ANCHOR_ELEMENT && menuState.anchor.element === element) {
				closeMenuHandler();
				return;
			}

			openAtElement(element, MENU_TRIGGER_CLICK);
		},
		[mode, open, menuState.anchor, closeMenuHandler, openAtElement]
	);

	const onTriggerContextMenu = useCallback(
		(event: MouseEvent<HTMLElement>, triggerElement = event.currentTarget) => {
			if (mode !== MENU_TRIGGER_CONTEXT_MENU) return;
			event.preventDefault();

			const point = getMenuPointFromEvent(event);
			triggerElementRef.current = triggerElement;
			openAtPoint(point, MENU_TRIGGER_CONTEXT_MENU, triggerElement);
		},
		[mode, openAtPoint]
	);

	const onTriggerKeyDown = useCallback(
		(event: KeyboardEvent<HTMLElement>, triggerElement = event.currentTarget) => {
			if (mode === MENU_TRIGGER_CLICK && (event.key === MENU_KEY_ARROW_DOWN || event.key === MENU_KEY_ARROW_UP)) {
				event.preventDefault();
				triggerElementRef.current = triggerElement;
				openAtElement(
					triggerElement,
					MENU_OPEN_SOURCE_KEYBOARD,
					event.key === MENU_KEY_ARROW_UP ? MENU_INITIAL_FOCUS_LAST : MENU_INITIAL_FOCUS_FIRST
				);
				return;
			}

			const isContextMenuKeyboardOpen = event.key === "ContextMenu" || (event.shiftKey && event.key === "F10");
			if (!isContextMenuKeyboardOpen) return;

			event.preventDefault();
			triggerElementRef.current = triggerElement;

			if (mode === MENU_TRIGGER_CLICK) {
				openAtElement(triggerElement, MENU_OPEN_SOURCE_KEYBOARD);
				return;
			}

			const point = getMenuPointFromRect(triggerElement.getBoundingClientRect());
			openAtPoint(point, MENU_OPEN_SOURCE_KEYBOARD, triggerElement);
		},
		[mode, openAtElement, openAtPoint]
	);

	const visible = open && menuState.anchor !== null;
	const anchorPoint = useMemo(() => {
		if (!menuState.anchor) return null;

		if (menuState.anchor.type === MENU_ANCHOR_POINT) {
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
