/** Исходная identity и индекс сохраняются при группировке, position относится к отображаемому порядку списка. */
export type ListRowEntry<T> = {
	readonly item: T;
	readonly key: string;
	readonly index: number;
	readonly position: number;
};

/** Виртуализатор измеряет целую строку; заголовок не считается пользовательской записью. */
export type ListRow<T> =
	| { readonly kind: "items"; readonly key: string; readonly entries: readonly ListRowEntry<T>[] }
	| { readonly kind: "group"; readonly key: string; readonly groupKey: string; readonly items: readonly T[] };

export type ListRows<T> = {
	readonly rows: readonly ListRow<T>[];
	readonly itemCount: number;
};
