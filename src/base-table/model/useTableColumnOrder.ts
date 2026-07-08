import { useCallback, useMemo, useState } from "react";

import { normalizeTableColumnOrder, type TableColumnOrderState } from "@ryuzaki13/react-foundation-lib/table";
import { functionalUpdate, type ColumnOrderState, type Updater } from "@tanstack/react-table";

/**
 * Аргументы управления порядком колонок таблицы.
 */
export interface UseTableColumnOrderArgs {
	/**
	 * Внешнее controlled-состояние порядка колонок.
	 */
	columnOrder?: readonly string[];
	/**
	 * Стартовое uncontrolled-состояние порядка колонок.
	 */
	defaultColumnOrder?: readonly string[];
	/**
	 * Вызывается после изменения порядка колонок.
	 */
	onColumnOrderChange?: (state: TableColumnOrderState) => void;
}

/**
 * Результат работы hook управления column order.
 */
export interface UseTableColumnOrderResult {
	/**
	 * Актуальный order-state в формате TanStack Table.
	 */
	columnOrder: ColumnOrderState;
	/**
	 * Обработчик изменения order-state из TanStack Table.
	 */
	onColumnOrderChange: (updater: Updater<ColumnOrderState>) => void;
}

/**
 * Инкапсулирует controlled/uncontrolled-паттерн для порядка колонок.
 */
export function useTableColumnOrder({
	columnOrder,
	defaultColumnOrder,
	onColumnOrderChange
}: UseTableColumnOrderArgs): UseTableColumnOrderResult {
	const [uncontrolledColumnOrder, setUncontrolledColumnOrder] = useState<TableColumnOrderState | undefined>(undefined);
	const resolvedColumnOrder = useMemo(
		() => normalizeTableColumnOrder(columnOrder ?? uncontrolledColumnOrder ?? defaultColumnOrder),
		[columnOrder, defaultColumnOrder, uncontrolledColumnOrder]
	);

	const handleColumnOrderChange = useCallback(
		(updater: Updater<ColumnOrderState>) => {
			const nextColumnOrder = normalizeTableColumnOrder(functionalUpdate(updater, resolvedColumnOrder));

			if (columnOrder === undefined) {
				setUncontrolledColumnOrder(nextColumnOrder);
			}

			onColumnOrderChange?.(nextColumnOrder);
		},
		[columnOrder, onColumnOrderChange, resolvedColumnOrder]
	);

	return {
		columnOrder: resolvedColumnOrder,
		onColumnOrderChange: handleColumnOrderChange
	};
}
