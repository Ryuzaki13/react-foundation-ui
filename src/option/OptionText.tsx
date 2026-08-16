import { type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../ui.module.scss";

export interface OptionTextProps extends HTMLAttributes<HTMLSpanElement> {
	children: ReactNode;
}

export function OptionText(props: OptionTextProps) {
	return <span {...props} className={cn(uiStyles.uiOptionText, props.className)}></span>;
}
