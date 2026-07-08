import { useCallback, useMemo, useState } from "react";

import { functionalUpdate, type Updater, type VisibilityState } from "@tanstack/react-table";

/**
 * Аргументы управления видимостью колонок таблицы.
 */
export interface UseTableColumnVisibilityArgs {
	/**
	 * Внешнее controlled-состояние видимости колонок.
	 */
	columnVisibility?: VisibilityState;
	/**
	 * Стартовое uncontrolled-состояние видимости колонок.
	 */
	defaultColumnVisibility?: VisibilityState;
	/**
	 * Вызывается после любого изменения visibility-state.
	 */
	onColumnVisibilityChange?: (state: VisibilityState) => void;
}

/**
 * Результат работы hook управления видимостью колонок.
 */
export interface UseTableColumnVisibilityResult {
	/**
	 * Актуальный visibility-state, который нужно передать в TanStack Table.
	 */
	columnVisibility: VisibilityState;
	/**
	 * Обработчик изменения visibility-state из TanStack Table.
	 */
	onColumnVisibilityChange: (updater: Updater<VisibilityState>) => void;
}

/**
 * Инкапсулирует controlled/uncontrolled-паттерн для column visibility.
 *
 * Пока пользователь не изменял visibility локально, hook читает
 * `defaultColumnVisibility` напрямую, поэтому асинхронная metadata-инициализация
 * не требует синхронизации prop -> state через эффекты.
 */
export function useTableColumnVisibility({
	columnVisibility,
	defaultColumnVisibility,
	onColumnVisibilityChange
}: UseTableColumnVisibilityArgs): UseTableColumnVisibilityResult {
	const [uncontrolledColumnVisibility, setUncontrolledColumnVisibility] = useState<VisibilityState | undefined>(undefined);
	const resolvedColumnVisibility = useMemo(
		() => columnVisibility ?? uncontrolledColumnVisibility ?? defaultColumnVisibility ?? {},
		[columnVisibility, defaultColumnVisibility, uncontrolledColumnVisibility]
	);

	const handleColumnVisibilityChange = useCallback(
		(updater: Updater<VisibilityState>) => {
			const nextColumnVisibility = functionalUpdate(updater, resolvedColumnVisibility);

			if (columnVisibility === undefined) {
				setUncontrolledColumnVisibility(nextColumnVisibility);
			}

			onColumnVisibilityChange?.(nextColumnVisibility);
		},
		[columnVisibility, onColumnVisibilityChange, resolvedColumnVisibility]
	);

	return {
		columnVisibility: resolvedColumnVisibility,
		onColumnVisibilityChange: handleColumnVisibilityChange
	};
}
