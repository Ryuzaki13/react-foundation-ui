export type TreeColumnsLayoutEntryDescriptor = {
	level: number;
};

/** Границы одной root-группы в исходном DOM preorder. */
export type TreeColumnsRootGroupDescriptor = {
	startIndex: number;
	endIndexExclusive: number;
	protectedPrefixEndIndexExclusive?: number;
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
 * Защищённый prefix создаётся только для root с более чем двумя прямыми
 * видимыми children. Его граница включает строку второго direct child, поэтому
 * вложенные descendants первого child не ошибочно считаются вторым child.
 */
export function buildTreeColumnsLayoutDescriptor(entries: readonly TreeColumnsLayoutEntryDescriptor[]): TreeColumnsLayoutDescriptor {
	const groups: TreeColumnsRootGroupDescriptor[] = [];
	let groupStartIndex = 0;

	while (groupStartIndex < entries.length) {
		let groupEndIndexExclusive = groupStartIndex + 1;
		while (groupEndIndexExclusive < entries.length && entries[groupEndIndexExclusive]?.level !== 0) {
			groupEndIndexExclusive += 1;
		}

		const directChildIndexes: number[] = [];
		for (let index = groupStartIndex + 1; index < groupEndIndexExclusive; index += 1) {
			if (entries[index]?.level === 1) {
				directChildIndexes.push(index);
			}
		}

		groups.push({
			startIndex: groupStartIndex,
			endIndexExclusive: groupEndIndexExclusive,
			...(directChildIndexes.length > 2 ? { protectedPrefixEndIndexExclusive: (directChildIndexes[1] ?? groupStartIndex) + 1 } : {})
		});
		groupStartIndex = groupEndIndexExclusive;
	}

	const signature = groups
		.map(
			({ startIndex, endIndexExclusive, protectedPrefixEndIndexExclusive }) =>
				`${startIndex}:${endIndexExclusive}:${protectedPrefixEndIndexExclusive ?? "-"}`
		)
		.join("|");

	return {
		itemCount: entries.length,
		groups,
		signature: `${entries.length}|${signature}`
	};
}
