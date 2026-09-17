import { cloneElement, type HTMLAttributes, type ReactElement, type Ref } from "react";

import { assignRef, composeKeyboardHandlers, composeMouseHandlers } from "./helpers";
import { useMenuContext } from "./MenuContext";

export interface DropdownMenuTriggerProps {
	children: ReactElement<HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }>;
}

export function DropdownMenuTrigger({ children }: DropdownMenuTriggerProps) {
	const { mode, open, menuId, triggerId, registerTriggerElement, onTriggerClick, onTriggerKeyDown } = useMenuContext();

	if (mode !== "click") {
		throw new Error("DropdownMenu.Trigger must be used within <DropdownMenu>");
	}

	return cloneElement(children, {
		id: children.props.id ?? triggerId,
		ref: (node: HTMLElement | null) => {
			const childRef = (children.props as { ref?: Ref<HTMLElement> }).ref;
			assignRef(childRef, node);
			registerTriggerElement(node);
		},
		"aria-haspopup": "menu",
		"aria-expanded": open,
		"aria-controls": open ? menuId : undefined,
		onClick: composeMouseHandlers(children.props.onClick, onTriggerClick),
		onKeyDown: composeKeyboardHandlers(children.props.onKeyDown, onTriggerKeyDown)
	});
}
