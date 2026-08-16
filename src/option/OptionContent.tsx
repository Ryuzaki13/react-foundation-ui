import { type ReactNode } from "react";

import { HighlightText } from "../text";
import uiStyles from "../ui.module.scss";

import { OptionCode } from "./OptionCode";
import { OptionHotkey } from "./OptionHotkey";
import { OptionIcon } from "./OptionIcon";
import { OptionText } from "./OptionText";

type OptionBaseContentProps = {
	icon?: ReactNode;
	text: string;
	searchText?: string;
	emphasizeContent?: boolean;
};

type OptionTrailingContent = { code?: string; hotkey?: never } | { code?: never; hotkey?: string };

export type OptionContentProps = OptionBaseContentProps & OptionTrailingContent;

/** Общая фиксированная композиция содержимого button/link опции. */
export function OptionContent({ icon, text, searchText, emphasizeContent, code, hotkey }: OptionContentProps) {
	return (
		<>
			{icon !== undefined && icon !== null ? <OptionIcon>{icon}</OptionIcon> : null}
			<OptionText className={emphasizeContent ? uiStyles.uiOptionContentEmphasize : undefined}>
				<HighlightText text={text} highlight={searchText} />
			</OptionText>
			{code !== undefined && code !== null ? (
				<OptionCode className={emphasizeContent ? uiStyles.uiOptionContentEmphasize : undefined}>
					<HighlightText text={code} highlight={searchText} />
				</OptionCode>
			) : hotkey ? (
				<OptionHotkey>{hotkey}</OptionHotkey>
			) : null}
		</>
	);
}
