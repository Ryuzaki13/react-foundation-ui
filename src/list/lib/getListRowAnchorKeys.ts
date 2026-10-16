import { type ListRow } from "../model/listRowTypes";

/** При пересборке колонок якорь следует за записью, даже если она больше не первая в строке. */
export function getListRowAnchorKeys<T>(row: ListRow<T>): readonly string[] {
	return row.kind === "group" ? [row.key] : row.entries.map((entry) => JSON.stringify(["item", entry.key]));
}
