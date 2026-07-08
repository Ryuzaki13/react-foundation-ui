import { useMemo } from "react";

import {
	flattenODataDependentServices,
	ODataCollectionModel,
	ODataDependentBaseProps,
	ODataDependentSegmentItem,
	useODataCollection,
	useODataCollectionChains,
	useODataCollectionModel
} from "@ryuzaki13/react-foundation-api/odata";

import { buildODataTreeNodes } from "./buildODataTreeNodes";
import { resolveOrderedTreeSegmentItems } from "./resolveOrderedTreeSegmentItems";

function buildOrderedSegmentItems(
	odata: ODataDependentBaseProps["odata"],
	segments: ODataDependentBaseProps["segments"],
	model?: Omit<ODataCollectionModel, "codeKey">
) {
	return flattenODataDependentServices([
		{
			odata,
			segments,
			model
		}
	]);
}

function getRootCodeKey(orderedSegmentItems: readonly ODataDependentSegmentItem[]) {
	return orderedSegmentItems[0]?.id;
}

export function useODataTreeData({ odata, segments, model }: Pick<ODataDependentBaseProps, "odata" | "segments" | "model">) {
	const serviceKey = `${odata.service}.${odata.target}`;
	const baseSegmentItems = useMemo(() => buildOrderedSegmentItems(odata, segments, model), [odata, segments, model]);
	const chains = useODataCollectionChains([odata]);
	const orderedSegmentItems = useMemo(() => resolveOrderedTreeSegmentItems(baseSegmentItems, chains), [baseSegmentItems, chains]);
	const orderedCodeKeys = useMemo(() => orderedSegmentItems.map((item) => item.id), [orderedSegmentItems]);
	const rootCodeKey = getRootCodeKey(orderedSegmentItems) ?? Object.keys(segments)[0];
	const odataModel = useODataCollectionModel({
		codeKey: rootCodeKey,
		...model
	});
	const collection = useODataCollection({
		odata,
		model: odataModel
	});
	const { hiddenCodeKeys, textValueCodeKeys } = useMemo(() => {
		const nextHiddenCodeKeys = new Set<string>();
		const nextTextValueCodeKeys = new Set<string>();

		for (const item of orderedSegmentItems) {
			if (item.segment.hideCode ?? odata.hideCode) {
				nextHiddenCodeKeys.add(item.id);
			}
			if (item.segment.selectText) {
				nextTextValueCodeKeys.add(item.id);
			}
		}

		return {
			hiddenCodeKeys: nextHiddenCodeKeys,
			textValueCodeKeys: nextTextValueCodeKeys
		};
	}, [odata.hideCode, orderedSegmentItems]);
	const nodes = useMemo(
		() =>
			buildODataTreeNodes({
				items: collection.data?.items ?? [],
				orderedCodeKeys,
				keyPairsMap: collection.data?.keyPairsMap ?? {},
				hiddenCodeKeys,
				textValueCodeKeys
			}),
		[collection.data?.items, collection.data?.keyPairsMap, hiddenCodeKeys, orderedCodeKeys, textValueCodeKeys]
	);
	const placeholder = orderedSegmentItems[0]?.segment.placeholder ?? "Выберите значение";
	const hasResolvedChain = Boolean(chains[serviceKey]?.length);

	return {
		nodes,
		orderedSegmentItems,
		orderedCodeKeys,
		isLoading: collection.isLoading,
		isError: collection.isError,
		placeholder,
		hasResolvedChain
	};
}
