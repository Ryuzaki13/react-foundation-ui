import { type ComponentPropsWithoutRef, type ReactNode, type Ref } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { InputControl, InputLoadingFrame } from "../input";
import uiStyles from "../ui.module.scss";

import styles from "./Picker.module.scss";

export interface PickerTriggerInputProps extends Omit<ComponentPropsWithoutRef<"input">, "size"> {
	rootRef?: (node: HTMLDivElement | null) => void;
	endAdornment?: ReactNode;
	overlay?: ReactNode;
	rootClassName?: string;
	inputClassName?: string;
	isLoading?: boolean;
}

export function PickerTriggerInput({
	ref,
	rootRef,
	endAdornment,
	overlay,
	rootClassName,
	inputClassName,
	isLoading,
	...props
}: PickerTriggerInputProps & { ref?: Ref<HTMLInputElement> }) {
	const hasOverlay = overlay !== undefined && overlay !== null;
	// Picker проверяет выбранное значение, поэтому визуальная ошибка следует aria-invalid, а не native :invalid поискового input.
	const isInvalid = props["aria-invalid"] === true || props["aria-invalid"] === "true";

	return (
		<div
			ref={rootRef}
			className={cn(uiStyles.uiInputContainer, styles.triggerContainer, rootClassName)}
			data-has-overlay={hasOverlay || undefined}>
			{isLoading ? (
				<InputLoadingFrame />
			) : (
				<>
					<InputControl endAdornment={endAdornment}>
						{({ controlClassName }) => (
							<input
								{...props}
								ref={ref}
								className={cn(uiStyles.uiInputWithToggle, isInvalid && uiStyles.invalid, controlClassName, inputClassName)}
							/>
						)}
					</InputControl>
					{hasOverlay ? overlay : null}
				</>
			)}
		</div>
	);
}

PickerTriggerInput.displayName = "PickerTriggerInput";
