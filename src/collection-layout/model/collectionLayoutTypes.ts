import { type ReactNode } from "react";

/** Группировка плоского источника не требует служебных записей в items и не зависит от числа колонок. */
export type CollectionGrouping<T> = {
	/** Одинаковые ключи объединяются; порядок групп определяется первым появлением в источнике. */
	readonly getKey: (item: T, index: number) => string;
	/** Заголовок занимает всю ширину; items содержит исходные записи группы в их исходном порядке. */
	readonly render: (groupKey: string, items: readonly T[]) => ReactNode;
};

/** Чистая упаковка не зависит от CSS: владелец передаёт уже определённое число колонок. */
export type CollectionLayoutOptions<T> = {
	readonly items: readonly T[];
	readonly getKey: (item: T, index: number) => string;
	readonly columns?: { readonly count: number };
	readonly grouping?: CollectionGrouping<T>;
};
