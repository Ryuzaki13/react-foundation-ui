import { ODataDependentSegmentItem, sortODataDependentSegmentItemsByChains } from "@ryuzaki13/react-foundation-api/odata";
import { ODataChainsMap } from "@ryuzaki13/react-foundation-lib/odata-service";

export function resolveOrderedTreeSegmentItems(items: readonly ODataDependentSegmentItem[], chains: ODataChainsMap) {
	return sortODataDependentSegmentItemsByChains(items, chains);
}
