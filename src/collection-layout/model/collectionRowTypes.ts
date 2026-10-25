/** Исходная identity и индекс сохраняются при группировке, position относится к отображаемому порядку списка. */
export type CollectionRowEntry<T> = {
	readonly item: T;
	readonly key: string;
	readonly index: number;
	readonly position: number;
};

/** Виртуализатор измеряет целую строку; заголовок не считается пользовательской записью. */
export type CollectionRow<T> =
	| { readonly kind: "items"; readonly key: string; readonly entries: readonly CollectionRowEntry<T>[] }
	| { readonly kind: "group"; readonly key: string; readonly groupKey: string; readonly items: readonly T[] };

export type CollectionRows<T> = {
	readonly rows: readonly CollectionRow<T>[];
	readonly itemCount: number;
};
