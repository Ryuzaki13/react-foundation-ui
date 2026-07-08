import { useMemo } from "react";

import { normalizeTextToLower } from "@ryuzaki13/react-foundation-lib/formatters";

interface UsePickerDefaultFilterOptions<T> {
	options: readonly T[];
	query: string;
	enabled?: boolean;
	getSearchText: (option: T) => unknown;
}

function normalizeSearchText(value: unknown) {
	const parts = Array.isArray(value) ? value : [value];

	return normalizeTextToLower(parts.filter(Boolean).join(" "));
}

export function usePickerDefaultFilter<T>({ options, query, enabled = true, getSearchText }: UsePickerDefaultFilterOptions<T>) {
	const normalizedQuery = normalizeTextToLower(query);

	return useMemo(() => {
		if (!enabled || !normalizedQuery) {
			return [...options];
		}

		return options.filter((option) => normalizeSearchText(getSearchText(option)).includes(normalizedQuery));
	}, [enabled, getSearchText, normalizedQuery, options]);
}
