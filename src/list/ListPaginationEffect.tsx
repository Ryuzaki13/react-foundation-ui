import { useFetchNextPageEffect } from "@ryuzaki13/react-foundation-lib/virtualizer";

import type { VirtualItem } from "@tanstack/react-virtual";

export interface ListPaginationEffectProps {
	readonly virtualItems: readonly VirtualItem[];
	readonly currentItemsCount: number;
	readonly hasNextPage: boolean;
	readonly fetchNextPage: () => Promise<unknown>;
}

/** Подписка существует только в режиме догрузки; полный список не запускает transport effects. */
export function ListPaginationEffect(props: ListPaginationEffectProps) {
	useFetchNextPageEffect(props);
	return null;
}
