import {
	PAGINATION_ITEM_KIND_PAGE,
	PAGINATION_ITEM_KIND_GAP,
	PAGINATION_GAP_POSITION_BEFORE,
	PAGINATION_GAP_POSITION_AFTER
} from "./paginationConstants";
import { type PaginationItem, type PaginationModel } from "./paginationModel";

const FULL_PAGE_LIMIT = 7;
const EDGE_PAGE_COUNT = 4;

/**
 * Строит ограниченную навигацию независимо от размера набора.
 * При сокращении набора выбранный номер ограничивается последней страницей;
 * публикация нового номера остаётся явным действием потребителя.
 */
export function createPaginationModel(page: number, pageCount: number): PaginationModel {
	if (!Number.isSafeInteger(page) || page < 1) {
		throw new RangeError("Номер страницы должен быть положительным безопасным целым числом.");
	}

	if (!Number.isSafeInteger(pageCount) || pageCount < 0) {
		throw new RangeError("Количество страниц должно быть неотрицательным безопасным целым числом.");
	}

	const currentPage = Math.min(page, Math.max(1, pageCount));

	if (pageCount <= FULL_PAGE_LIMIT) {
		return {
			page: currentPage,
			items: Array.from({ length: pageCount }, (_, index) => ({ kind: PAGINATION_ITEM_KIND_PAGE, page: index + 1 }))
		};
	}

	const firstNeighbor = Math.max(2, Math.min(currentPage - 1, pageCount - EDGE_PAGE_COUNT + 1));
	const lastNeighbor = Math.min(pageCount - 1, Math.max(currentPage + 1, EDGE_PAGE_COUNT));
	const items: PaginationItem[] = [{ kind: PAGINATION_ITEM_KIND_PAGE, page: 1 }];

	// Единственный пропущенный номер полезнее показать, чем заменять многоточием.
	if (firstNeighbor === 3) {
		items.push({ kind: PAGINATION_ITEM_KIND_PAGE, page: 2 });
	} else if (firstNeighbor > 3) {
		items.push({ kind: PAGINATION_ITEM_KIND_GAP, position: PAGINATION_GAP_POSITION_BEFORE });
	}

	for (let neighbor = firstNeighbor; neighbor <= lastNeighbor; neighbor++) {
		items.push({ kind: PAGINATION_ITEM_KIND_PAGE, page: neighbor });
	}

	if (lastNeighbor === pageCount - 2) {
		items.push({ kind: PAGINATION_ITEM_KIND_PAGE, page: pageCount - 1 });
	} else if (lastNeighbor < pageCount - 2) {
		items.push({ kind: PAGINATION_ITEM_KIND_GAP, position: PAGINATION_GAP_POSITION_AFTER });
	}

	items.push({ kind: PAGINATION_ITEM_KIND_PAGE, page: pageCount });

	return { page: currentPage, items };
}
