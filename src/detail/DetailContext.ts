import { createContext } from "react";

export type DetailType = "detail" | "list";

export type DetailContextValue = Readonly<{
	semantic?: DetailType;
	inline?: boolean;
	center?: boolean;
	vertical?: "start" | "center" | "end";
	noWrap?: boolean;
	withColon?: boolean;
}>;

/** Общие параметры отображения, передаваемые от Detail к вложенным Detail.Item без дополнительной DOM-обёртки. */
export const DetailContext = createContext<DetailContextValue>({});
