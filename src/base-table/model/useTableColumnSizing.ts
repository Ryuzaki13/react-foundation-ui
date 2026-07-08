import { useCallback, useMemo, useState } from "react";

import { functionalUpdate, type ColumnSizingState, type Updater } from "@tanstack/react-table";

import { normalizeTableColumnSizing, type TableColumnSizingState } from "@ryuzaki13/react-foundation-lib/table";

/**
 * Аргументы управления шириной колонок таблицы.
 */
export interface UseTableColumnSizingArgs {
	/**
	 * Внешнее controlled-состояние ширин колонок в px.
	 */
	columnSizing?: TableColumnSizingState;
	/**
	 * Стартовое uncontrolled-состояние ширин колонок в px.
	 */
	defaultColumnSizing?: TableColumnSizingState;
	/**
	 * Минимальная ширина колонки в px.
	 */
	columnResizeMinWidth?: number;
	/**
	 * Вызывается после изменения ширины колонок.
	 */
	onColumnSizingChange?: (state: TableColumnSizingState) => void;
}

/**
 * Результат работы hook управления column sizing.
 */
export interface UseTableColumnSizingResult {
	/**
	 * Актуальный sizing-state в формате TanStack Table.
	 */
	columnSizing: ColumnSizingState;
	/**
	 * Обработчик изменения sizing-state из TanStack Table.
	 */
	onColumnSizingChange: (updater: Updater<ColumnSizingState>) => void;
}

/**
 * Инкапсулирует controlled/uncontrolled-паттерн для ширин колонок.
 */
export function useTableColumnSizing({
	columnSizing,
	defaultColumnSizing,
	columnResizeMinWidth,
	onColumnSizingChange
}: UseTableColumnSizingArgs): UseTableColumnSizingResult {
	const [uncontrolledColumnSizing, setUncontrolledColumnSizing] = useState<TableColumnSizingState | undefined>(undefined);
	const resolvedColumnSizing = useMemo(
		() => normalizeTableColumnSizing(columnSizing ?? uncontrolledColumnSizing ?? defaultColumnSizing, columnResizeMinWidth),
		[columnResizeMinWidth, columnSizing, defaultColumnSizing, uncontrolledColumnSizing]
	);

	const handleColumnSizingChange = useCallback(
		(updater: Updater<ColumnSizingState>) => {
			const nextColumnSizing = normalizeTableColumnSizing(functionalUpdate(updater, resolvedColumnSizing), columnResizeMinWidth);

			if (columnSizing === undefined) {
				setUncontrolledColumnSizing(nextColumnSizing);
			}

			onColumnSizingChange?.(nextColumnSizing);
		},
		[columnResizeMinWidth, columnSizing, onColumnSizingChange, resolvedColumnSizing]
	);

	return {
		columnSizing: resolvedColumnSizing,
		onColumnSizingChange: handleColumnSizingChange
	};
}
