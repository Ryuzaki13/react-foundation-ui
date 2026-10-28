/** Разрывы имеют собственную identity и не становятся недействующими кнопками. */
export type PaginationItem =
	{ readonly kind: "page"; readonly page: number } | { readonly kind: "gap"; readonly position: "before" | "after" };

export type PaginationModel = {
	readonly page: number;
	readonly items: readonly PaginationItem[];
};
