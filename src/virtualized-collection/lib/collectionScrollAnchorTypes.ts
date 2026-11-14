import { type COLLECTION_SCROLL_ANCHOR_START, type COLLECTION_SCROLL_ANCHOR_ITEM } from "./collectionScrollAnchorConstants";
/** Якорь описывает видимую строку, а не её изменяемый индекс в новом наборе. */
export type CollectionScrollAnchor =
	| { readonly type: typeof COLLECTION_SCROLL_ANCHOR_START }
	| {
			readonly type: typeof COLLECTION_SCROLL_ANCHOR_ITEM;
			readonly key: string;
			readonly index: number;
			readonly offset: number;
			readonly previousKeys: readonly string[];
	  };

export type CollectionScrollAnchorMeasurement = {
	readonly key: string | number | bigint;
	readonly index: number;
	readonly start: number;
};

export type ResolvedCollectionScrollAnchor = {
	readonly index: number;
	readonly offset: number;
};
