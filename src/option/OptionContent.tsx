import { type ReactNode } from "react";

import { OptionCode } from "./OptionCode";
import { OptionHotkey } from "./OptionHotkey";
import { OptionIcon } from "./OptionIcon";
import { OptionText } from "./OptionText";

type OptionBaseContentProps = {
	icon?: ReactNode;
	text: ReactNode;
	searchText?: string;
};

type OptionTrailingContent = { code?: ReactNode; hotkey?: never } | { code?: never; hotkey?: string };

export type OptionContentProps = OptionBaseContentProps & OptionTrailingContent;

/** Общая фиксированная композиция содержимого button/link опции. */
export function OptionContent({ icon, text, searchText, code, hotkey }: OptionContentProps) {
	return (
		<>
			{icon !== undefined && icon !== null ? <OptionIcon>{icon}</OptionIcon> : null}
			<OptionText searchText={searchText}>{text}</OptionText>
			{code !== undefined && code !== null ? <OptionCode>{code}</OptionCode> : hotkey ? <OptionHotkey>{hotkey}</OptionHotkey> : null}
		</>
	);
}
