/* eslint-disable react-refresh/only-export-components */
import React from "react";

import { Placement } from "@floating-ui/react";

import { ContextMenuTrigger } from "./ContextMenuTrigger";
import { MenuContent } from "./MenuContent";
import { MenuGroupLabel } from "./MenuGroupLabel";
import { MenuItem } from "./MenuItem";
import { MenuRoot } from "./MenuRoot";
import { MenuSeparator } from "./MenuSeparator";
import { RadialMenuContent } from "./RadialMenuContent";
import { RadialMenuItem } from "./RadialMenuItem";

export interface ContextMenuProps {
	children: React.ReactNode;
	placement?: Placement;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}

const ContextMenuRoot: React.FC<ContextMenuProps> = ({ children, placement, open, defaultOpen, onOpenChange }) => {
	return (
		<MenuRoot mode="contextmenu" placement={placement} open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
			{children}
		</MenuRoot>
	);
};

export const ContextMenu = Object.assign(ContextMenuRoot, {
	Trigger: ContextMenuTrigger,
	Content: MenuContent,
	RadialContent: RadialMenuContent,
	Item: MenuItem,
	RadialItem: RadialMenuItem,
	Separator: MenuSeparator,
	GroupLabel: MenuGroupLabel
});
