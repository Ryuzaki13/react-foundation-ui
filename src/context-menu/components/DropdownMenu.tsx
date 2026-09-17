import React from "react";

import { Placement } from "@floating-ui/react";

import { DropdownMenuTrigger } from "./DropdownMenuTrigger";
import { MenuContent } from "./MenuContent";
import { MenuGroupLabel } from "./MenuGroupLabel";
import { MenuItem } from "./MenuItem";
import { MenuRoot } from "./MenuRoot";
import { MenuSeparator } from "./MenuSeparator";

export interface DropdownMenuProps {
	children: React.ReactNode;
	placement?: Placement;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function DropdownMenu({ children, placement, open, defaultOpen, onOpenChange }: DropdownMenuProps) {
	return (
		<MenuRoot mode="click" placement={placement} open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
			{children}
		</MenuRoot>
	);
}

DropdownMenu.Trigger = DropdownMenuTrigger;
DropdownMenu.Content = MenuContent;
DropdownMenu.Item = MenuItem;
DropdownMenu.Separator = MenuSeparator;
DropdownMenu.GroupLabel = MenuGroupLabel;
