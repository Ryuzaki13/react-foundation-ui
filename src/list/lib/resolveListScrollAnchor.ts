import { type ListScrollAnchor, type ResolvedListScrollAnchor } from "./listScrollAnchorTypes";

/**
 * При исчезновении якоря выбирает ближайшую сохранившуюся строку прежнего порядка.
 * Равное расстояние разрешается в пользу следующей строки: удалённое место
 * естественно занимает её преемник, но строка слева не теряется при удалении хвоста.
 */
export function resolveListScrollAnchor(anchor: ListScrollAnchor, keys: readonly string[]): ResolvedListScrollAnchor | null {
	if (anchor.type === "start" || keys.length === 0) return null;

	const currentIndexes = new Map(keys.map((key, index) => [key, index]));
	const currentIndex = currentIndexes.get(anchor.key);
	if (currentIndex !== undefined) return { index: currentIndex, offset: anchor.offset };

	for (let distance = 1; distance < anchor.previousKeys.length; distance += 1) {
		const nextKey = anchor.previousKeys[anchor.index + distance];
		const nextIndex = nextKey === undefined ? undefined : currentIndexes.get(nextKey);
		if (nextIndex !== undefined) return { index: nextIndex, offset: anchor.offset };

		const previousKey = anchor.previousKeys[anchor.index - distance];
		const previousIndex = previousKey === undefined ? undefined : currentIndexes.get(previousKey);
		if (previousIndex !== undefined) return { index: previousIndex, offset: anchor.offset };
	}

	return null;
}
