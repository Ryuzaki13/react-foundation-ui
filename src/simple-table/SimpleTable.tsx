import { useMemo } from "react";

import { ColumnDef } from "@tanstack/react-table";

import { Table } from "../table";

import type { TableColumnDef } from "@ryuzaki13/react-foundation-lib/table";

/**
 * @deprecated Используйте `Table` из `shared/ui/composite/table`.
 */
interface SimpleTableProps<T extends object> {
	title?: string;
	/**
	 * Как правило при первой загрузке.
	 */
	isLoading?: boolean;
	/**
	 * Если происходит догрузка через `useInfiniteQuery`.
	 */
	isFetching?: boolean;
	data: T[] | undefined | null;
	columns: ColumnDef<T>[];
	className?: string;
	tableClassName?: string;

	/**
	 * Событие вызывается при достижении прокрутки таблицы до конца.
	 *
	 * Необходимо, если сверху реализуется подгрузка данных на базе `useInfiniteQuery`.
	 */
	onReachEnd?: () => void;
}

const fallbackData: unknown[] = [];

/**
 * @deprecated Используйте `Table`.
 *
 * Семантика legacy-совместимости:
 * - старый `columns[].size` продолжает трактоваться как `em`, как и раньше;
 * - остальной рендер делегирован новому `Table`.
 */
export function SimpleTable<T extends object>({
	title,
	isLoading,
	isFetching,
	columns,
	data,
	className,
	tableClassName,
	onReachEnd
}: SimpleTableProps<T>) {
	const normalizedColumns = useMemo<TableColumnDef<T>[]>(
		() =>
			columns.map((column) => {
				const tableColumn = column as TableColumnDef<T>;

				if (tableColumn.meta?.width || typeof column.size !== "number") {
					return tableColumn;
				}

				return {
					...tableColumn,
					meta: {
						...tableColumn.meta,
						width: column.size
					}
				};
			}),
		[columns]
	);

	return (
		<Table
			title={title}
			isLoading={isLoading}
			isFetching={isFetching}
			data={data ?? (fallbackData as T[])}
			columns={normalizedColumns}
			className={className}
			tableClassName={tableClassName}
			onReachEnd={onReachEnd}
		/>
	);
}
