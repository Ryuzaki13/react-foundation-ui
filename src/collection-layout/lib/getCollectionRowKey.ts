import { type CollectionRow } from "../model/collectionRowTypes";

/** Геометрическая identity строки отделена от логических ключей её записей. */
export function getCollectionRowKey<T>(row: CollectionRow<T>): string {
	return row.key;
}
