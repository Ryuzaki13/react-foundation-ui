import React, { cloneElement } from "react";

import { assignRef, composeKeyboardHandlers, composeMouseHandlers } from "./helpers";
import { useMenuContext } from "./MenuContext";

export interface ContextMenuTriggerProps {
	children: React.ReactElement<React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }>;
}

export const ContextMenuTrigger: React.FC<ContextMenuTriggerProps> = ({ children }) => {
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
		onContextMenu: composeMouseHandlers(children.props.onContextMenu, onTriggerContextMenu),
		onKeyDown: composeKeyboardHandlers(children.props.onKeyDown, onTriggerKeyDown)
	});
};
