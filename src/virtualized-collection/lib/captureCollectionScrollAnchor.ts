import { COLLECTION_SCROLL_ANCHOR_START, COLLECTION_SCROLL_ANCHOR_ITEM } from "./collectionScrollAnchorConstants";
import { type CollectionScrollAnchor, type CollectionScrollAnchorMeasurement } from "./collectionScrollAnchorTypes";

/** Верх списка остаётся верхом, даже если перед первой строкой появились новые данные. */
export function captureCollectionScrollAnchor(
	keys: readonly string[],
	measurement: CollectionScrollAnchorMeasurement | undefined,
	scrollOffset: number
): CollectionScrollAnchor {
	if (scrollOffset <= 0 || measurement === undefined || typeof measurement.key !== "string") {
		return { type: COLLECTION_SCROLL_ANCHOR_START };
	}

	return {
		type: COLLECTION_SCROLL_ANCHOR_ITEM,
		key: measurement.key,
		index: measurement.index,
		offset: Math.max(0, scrollOffset - measurement.start),
		previousKeys: keys
	};
}
