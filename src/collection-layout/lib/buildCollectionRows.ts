import { type CollectionLayoutOptions } from "../model/collectionLayoutTypes";
import { type CollectionRow, type CollectionRowEntry, type CollectionRows } from "../model/collectionRowTypes";

/**
 * Единственная проекция для обоих Content. Группы собираются до разбиения на
 * строки, поэтому неполный хвост никогда не заполняется элементом другой группы.
 * JSON-кортежи разделяют пространства служебных ключей без коллизий разделителей.
 */
export function buildCollectionRows<T>({ items, getKey, columns, grouping }: CollectionLayoutOptions<T>): CollectionRows<T> {
	const count = columns?.count ?? 1;
	if (!Number.isSafeInteger(count) || count < 1)
		throw new RangeError("Collection: columns.count должен быть положительным целым числом.");
	const groups = new Map<string, CollectionRowEntry<T>[]>();
	items.forEach((item, index) => {
		const groupKey = grouping?.getKey(item, index) ?? "";
		const entry = { item, key: getKey(item, index), index, position: 0 };
		const entries = groups.get(groupKey);
		if (entries) entries.push(entry);
		else groups.set(groupKey, [entry]);
	});
	const rows: CollectionRow<T>[] = [];
	let position = 0;
	for (const [groupKey, sourceEntries] of groups) {
		if (grouping) {
			rows.push({
				kind: "group",
				key: JSON.stringify(["group", groupKey]),
				groupKey,
				items: sourceEntries.map((entry) => entry.item)
			});
		}
		for (let offset = 0; offset < sourceEntries.length; offset += count) {
			const entries = sourceEntries.slice(offset, offset + count).map((entry) => ({ ...entry, position: ++position }));
			const first = entries[0];
			if (first === undefined) continue;
			rows.push({
				kind: "items",
				// Без новых настроек сохраняем опубликованную React identity одиночной записи.
				key: grouping || columns ? JSON.stringify(["items", groupKey, first.key]) : first.key,
				entries
			});
		}
	}
	return { rows, itemCount: items.length };
}
