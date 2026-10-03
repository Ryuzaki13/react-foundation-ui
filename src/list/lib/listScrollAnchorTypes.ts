/** Якорь описывает видимую строку, а не её изменяемый индекс в новом наборе. */
export type ListScrollAnchor =
	| { readonly type: "start" }
	| {
			readonly type: "item";
			readonly key: string;
			readonly index: number;
			readonly offset: number;
			readonly previousKeys: readonly string[];
	  };

export type ListScrollAnchorMeasurement = {
	readonly key: string | number | bigint;
	readonly index: number;
	readonly start: number;
};

export type ResolvedListScrollAnchor = {
	readonly index: number;
	readonly offset: number;
};
