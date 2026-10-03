import { type VirtualItem } from "@tanstack/react-virtual";

export type ListVirtualizerOptions<T> = {
	readonly items: readonly T[];
	readonly getKey: (item: T, index: number) => string;
	readonly hasNextPage?: boolean;
	readonly estimateSize?: number;
	readonly overscan?: number;
	readonly preserveScrollAnchor?: boolean;
	readonly resetKey?: string | number | null;
};

/** React получает только геометрию: изменяемый TanStack instance не покидает владельца. */
export type ListVirtualizerSnapshot = {
	readonly virtualItems: readonly Readonly<VirtualItem>[];
	readonly totalSize: number;
};

export type ListVirtualizerResult = ListVirtualizerSnapshot & {
	readonly attachScrollElement: (element: HTMLDivElement | null) => void;
	readonly measureElement: (element: HTMLElement | null) => void;
};

export type ListVirtualizerDriver<T> = {
	readonly subscribe: (listener: () => void) => () => void;
	readonly getSnapshot: () => ListVirtualizerSnapshot;
	readonly getServerSnapshot: () => ListVirtualizerSnapshot;
	readonly mount: () => () => void;
	readonly commit: (options: ListVirtualizerOptions<T>) => void;
	readonly attachScrollElement: (element: HTMLDivElement | null) => void;
	readonly measureElement: (element: HTMLElement | null) => void;
};
