import React, { cloneElement } from "react";

import { assignRef } from "./helpers";
import { useMenuContext } from "./MenuContext";

export interface ContextMenuTriggerProps {
	children: React.ReactElement<React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }>;
	/** Позволяет одному ContextMenu обслуживать множество вложенных целей без отдельного floating-ui runtime на каждую строку или ячейку. */
	resolveTrigger?: (eventTarget: EventTarget | null) => HTMLElement | null;
}

export const ContextMenuTrigger: React.FC<ContextMenuTriggerProps> = ({ children, resolveTrigger }) => {
	const { mode, open, registerTriggerElement, onTriggerContextMenu, onTriggerKeyDown } = useMenuContext();

	if (mode !== "contextmenu") {
		throw new Error("ContextMenu.Trigger must be used within <ContextMenu>");
	}

	return cloneElement(children, {
		ref: (node: HTMLElement | null) => {
			const childRef = (children.props as { ref?: React.Ref<HTMLElement> }).ref;
			assignRef(childRef, node);
			registerTriggerElement(node);
		},
		"aria-haspopup": "menu",
		"aria-expanded": open,
		onContextMenu: (event: React.MouseEvent<HTMLElement>) => {
			children.props.onContextMenu?.(event);
			if (event.defaultPrevented) return;
			const triggerElement = resolveTrigger ? resolveTrigger(event.target) : event.currentTarget;
			if (triggerElement) onTriggerContextMenu(event, triggerElement);
		},
		onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
			children.props.onKeyDown?.(event);
			if (event.defaultPrevented) return;
			const triggerElement = resolveTrigger ? resolveTrigger(event.target) : event.currentTarget;
			if (triggerElement) onTriggerKeyDown(event, triggerElement);
		}
	});
};
