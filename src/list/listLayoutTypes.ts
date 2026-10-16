import { type ReactNode } from "react";

/** Строка содержит не больше count записей; CSS может перенести их на узкой ширине без пересборки источника. */
export type ListColumns = {
	readonly count: number;
	/** Минимальная ширина ячейки в CSS, например var(--ui-width-xl). Без неё колонки равной ширины не переносятся. */
	readonly minItemWidth?: string;
};

/** Группировка плоского источника не требует служебных записей в items и не зависит от числа колонок. */
export type ListGrouping<T> = {
	/** Одинаковые ключи объединяются; порядок групп определяется первым появлением в источнике. */
	readonly getKey: (item: T, index: number) => string;
	/** Заголовок занимает всю ширину; items содержит исходные записи группы в их исходном порядке. */
	readonly render: (groupKey: string, items: readonly T[]) => ReactNode;
};
