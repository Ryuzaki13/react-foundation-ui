/** Якорь описывает видимую строку, а не её изменяемый индекс в новом наборе. */
export type CollectionScrollAnchor =
	| { readonly type: "start" }
	| {
			readonly type: "item";
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
