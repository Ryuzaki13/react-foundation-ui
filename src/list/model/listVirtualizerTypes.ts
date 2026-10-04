import { type VirtualItem } from "@tanstack/react-virtual";

export type ListVirtualizerOptions<T> = Readonly<{
	items: readonly T[];
	getKey: (item: T, index: number) => string;
	hasNextPage?: boolean;
	estimateSize?: number;
	overscan?: number;
	preserveScrollAnchor?: boolean;
	resetKey?: string | number | null;
	onVisibleKeysChange?: (keys: readonly string[]) => void;
}>;

/** React получает только геометрию: изменяемый TanStack instance не покидает владельца. */
export type ListVirtualizerSnapshot = Readonly<{
	virtualItems: readonly Readonly<VirtualItem>[];
	totalSize: number;
}>;

export type ListVirtualizerResult = ListVirtualizerSnapshot &
	Readonly<{
		attachScrollElement: (element: HTMLDivElement | null) => void;
		measureElement: (element: HTMLElement | null) => void;
	}>;

export type ListVirtualizerDriver<T> = Readonly<{
	subscribe: (listener: () => void) => () => void;
	getSnapshot: () => ListVirtualizerSnapshot;
	getServerSnapshot: () => ListVirtualizerSnapshot;
	mount: () => () => void;
	commit: (options: ListVirtualizerOptions<T>) => void;
	attachScrollElement: (element: HTMLDivElement | null) => void;
	measureElement: (element: HTMLElement | null) => void;
}>;
