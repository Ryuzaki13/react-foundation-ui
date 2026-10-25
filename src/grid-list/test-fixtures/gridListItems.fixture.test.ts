export type GridListTestItem = {
	readonly id: string;
	readonly group: string;
};

/** Разные группы нужны только там, где тест явно включает группировку. */
export function createGridListTestItems(count: number): readonly GridListTestItem[] {
	return Array.from({ length: count }, (_, index) => ({ id: `item-${index}`, group: index % 2 === 0 ? "even" : "odd" }));
}
