import { ReactNode, type HTMLAttributes } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../ui.module.scss";

export interface OptionTextProps extends HTMLAttributes<HTMLSpanElement> {
	children: ReactNode;
	/** Явный текст поиска для произвольного ReactNode, который нельзя извлечь автоматически. */
	searchText?: string;
}

export function OptionText({ searchText, ...props }: OptionTextProps) {
	return <span {...props} data-search-text={searchText} className={cn(uiStyles.uiOptionText, props.className)} />;
}
