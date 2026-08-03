import { ODataDependentSegmentItem, sortODataDependentSegmentItemsByChains } from "@ryuzaki13/react-foundation-api/odata";
import { ODataChainsMap } from "@ryuzaki13/react-foundation-lib/odata-service";

export function resolveOrderedTreeSegmentItems(
	items: readonly ODataDependentSegmentItem[],
	chains: ODataChainsMap,
	segmentOrder?: readonly string[]
) {
	return sortODataDependentSegmentItemsByChains(items, chains, segmentOrder);
}
