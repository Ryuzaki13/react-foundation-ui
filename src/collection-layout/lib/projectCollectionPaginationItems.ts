import { type VirtualItem } from "@tanstack/react-virtual";

import { type CollectionRow } from "../model/collectionRowTypes";

/**
 * Pagination effect сравнивает край с числом исходных записей. Перевод индекса
 * строки в последнюю запись учитывает заголовки и повторно будит догрузку, когда
 * новая страница только заполнила неполную строку без изменения её геометрии.
 */
export function projectCollectionPaginationItems<T>(
	virtualItems: readonly Readonly<VirtualItem>[],
	rowsByKey: ReadonlyMap<string, { readonly row: CollectionRow<T>; readonly index: number }>,
	itemCount: number
): readonly VirtualItem[] {
	return virtualItems.flatMap((virtualItem) => {
		if (typeof virtualItem.key !== "string") return [{ ...virtualItem, index: itemCount }];
		const row = rowsByKey.get(virtualItem.key)?.row;
		if (row === undefined) return [];
		return [{ ...virtualItem, index: row.kind === "group" ? -1 : (row.entries.at(-1)?.position ?? 0) - 1 }];
	});
}
