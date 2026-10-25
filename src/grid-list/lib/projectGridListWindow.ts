import { type VirtualItem } from "@tanstack/react-virtual";

import { type CollectionRow } from "../../collection-layout/model/collectionRowTypes";
import { type GridListVirtualRow } from "../model/gridListContentModelTypes";

/**
 * Между render новой упаковки и commit virtualizer прежние geometric row keys
 * уже не описывают новые ряды. Проекция всех логических ключей прежнего окна
 * сохраняет обе его границы: ни одна смонтированная карточка не пропадает на
 * промежуточный commit лишь потому, что стала первой в другом ряду.
 */
export function projectGridListWindow<T>(
	rows: readonly CollectionRow<T>[],
	rowIndexesByAnchor: ReadonlyMap<string, number>,
	anchorKeys: readonly string[],
	virtualItems: readonly Readonly<VirtualItem>[],
	hasNextPage: boolean
): readonly GridListVirtualRow<T>[] {
	const indexes = new Set<number>();
	for (const key of anchorKeys) {
		const index = rowIndexesByAnchor.get(key);
		if (index === undefined) continue;
		indexes.add(index);
	}
	const result: GridListVirtualRow<T>[] = [];
	// Произвольная сортировка может разнести прежние карточки на тысячи рядов.
	// Переходное окно сохраняет только затронутые ряды, не монтируя весь промежуток.
	for (const index of [...indexes].sort((left, right) => left - right)) {
		const row = rows[index];
		if (row !== undefined) result.push({ key: row.key, index, row });
	}
	const sentinel = virtualItems.find((item) => typeof item.key !== "string");
	if (hasNextPage && sentinel !== undefined) result.push({ key: sentinel.key, index: rows.length, row: undefined });
	return result;
}
