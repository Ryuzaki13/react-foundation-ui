import { type HTMLAttributes, type Ref } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../ui.module.scss";

export interface OptionProps extends HTMLAttributes<HTMLDivElement> {
	ref?: Ref<HTMLDivElement>;
	active?: boolean;
	selected?: boolean;
	disabled?: boolean;
}

/**
 * Неинтерактивная корневая оболочка опции для составных вариантов с собственными
 * действиями. Для обычного действия следует использовать OptionButton/OptionLink.
 */
export function Option({ ref, active, selected, disabled, className, ...props }: OptionProps) {
	return (
		<div
			{...props}
			ref={ref}
			aria-disabled={props["aria-disabled"] ?? (disabled || undefined)}
			className={cn(
				uiStyles.uiPopupOption,
				active && uiStyles.uiPopupOptionActive,
				selected && uiStyles.selected,
				disabled && uiStyles.disabled,
				className
			)}
		/>
	);
}
