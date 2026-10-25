/** Два направления индекса связывают логическую запись с измеряемым рядом. */
export type CollectionRowAnchorKeyIndex = {
	readonly keys: readonly string[];
	readonly rowIndexes: readonly number[];
	readonly firstKeyIndexes: readonly (number | undefined)[];
};

/**
 * Разворачивает identities без изменения исходных записей. После пересборки
 * колонок запись может перейти в другой ряд, сохранив логический scroll anchor.
 */
export function indexCollectionRowAnchorKeys<T>(
	items: readonly T[],
	getAnchorKeys: (item: T, index: number) => readonly string[]
): CollectionRowAnchorKeyIndex {
	const keys: string[] = [];
	const rowIndexes: number[] = [];
	const firstKeyIndexes: Array<number | undefined> = [];
	for (const [rowIndex, item] of items.entries()) {
		const rowKeys = getAnchorKeys(item, rowIndex);
		firstKeyIndexes.push(rowKeys.length === 0 ? undefined : keys.length);
		for (const key of rowKeys) {
			keys.push(key);
			rowIndexes.push(rowIndex);
		}
	}
	return { keys, rowIndexes, firstKeyIndexes };
}
