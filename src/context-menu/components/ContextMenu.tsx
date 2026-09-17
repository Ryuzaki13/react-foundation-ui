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

export function ContextMenu({ children, placement, open, defaultOpen, onOpenChange }: ContextMenuProps) {
	return (
		<MenuRoot mode="contextmenu" placement={placement} open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
			{children}
		</MenuRoot>
	);
}

ContextMenu.Trigger = ContextMenuTrigger;
ContextMenu.Content = MenuContent;
ContextMenu.RadialContent = RadialMenuContent;
ContextMenu.Item = MenuItem;
ContextMenu.RadialItem = RadialMenuItem;
ContextMenu.Separator = MenuSeparator;
ContextMenu.GroupLabel = MenuGroupLabel;
