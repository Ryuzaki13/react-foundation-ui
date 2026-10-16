import { type ListRow } from "../model/listRowTypes";

/** Интересы consumer относятся к исходным записям измеряемой строки, без служебных заголовков. */
export function getListRowVisibleKeys<T>(row: ListRow<T>): readonly string[] {
	return row.kind === "group" ? [] : row.entries.map((entry) => entry.key);
}
