import { useFetchNextPageEffect } from "@ryuzaki13/react-foundation-lib/virtualizer";
import { type VirtualItem } from "@tanstack/react-virtual";

export type CollectionPaginationEffectProps = {
	readonly virtualItems: readonly VirtualItem[];
	readonly currentItemsCount: number;
	readonly hasNextPage: boolean;
	readonly fetchNextPage: () => Promise<unknown>;
};

/** Подписка существует только в режиме догрузки; полный список не запускает transport effects. */
export function CollectionPaginationEffect(props: CollectionPaginationEffectProps) {
	useFetchNextPageEffect(props);
	return null;
}
