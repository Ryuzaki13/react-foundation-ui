import { AnchorHTMLAttributes, ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../ui.module.scss";

import { OptionHotkey } from "./OptionHotkey";
import { OptionIcon } from "./OptionIcon";
import { type OptionCodeChildren, type OptionTextChildren } from "./types";

interface OptionLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
	children: OptionTextChildren | [OptionTextChildren, OptionCodeChildren];
	icon?: ReactNode;
	hotkey?: string;
}

export function OptionLink({ icon, hotkey, children, ...props }: OptionLinkProps) {
	return (
		<a {...props} className={cn(uiStyles.uiPopupOption, props.className)}>
			{icon ? <OptionIcon>{icon}</OptionIcon> : null}
			{children}
			{hotkey && <OptionHotkey>{hotkey}</OptionHotkey>}
		</a>
	);
}
