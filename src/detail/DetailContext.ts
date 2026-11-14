import { createContext } from "react";

export const DETAIL_SEMANTIC_DESCRIPTION = "detail";
export const DETAIL_SEMANTIC_LIST = "list";
export const DETAIL_VERTICAL_CENTER = "center";

export type DetailType = typeof DETAIL_SEMANTIC_DESCRIPTION | typeof DETAIL_SEMANTIC_LIST;
export type DetailVerticalAlignment = "start" | typeof DETAIL_VERTICAL_CENTER | "end";

export type DetailContextValue = Readonly<{
	semantic?: DetailType;
	inline?: boolean;
	center?: boolean;
	vertical?: DetailVerticalAlignment;
	noWrap?: boolean;
	withColon?: boolean;
}>;

/** Общие параметры отображения, передаваемые от Detail к вложенным Detail.Item без дополнительной DOM-обёртки. */
export const DetailContext = createContext<DetailContextValue>({});
