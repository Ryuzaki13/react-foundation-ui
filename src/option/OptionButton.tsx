import { type ButtonHTMLAttributes, type Ref } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../ui.module.scss";

import { OptionContent, type OptionContentProps } from "./OptionContent";

export type OptionButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children"> &
	OptionContentProps & {
		ref?: Ref<HTMLButtonElement>;
		active?: boolean;
		selected?: boolean;
	};

export function OptionButton({ ref, icon, slot, text, searchText, code, hotkey, active, selected, ...props }: OptionButtonProps) {
	return (
		<button
			{...props}
			ref={ref}
			type="button"
			className={cn(
				uiStyles.uiPopupOption,
				active && uiStyles.uiPopupOptionActive,
				selected && uiStyles.selected,
				props.disabled && uiStyles.disabled,
				props.className
			)}>
			<OptionContent icon={icon} slot={slot} text={text} searchText={searchText} {...(code !== undefined ? { code } : { hotkey })} />
		</button>
	);
}
