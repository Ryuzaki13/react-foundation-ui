import { type VirtualItem } from "@tanstack/react-virtual";

import { type CollectionRow } from "../../collection-layout/model/collectionRowTypes";
import { type CollectionVirtualizerResult } from "../../virtualized-collection/model/collectionVirtualizerTypes";

export type GridListVirtualRow<T> = {
	readonly key: string | number | bigint;
	readonly index: number;
	readonly row: CollectionRow<T> | undefined;
};

export type GridListContentModel<T> = Pick<CollectionVirtualizerResult, "totalSize" | "attachScrollElement" | "measureElement"> & {
	readonly attachProbe: (element: HTMLElement | null) => void;
	readonly attachMetricsProbe: (element: HTMLElement | null) => void;
	readonly paddingStart: number;
	readonly columnCount: number;
	readonly itemCount: number;
	readonly virtualRows: readonly GridListVirtualRow<T>[];
	readonly paginationItems: readonly VirtualItem[];
};
