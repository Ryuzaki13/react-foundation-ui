import { COLLECTION_ROW_KIND_GROUP } from "../model/collectionRowConstants";
import { type CollectionRow } from "../model/collectionRowTypes";

/** При пересборке колонок якорь следует за записью, даже если она больше не первая в строке. */
export function getCollectionRowAnchorKeys<T>(row: CollectionRow<T>): readonly string[] {
	return row.kind === COLLECTION_ROW_KIND_GROUP ? [row.key] : row.entries.map((entry) => JSON.stringify(["item", entry.key]));
}
