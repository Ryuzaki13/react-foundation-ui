import { ComponentPropsWithoutRef, forwardRef, ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { InputControl } from "../input";
import uiStyles from "../ui.module.scss";

import styles from "./Picker.module.scss";

interface PickerTriggerInputProps extends Omit<ComponentPropsWithoutRef<"input">, "size"> {
	rootRef?: (node: HTMLDivElement | null) => void;
	endAdornment?: ReactNode;
	overlay?: ReactNode;
	rootClassName?: string;
	inputClassName?: string;
}

export const PickerTriggerInput = forwardRef<HTMLInputElement, PickerTriggerInputProps>(
	({ rootRef, endAdornment, overlay, rootClassName, inputClassName, ...props }, ref) => {
		return (
			<div ref={rootRef} className={cn(uiStyles.uiInputContainer, styles.triggerContainer, rootClassName)}>
				<InputControl endAdornment={endAdornment}>
					{({ controlClassName }) => (
						<input {...props} ref={ref} className={cn(uiStyles.uiInputWithToggle, controlClassName, inputClassName)} />
					)}
				</InputControl>
				{overlay}
			</div>
		);
	}
);

PickerTriggerInput.displayName = "PickerTriggerInput";
