import { type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../ui.module.scss";

import { OptionHotkey } from "./OptionHotkey";
import { OptionIcon } from "./OptionIcon";
import { type OptionCodeChildren, type OptionTextChildren } from "./types";

interface OptionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children"> {
	children: OptionTextChildren | [OptionTextChildren, OptionCodeChildren];
	icon?: ReactNode;
	hotkey?: string;

	active?: boolean;
	selected?: boolean;
}

export function OptionButton({ icon, hotkey, active, selected, children, ...props }: OptionButtonProps) {
	return (
		<button
			{...props}
			type="button"
			className={cn(
				uiStyles.uiPopupOption,
				active && uiStyles.uiPopupOptionActive,
				selected && uiStyles.selected,
				props.disabled && uiStyles.disabled,
				props.className
			)}>
			{icon ? <OptionIcon>{icon}</OptionIcon> : null}
			{children}
			{hotkey && <OptionHotkey>{hotkey}</OptionHotkey>}
		</button>
	);
}
