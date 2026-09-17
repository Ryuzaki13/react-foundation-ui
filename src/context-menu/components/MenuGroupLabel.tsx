import React from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../../ui.module.scss";

export interface MenuGroupLabelProps {
	children: React.ReactNode;
	className?: string;
}

export function MenuGroupLabel({ children, className }: MenuGroupLabelProps) {
	return <div className={cn(uiStyles.uiPopupGroupLabel, className)}>{children}</div>;
}
