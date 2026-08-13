import { type ButtonHTMLAttributes, type Ref } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../ui.module.scss";

import { OptionContent, type OptionContentProps } from "./OptionContent";

export type OptionButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children"> &
	OptionContentProps & { ref?: Ref<HTMLButtonElement> };

/** Основное button-действие внутри внешней оболочки Option. */
export function OptionButton({ ref, icon, text, searchText, code, hotkey, ...props }: OptionButtonProps) {
	return (
		<button {...props} ref={ref} type="button" className={cn(uiStyles.uiOptionButton, props.className)}>
			<OptionContent icon={icon} text={text} searchText={searchText} {...(code !== undefined ? { code } : { hotkey })} />
		</button>
	);
}
