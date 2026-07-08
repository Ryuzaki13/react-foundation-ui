import { useCallback, useMemo, useState } from "react";

import { odataQueryFn } from "@ryuzaki13/react-foundation-api/odata";
import { createFilterContains, createFilterEqual } from "@ryuzaki13/react-foundation-lib/odata-service";
import { useInfiniteQuery } from "@tanstack/react-query";

import { buildSearchParts, filterBySearchParts } from "../lib";

import { SearchConfig } from "./types";

const PAGE_SIZE = 50;

export function useAdvancedSearch<T extends Record<string, string>>(config: SearchConfig<T>) {
	const [term, setTerm] = useState("");
	const [filters, setFilters] = useState<Record<string, string[]>>(() =>
		Object.keys(config.segments ?? {}).reduce(
			(acc, key) => {
				acc[key] = [];
				return acc;
			},
			{} as Record<string, string[]>
		)
	);

	const searchParts = buildSearchParts(term);
	const isComplexSearch = searchParts.length > 1;

	const top = isComplexSearch ? 5000 : PAGE_SIZE;

	const query = useInfiniteQuery({
		queryKey: ["search", config.odata.service, config.odata.target, filters, term],
		queryFn: async ({ pageParam = 0, signal, client }) => {
			const columnKeys = config.columns.map((col) => col.key);

			const result = await odataQueryFn<T>({
				odata: {
					service: config.odata.service,
					target: config.odata.target
				},
				options: {
					top: top,
					skip: pageParam,
					select: columnKeys,
					expression: {
						and: true,
						filters: [
							{
								filters: searchParts
									? config.searchKeys.map((key) => ({
											filters: searchParts.map((part) => createFilterContains(key, part))
										}))
									: []
							},
							{
								and: true,
								filters: Object.keys(filters).map((key) => createFilterEqual(key, filters[key]))
							}
						]
					},
					sorts: [{ key: config.leadingKey }]
				}
			})({ signal, client });

			if (isComplexSearch) {
				return filterBySearchParts(result.data, searchParts, config.searchKeys);
			}

			return result.data;
		},
		getNextPageParam: (lastPage, allPages) => {
			if (lastPage.length < top) return undefined;
			return allPages.length * top;
		},
		initialPageParam: 0
	});

	const search = useCallback((term: string) => {
		setTerm(term);
	}, []);

	const clearSearch = useCallback(() => {
		setTerm("");
	}, []);

	const items = useMemo(() => {
		return query.data?.pages.flatMap((page) => page) ?? [];
	}, [query.data?.pages]);

	return {
		query,
		items,
		searchTerm: term,
		setSearch: search,
		clearSearch,
		filters,
		setFilters
	};
}
