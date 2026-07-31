export type TreeColumnsLayoutEntryDescriptor = {
	level: number;
};

/** Границы одной root-группы в исходном DOM preorder. */
export type TreeColumnsRootGroupDescriptor = {
	startIndex: number;
	endIndexExclusive: number;
};

/** Структурный вход columns-resolver и стабильная сигнатура для Floating UI. */
export type TreeColumnsLayoutDescriptor = {
	itemCount: number;
	groups: readonly TreeColumnsRootGroupDescriptor[];
	signature: string;
};

/**
 * Описывает root-группы видимой части дерева, не меняя исходный preorder.
 *
 * Descriptor хранит только границы root-групп. Минимальное число строк,
 * необходимое для начала группы в текущем столбце, является invariant packing
 * и вычисляется resolver-ом без привязки к глубине отдельных descendants.
 */
export function buildTreeColumnsLayoutDescriptor(entries: readonly TreeColumnsLayoutEntryDescriptor[]): TreeColumnsLayoutDescriptor {
	const groups: TreeColumnsRootGroupDescriptor[] = [];
	let groupStartIndex = 0;

	while (groupStartIndex < entries.length) {
		let groupEndIndexExclusive = groupStartIndex + 1;
		while (groupEndIndexExclusive < entries.length && entries[groupEndIndexExclusive]?.level !== 0) {
			groupEndIndexExclusive += 1;
		}

		groups.push({
			startIndex: groupStartIndex,
			endIndexExclusive: groupEndIndexExclusive
		});
		groupStartIndex = groupEndIndexExclusive;
	}

	const signature = groups.map(({ startIndex, endIndexExclusive }) => `${startIndex}:${endIndexExclusive}`).join("|");

	return {
		itemCount: entries.length,
		groups,
		signature: `${entries.length}|${signature}`
	};
}
