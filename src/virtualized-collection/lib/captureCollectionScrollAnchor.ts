import { type CollectionScrollAnchor, type CollectionScrollAnchorMeasurement } from "./collectionScrollAnchorTypes";

/** Верх списка остаётся верхом, даже если перед первой строкой появились новые данные. */
export function captureCollectionScrollAnchor(
	keys: readonly string[],
	measurement: CollectionScrollAnchorMeasurement | undefined,
	scrollOffset: number
): CollectionScrollAnchor {
	if (scrollOffset <= 0 || measurement === undefined || typeof measurement.key !== "string") {
		return { type: "start" };
	}

	return {
		type: "item",
		key: measurement.key,
		index: measurement.index,
		offset: Math.max(0, scrollOffset - measurement.start),
		previousKeys: keys
	};
}
