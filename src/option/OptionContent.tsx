import { type ReactNode } from "react";

import { OptionCode } from "./OptionCode";
import { OptionHotkey } from "./OptionHotkey";
import { OptionIcon } from "./OptionIcon";
import { OptionSlot } from "./OptionSlot";
import { OptionText } from "./OptionText";

type OptionBaseContentProps = {
	icon?: ReactNode;
	slot?: ReactNode;
	text: ReactNode;
	searchText?: string;
};

type OptionTrailingContent = { code?: ReactNode; hotkey?: never } | { code?: never; hotkey?: string };

export type OptionContentProps = OptionBaseContentProps & OptionTrailingContent;

/** Общая фиксированная композиция содержимого button/link опции. */
export function OptionContent({ icon, slot, text, searchText, code, hotkey }: OptionContentProps) {
	return (
		<>
			{icon !== undefined && icon !== null ? <OptionIcon>{icon}</OptionIcon> : null}
			{slot !== undefined && slot !== null ? <OptionSlot>{slot}</OptionSlot> : null}
			<OptionText searchText={searchText}>{text}</OptionText>
			{code !== undefined && code !== null ? <OptionCode>{code}</OptionCode> : hotkey ? <OptionHotkey>{hotkey}</OptionHotkey> : null}
		</>
	);
}
