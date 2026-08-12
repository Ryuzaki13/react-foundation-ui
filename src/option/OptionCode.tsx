import { ReactNode, type HTMLAttributes } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../ui.module.scss";

export interface OptionCodeProps extends HTMLAttributes<HTMLSpanElement> {
	children: ReactNode;
}

export function OptionCode(props: OptionCodeProps) {
	return <span {...props} className={cn(uiStyles.uiOptionCode, props.className)} />;
}
