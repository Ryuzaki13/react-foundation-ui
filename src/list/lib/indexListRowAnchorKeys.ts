/** Два направления индекса связывают логическую запись с измеряемым рядом. */
export type ListRowAnchorKeyIndex = Readonly<{
	keys: readonly string[];
	rowIndexes: readonly number[];
	firstKeyIndexes: readonly (number | undefined)[];
}>;

/**
 * Разворачивает identities без изменения исходных записей. После пересборки
 * колонок запись может перейти в другой ряд, сохранив логический scroll anchor.
 */
export function indexListRowAnchorKeys<T>(
	items: readonly T[],
	getAnchorKeys: (item: T, index: number) => readonly string[]
): ListRowAnchorKeyIndex {
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
