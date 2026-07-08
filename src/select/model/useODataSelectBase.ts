import { useEffect, useMemo, useState } from "react";

import { ODataCollectionModel, ODataSelectBaseProps, useODataCollection } from "@ryuzaki13/react-foundation-api/odata";
import { startsWithIgnoringZeros } from "@ryuzaki13/react-foundation-lib/formatters";
import { CollectionItem } from "@ryuzaki13/react-foundation-lib/odata";

interface UseODataSelectBaseOptions extends Omit<ODataSelectBaseProps, "model" | "value"> {
	model: Required<ODataCollectionModel>;
	value?: string[];
}

const DEPENDENCY_KEY_SEPARATOR = "\u0002";
const DEPENDENCY_VALUE_SEPARATOR = "\u0001";

function normalizeDependencyValues(values?: readonly string[]) {
	if (!values?.length) return [];
	return [...new Set(values)].sort();
}

function createDependencySignature(codeKey: string, availableKeys: Record<string, unknown>, dependencies?: Record<string, string[]>) {
	const parts: string[] = [];

	for (const key of Object.keys(availableKeys).sort()) {
		if (key === codeKey) continue;

		const values = normalizeDependencyValues(dependencies?.[key]);
		if (!values.length) continue;

		parts.push(`${key}:${values.join(DEPENDENCY_VALUE_SEPARATOR)}`);
	}

	return parts.join(DEPENDENCY_KEY_SEPARATOR);
}

function parseDependencySignature(signature: string) {
	const dependencies = new Map<string, string[]>();
	if (!signature) return dependencies;

	for (const part of signature.split(DEPENDENCY_KEY_SEPARATOR)) {
		const separatorIndex = part.indexOf(":");
		if (separatorIndex < 0) continue;

		const key = part.slice(0, separatorIndex);
		const values = part
			.slice(separatorIndex + 1)
			.split(DEPENDENCY_VALUE_SEPARATOR)
			.filter(Boolean);
		if (key && values.length) {
			dependencies.set(key, values);
		}
	}

	return dependencies;
}

export function useODataSelectBase({ odata, segment, model, value, dependencies }: UseODataSelectBaseOptions) {
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");

	const { codeKey, searchDebounceDelay, minSearchCodeLength, minSearchTextLength: minSearchLength } = model;

	const {
		data: rawData,
		textKey,
		isLoading,
		isError,
		getItems,
		separatedItems,
		findSourceItemsByKeys,
		setFilteredItems,
		debounce
	} = useODataCollection({ odata, model });

	const itemsCount = separatedItems.length;
	const selectionKey = segment.selectText && textKey ? textKey : codeKey;

	const dependencySignature = useMemo(() => {
		if (!rawData) return "";
		return createDependencySignature(codeKey, rawData.keyPairsMap, dependencies);
	}, [rawData, codeKey, dependencies]);

	useEffect(() => {
		if (!rawData) return;

		const selfIndex = rawData.chain.findIndex((c) => c.codeKey === codeKey);
		const currentDependencies = parseDependencySignature(dependencySignature);

		const resolveFilteredItems = (index: number) => {
			const key = rawData.chain[index].codeKey;
			const dependenciesValues = currentDependencies.get(key);
			if (dependenciesValues?.length) {
				return findSourceItemsByKeys(key, dependenciesValues);
			}
		};

		for (let i = rawData.chain.length - 1; i > selfIndex; i--) {
			const filteredItems = resolveFilteredItems(i);
			if (filteredItems) {
				setFilteredItems(filteredItems);
				return;
			}
		}

		for (let i = 0; i < selfIndex; i++) {
			const filteredItems = resolveFilteredItems(i);
			if (filteredItems) {
				setFilteredItems(filteredItems);
				return;
			}
		}

		setFilteredItems(undefined);
	}, [rawData, dependencySignature, codeKey, findSourceItemsByKeys, setFilteredItems]);

	useEffect(() => {
		debounce(
			"search",
			() => {
				setDebouncedQuery(query.trim().toLowerCase());
			},
			searchDebounceDelay
		);
	}, [debounce, query, searchDebounceDelay]);

	const selectedItems = useMemo(() => {
		if (!value?.length || !selectionKey) {
			return [];
		}

		const selectedValues = new Set(value);
		return separatedItems.filter((item) => selectedValues.has(item[selectionKey]));
	}, [separatedItems, selectionKey, value]);

	const filteredItems = useMemo(() => {
		if (!rawData) {
			return [];
		}

		const isFiltered = debouncedQuery.length >= minSearchLength;

		if (!isFiltered) {
			return getItems(undefined, selectedItems);
		}

		const isAheadText = debouncedQuery.length >= minSearchLength;
		const isAheadCode = !segment.hideCode && debouncedQuery.length >= minSearchCodeLength && !Number.isNaN(Number(debouncedQuery));

		return getItems((codeValue: string, textValue: string) => {
			if (codeValue && textValue) {
				if (isAheadCode && startsWithIgnoringZeros(codeValue, debouncedQuery)) {
					return true;
				}

				if (isAheadText && textValue.toLowerCase().includes(debouncedQuery)) {
					return true;
				}
			}

			return false;
		}, selectedItems);
	}, [debouncedQuery, getItems, minSearchCodeLength, minSearchLength, rawData, segment.hideCode, selectedItems]);

	const placeholder = useMemo(() => {
		const filteredItemsLength = filteredItems.length;

		if (!itemsCount) {
			return `${segment.placeholder} <пусто>`;
		}

		if (filteredItemsLength < itemsCount) {
			return `${segment.placeholder} <${filteredItemsLength}+>`;
		}

		return `${segment.placeholder} <${itemsCount > model.maxVisibleItems ? `${model.maxVisibleItems}+` : itemsCount}>`;
	}, [filteredItems.length, itemsCount, model.maxVisibleItems, segment.placeholder]);

	return {
		query,
		setQuery,
		debouncedQuery,
		selectedItems,
		filteredItems,
		itemsCount,
		isLoading,
		isError,
		codeKey,
		textKey,
		selectionKey,
		placeholder
	};
}

export type ODataSelectBaseModel = ReturnType<typeof useODataSelectBase>;

export function mapSelectedItemsToValues(items: CollectionItem[], selectionKey: string) {
	return items.map((item) => item[selectionKey]);
}
