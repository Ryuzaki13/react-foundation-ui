import { COLLECTION_ROW_KIND_GROUP } from "../model/collectionRowConstants";
import { type CollectionRow } from "../model/collectionRowTypes";

/** Интересы consumer относятся к исходным записям измеряемой строки, без служебных заголовков. */
export function getCollectionRowVisibleKeys<T>(row: CollectionRow<T>): readonly string[] {
	return row.kind === COLLECTION_ROW_KIND_GROUP ? [] : row.entries.map((entry) => entry.key);
}
