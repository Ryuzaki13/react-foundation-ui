import {
	PAGINATION_ITEM_KIND_PAGE,
	PAGINATION_ITEM_KIND_GAP,
	PAGINATION_GAP_POSITION_BEFORE,
	PAGINATION_GAP_POSITION_AFTER
} from "./paginationConstants";
/** Разрывы имеют собственную identity и не становятся недействующими кнопками. */
export type PaginationItem =
	| { readonly kind: typeof PAGINATION_ITEM_KIND_PAGE; readonly page: number }
	| {
			readonly kind: typeof PAGINATION_ITEM_KIND_GAP;
			readonly position: typeof PAGINATION_GAP_POSITION_BEFORE | typeof PAGINATION_GAP_POSITION_AFTER;
	  };

export type PaginationModel = {
	readonly page: number;
	readonly items: readonly PaginationItem[];
};
