import { useCallback, useMemo, useState } from "react";

import { functionalUpdate, type ColumnPinningState, type Updater } from "@tanstack/react-table";

import { normalizeTableColumnPinning, type TableColumnPinningState } from "../lib/columnPinning";

/**
 * Аргументы управления состоянием закрепления колонок.
 */
export interface UseTableColumnPinningArgs {
	/**
	 * Внешнее controlled-состояние закрепления.
	 */
	columnPinning?: TableColumnPinningState;
	/**
	 * Стартовое uncontrolled-состояние закрепления.
	 */
	defaultColumnPinning?: TableColumnPinningState;
	/**
	 * Вызывается после любого изменения left-pinning state.
	 */
	onColumnPinningChange?: (state: TableColumnPinningState) => void;
}

/**
 * Результат работы hook управления column pinning.
 */
export interface UseTableColumnPinningResult {
	/**
	 * Актуальный pinning-state в формате TanStack Table.
	 */
	columnPinning: ColumnPinningState;
	/**
	 * Обработчик изменения pinning-state из TanStack Table.
	 */
	onColumnPinningChange: (updater: Updater<ColumnPinningState>) => void;
}

/**
 * Инкапсулирует controlled/uncontrolled-паттерн для left column pinning.
 */
export function useTableColumnPinning({
	columnPinning,
	defaultColumnPinning,
	onColumnPinningChange
}: UseTableColumnPinningArgs): UseTableColumnPinningResult {
	const [uncontrolledColumnPinning, setUncontrolledColumnPinning] = useState<TableColumnPinningState | undefined>(undefined);
	const resolvedColumnPinning = useMemo(
		() => normalizeTableColumnPinning(columnPinning ?? uncontrolledColumnPinning ?? defaultColumnPinning),
		[columnPinning, defaultColumnPinning, uncontrolledColumnPinning]
	);

	const handleColumnPinningChange = useCallback(
		(updater: Updater<ColumnPinningState>) => {
			const nextColumnPinning = normalizeTableColumnPinning(functionalUpdate(updater, resolvedColumnPinning));
			const nextPublicColumnPinning: TableColumnPinningState = {
				left: nextColumnPinning.left
			};

			if (columnPinning === undefined) {
				setUncontrolledColumnPinning(nextPublicColumnPinning);
			}

			onColumnPinningChange?.(nextPublicColumnPinning);
		},
		[columnPinning, onColumnPinningChange, resolvedColumnPinning]
	);

	return {
		columnPinning: resolvedColumnPinning,
		onColumnPinningChange: handleColumnPinningChange
	};
}
