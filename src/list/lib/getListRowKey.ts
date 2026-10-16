import { type ListRow } from "../model/listRowTypes";

/** Геометрическая identity строки отделена от логических ключей её записей. */
export function getListRowKey<T>(row: ListRow<T>): string {
	return row.key;
}
