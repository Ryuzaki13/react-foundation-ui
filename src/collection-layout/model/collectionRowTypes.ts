import { COLLECTION_ROW_KIND_GROUP, COLLECTION_ROW_KIND_ITEMS } from "./collectionRowConstants";
/** Исходная identity и индекс сохраняются при группировке, position относится к отображаемому порядку списка. */
export type CollectionRowEntry<T> = {
	readonly item: T;
	readonly key: string;
	readonly index: number;
	readonly position: number;
};

/** Виртуализатор измеряет целую строку; заголовок не считается пользовательской записью. */
export type CollectionRow<T> =
	| { readonly kind: typeof COLLECTION_ROW_KIND_ITEMS; readonly key: string; readonly entries: readonly CollectionRowEntry<T>[] }
	| { readonly kind: typeof COLLECTION_ROW_KIND_GROUP; readonly key: string; readonly groupKey: string; readonly items: readonly T[] };

export type CollectionRows<T> = {
	readonly rows: readonly CollectionRow<T>[];
	readonly itemCount: number;
};
