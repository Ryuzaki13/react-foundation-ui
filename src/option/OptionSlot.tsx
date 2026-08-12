import { type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../ui.module.scss";

export interface OptionSlotProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
	children: ReactNode;
}

/** Слот перед текстом опции для checkbox, expander или другого действия владельца. */
export function OptionSlot({ className, ...props }: OptionSlotProps) {
	return <span {...props} className={cn(uiStyles.uiOptionSlot, className)} />;
}
