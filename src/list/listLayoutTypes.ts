import { type CollectionGrouping } from "../collection-layout/model/collectionLayoutTypes";

/** Строка содержит не больше count записей; CSS может перенести их на узкой ширине без пересборки источника. */
export type ListColumns = {
	readonly count: number;
	/** Минимальная ширина ячейки в CSS, например var(--ui-width-xl). Без неё колонки равной ширины не переносятся. */
	readonly minItemWidth?: string;
};

/** Опубликованный контракт группировки общего источника коллекций. */
export type ListGrouping<T> = CollectionGrouping<T>;
