import { type ListTestItem } from "./listTestItemTypes";

/** Предметно независимые стабильные ключи: индексы видимых строк не используются как identity. */
export function createListTestItems(count: number): readonly ListTestItem[] {
	return Array.from({ length: count }, (_, index) => ({ id: `item-${index}`, label: `Элемент ${index}` }));
}
