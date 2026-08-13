import { type AnchorHTMLAttributes, type Ref } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../ui.module.scss";

import { OptionContent, type OptionContentProps } from "./OptionContent";

export type OptionLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> &
	OptionContentProps & { ref?: Ref<HTMLAnchorElement> };

/** Основное link-действие внутри внешней оболочки Option. */
export function OptionLink({ ref, icon, text, searchText, code, hotkey, ...props }: OptionLinkProps) {
	return (
		<a {...props} ref={ref} className={cn(uiStyles.uiOptionLink, props.className)}>
			<OptionContent icon={icon} text={text} searchText={searchText} {...(code !== undefined ? { code } : { hotkey })} />
		</a>
	);
}
