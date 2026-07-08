/* eslint-disable react-refresh/only-export-components */
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

const DropdownMenuRoot: React.FC<DropdownMenuProps> = ({ children, placement, open, defaultOpen, onOpenChange }) => {
	return (
		<MenuRoot mode="click" placement={placement} open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
			{children}
		</MenuRoot>
	);
};

export const DropdownMenu = Object.assign(DropdownMenuRoot, {
	Trigger: DropdownMenuTrigger,
	Content: MenuContent,
	Item: MenuItem,
	Separator: MenuSeparator,
	GroupLabel: MenuGroupLabel
});
