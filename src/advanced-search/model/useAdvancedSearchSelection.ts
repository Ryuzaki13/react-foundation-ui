import { useCallback, useState } from "react";

import { SearchConfig } from "./types";

/**
 * Хук для управления выбором клиентов
 */
export function useAdvancedSearchSelection<T extends Record<string, string>>(config: SearchConfig<T>) {
	const [selectedItems, setSelectedItems] = useState<T[]>([]);

	/**
	 * Сравнивает наборы выбранных элементов по ведущему ключу без учёта порядка.
	 */
	const areSelectionsEqual = useCallback(
		(left: readonly T[], right: readonly T[]) => {
			if (left.length !== right.length) {
				return false;
			}

			const rightIds = new Set(right.map((item) => String(item[config.leadingKey])));

			return left.every((item) => rightIds.has(String(item[config.leadingKey])));
		},
		[config.leadingKey]
	);

	/**
	 * Нормализует новый набор выбора и удаляет дубликаты по ведущему ключу.
	 */
	const replaceSelection = useCallback(
		(nextItems: readonly T[]) => {
			setSelectedItems((prev) => {
				const nextSelectionMap = new Map<string, T>();

				for (const item of nextItems) {
					nextSelectionMap.set(String(item[config.leadingKey]), item);
				}

				const normalizedItems = Array.from(nextSelectionMap.values());

				return areSelectionsEqual(prev, normalizedItems) ? prev : normalizedItems;
			});
		},
		[areSelectionsEqual, config.leadingKey]
	);

	const select = useCallback(
		(item: T) => {
			setSelectedItems((prev) => {
				// Проверяем, не выбран ли уже этот клиент
				if (prev.some((c) => c[config.leadingKey] === item[config.leadingKey])) {
					return prev;
				}
				return [...prev, item];
			});
		},
		[config.leadingKey]
	);

	const deselect = useCallback(
		(id: string) => {
			setSelectedItems((prev) => prev.filter((item) => item[config.leadingKey] !== id));
		},
		[config.leadingKey]
	);

	const clearSelection = useCallback(() => {
		setSelectedItems([]);
	}, []);

	const isSelected = useCallback(
		(id: string) => {
			return selectedItems.some((item) => item[config.leadingKey] === id);
		},
		[config.leadingKey, selectedItems]
	);

	return {
		selectedItems,
		select,
		deselect,
		replaceSelection,
		clearSelection,
		isSelected
	};
}
