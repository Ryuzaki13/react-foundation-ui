import { type HTMLAttributes } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../ui.module.scss";

export interface OptionHotkeyProps extends HTMLAttributes<HTMLElement> {
	children: string;
}

export function OptionHotkey(props: OptionHotkeyProps) {
	return <kbd {...props} className={cn(uiStyles.keyboard, props.className)} />;
}
