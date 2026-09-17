import { cloneElement, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactElement, type Ref } from "react";

import { assignRef } from "./helpers";
import { useMenuContext } from "./MenuContext";

export interface ContextMenuTriggerProps {
	children: ReactElement<HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }>;
	/** Позволяет одному ContextMenu обслуживать множество вложенных целей без отдельного floating-ui runtime на каждую строку или ячейку. */
	resolveTrigger?: (eventTarget: EventTarget | null) => HTMLElement | null;
}

export function ContextMenuTrigger({ children, resolveTrigger }: ContextMenuTriggerProps) {
	const { mode, open, menuId, triggerId, registerTriggerElement, onTriggerContextMenu, onTriggerKeyDown } = useMenuContext();

	if (mode !== "contextmenu") {
		throw new Error("ContextMenu.Trigger must be used within <ContextMenu>");
	}

	return cloneElement(children, {
		id: children.props.id ?? triggerId,
		ref: (node: HTMLElement | null) => {
			const childRef = (children.props as { ref?: Ref<HTMLElement> }).ref;
			assignRef(childRef, node);
			registerTriggerElement(node);
		},
		tabIndex: resolveTrigger ? children.props.tabIndex : (children.props.tabIndex ?? 0),
		"aria-haspopup": "menu",
		"aria-controls": open ? menuId : undefined,
		"aria-keyshortcuts": children.props["aria-keyshortcuts"] ?? "Shift+F10",
		onContextMenu: (event: MouseEvent<HTMLElement>) => {
			children.props.onContextMenu?.(event);
			if (event.defaultPrevented) return;
			const triggerElement = resolveTrigger ? resolveTrigger(event.target) : event.currentTarget;
			if (triggerElement) onTriggerContextMenu(event, triggerElement);
		},
		onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
			children.props.onKeyDown?.(event);
			if (event.defaultPrevented) return;
			const triggerElement = resolveTrigger ? resolveTrigger(event.target) : event.currentTarget;
			if (triggerElement) onTriggerKeyDown(event, triggerElement);
		}
	});
}
