import React from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../../ui.module.scss";

export interface MenuSeparatorProps {
	className?: string;
}

export const MenuSeparator: React.FC<MenuSeparatorProps> = ({ className }) => {
	return <div role="separator" className={cn(uiStyles.uiPopupOptionSeparator, className)} />;
};
