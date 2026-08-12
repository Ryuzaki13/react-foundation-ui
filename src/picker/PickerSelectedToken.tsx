import { type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "./Picker.module.scss";

export interface PickerSelectedTokenProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
	children: ReactNode;
}

/** Единое визуальное представление выбранного значения внутри picker-trigger. */
export function PickerSelectedToken({ children, className, ...props }: PickerSelectedTokenProps) {
	return (
		<span {...props} className={cn(styles.selectedToken, className)} data-ui="picker-selected-token">
			{children}
		</span>
	);
}
