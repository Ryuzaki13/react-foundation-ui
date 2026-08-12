import { ReactNode, type HTMLAttributes } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../ui.module.scss";

interface OptionIconProps extends HTMLAttributes<HTMLSpanElement> {
	children: ReactNode;
}

export function OptionIcon(props: OptionIconProps) {
	return <span {...props} className={cn(uiStyles.uiPopupOptionIcon, props.className)} />;
}
