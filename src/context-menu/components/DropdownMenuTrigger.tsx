import React, { cloneElement } from "react";

import { assignRef, composeKeyboardHandlers, composeMouseHandlers } from "./helpers";
import { useMenuContext } from "./MenuContext";

export interface DropdownMenuTriggerProps {
	children: React.ReactElement<React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }>;
}

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ children }) => {
	const { mode, open, registerTriggerElement, onTriggerClick, onTriggerKeyDown } = useMenuContext();

	if (mode !== "click") {
		throw new Error("DropdownMenu.Trigger must be used within <DropdownMenu>");
	}

	return cloneElement(children, {
		ref: (node: HTMLElement | null) => {
			const childRef = (children.props as { ref?: React.Ref<HTMLElement> }).ref;
			assignRef(childRef, node);
			registerTriggerElement(node);
		},
		"aria-haspopup": "menu",
		"aria-expanded": open,
		onClick: composeMouseHandlers(children.props.onClick, onTriggerClick),
		onKeyDown: composeKeyboardHandlers(children.props.onKeyDown, onTriggerKeyDown)
	});
};
