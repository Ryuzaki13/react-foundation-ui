import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../../ui.module.scss";

export interface MenuSeparatorProps {
	className?: string;
}

export function MenuSeparator({ className }: MenuSeparatorProps) {
	return <div role="separator" className={cn(uiStyles.uiPopupOptionSeparator, className)} />;
}
