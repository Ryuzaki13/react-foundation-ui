import { type ListScrollAnchor, type ListScrollAnchorMeasurement } from "./listScrollAnchorTypes";

/** Верх списка остаётся верхом, даже если перед первой строкой появились новые данные. */
export function captureListScrollAnchor(
	keys: readonly string[],
	measurement: ListScrollAnchorMeasurement | undefined,
	scrollOffset: number
): ListScrollAnchor {
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
