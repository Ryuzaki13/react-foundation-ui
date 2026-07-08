/* eslint-disable react-hooks/incompatible-library */
import { useEffect, useEffectEvent, useMemo, useRef } from "react";

import { formatPipelineDisplayValue } from "@ryuzaki13/react-foundation-lib/formatters";
import { TableFormulaRowData } from "@ryuzaki13/react-foundation-lib/formulas";
import {
	type TableColumnDef,
	type TableColumnOrderState,
	type TableColumnSizingState,
	type TableSelectionMode,
	useTableRowSelection
} from "@ryuzaki13/react-foundation-lib/table";
import { getCoreRowModel, useReactTable, type Row, type VisibilityState } from "@tanstack/react-table";

import {
	BaseTable,
	buildBaseTableMergedCellsLayout,
	buildTableFormattingSnapshot,
	FormattedTableCell,
	getOrderedVisibleLeafColumns,
	shouldUseTableFormatting,
	useTableColumnOrder,
	useTableColumnPinning,
	useTableColumnSizing,
	useTableColumnVisibility,
	type BaseTableColumnState,
	type BaseTableProps,
	type TableColumnPinningState
} from "../base-table";

import styles from "./Table.module.scss";

/**
 * Возвращает индекс как строковый id, если внешний id не передан.
 */
function defaultGetRowId<TData>(_row: TData, index: number): string {
	return String(index);
}

/**
 * Пропсы компонента Table.
 *
 * Компонент предназначен для плоских данных и по API осознанно сближен с TreeTable.
 */
export interface TableProps<TData extends object> {
	/**
	 * Необязательный заголовок над таблицей.
	 */
	title?: string;
	/**
	 * Признак первичной загрузки.
	 */
	isLoading?: boolean;
	/**
	 * Признак фоновой догрузки или обновления данных.
	 */
	isFetching?: boolean;
	/**
	 * Плоский источник строк.
	 */
	data: readonly TData[] | undefined | null;
	/**
	 * Описание колонок таблицы.
	 */
	columns: readonly TableColumnDef<TData>[];
	/**
	 * Режим выбора строк.
	 */
	selectionMode?: TableSelectionMode;
	/**
	 * Внешний список выбранных строк.
	 *
	 * Если передан, таблица синхронизирует визуальное выделение с этим набором id.
	 */
	selectedRowIds?: readonly string[];
	/**
	 * Стабильный идентификатор строки.
	 *
	 * Если не задан, используется индекс строки.
	 */
	getRowId?: (row: TData, index: number) => string;
	/**
	 * Дополнительный CSS-класс корневого контейнера.
	 */
	className?: string;
	minHeight?: `${number}em` | `${number}%`;
	/**
	 * Дополнительный CSS-класс тега `table`.
	 */
	tableClassName?: string;
	/**
	 * Внешнее controlled-состояние видимости колонок.
	 */
	columnVisibility?: VisibilityState;
	/**
	 * Стартовое uncontrolled-состояние видимости колонок.
	 */
	defaultColumnVisibility?: VisibilityState;
	/**
	 * Внешнее controlled-состояние порядка колонок.
	 */
	columnOrder?: readonly string[];
	/**
	 * Стартовое uncontrolled-состояние порядка колонок.
	 */
	defaultColumnOrder?: readonly string[];
	/**
	 * Внешнее controlled-состояние ширин колонок в px.
	 */
	columnSizing?: TableColumnSizingState;
	/**
	 * Стартовое uncontrolled-состояние ширин колонок в px.
	 */
	defaultColumnSizing?: TableColumnSizingState;
	/**
	 * Внешнее controlled-состояние left-pinning для колонок.
	 */
	columnPinning?: TableColumnPinningState;
	/**
	 * Стартовое uncontrolled-состояние left-pinning для колонок.
	 */
	defaultColumnPinning?: TableColumnPinningState;
	/**
	 * Включает изменение ширины колонок через header-handle.
	 */
	enableColumnResizing?: boolean;
	/**
	 * Включает изменение порядка колонок через drag&drop заголовков.
	 */
	enableColumnReordering?: boolean;
	/**
	 * Минимальная ширина колонки при resize в px.
	 */
	columnResizeMinWidth?: number;
	/**
	 * Вызывается после изменения видимости колонок.
	 */
	onColumnVisibilityChange?: (state: VisibilityState) => void;
	/**
	 * Вызывается после изменения порядка колонок.
	 */
	onColumnOrderChange?: (state: TableColumnOrderState) => void;
	/**
	 * Вызывается после изменения ширины колонок.
	 */
	onColumnSizingChange?: (state: TableColumnSizingState) => void;
	/**
	 * Вызывается после изменения left-pinning state.
	 */
	onColumnPinningChange?: (state: TableColumnPinningState) => void;
	/**
	 * Вызывается при активации строки кликом или клавиатурой.
	 */
	onRowClick?: (row: TData) => void;
	/**
	 * Вызывается после изменения выбранных строк.
	 */
	onRowSelectionChange?: (rows: TData[]) => void;
	/**
	 * Вызывается при достижении конца таблицы внутри scroll-контейнера.
	 */
	onReachEnd?: () => void;
	/**
	 * Позволяет запретить выбор отдельных строк.
	 */
	getRowCanSelect?: (row: TData) => boolean;
	/**
	 * Позволяет добавить CSS-класс для конкретной строки.
	 */
	getRowClassName?: (row: TData) => string | undefined;
	/**
	 * Контекстное меню заголовка колонки. Используется для общих runtime-действий
	 * вроде server sorting без встраивания доменной логики в shared-таблицу.
	 */
	renderHeaderContextMenu?: BaseTableProps<TData>["renderHeaderContextMenu"];
	/**
	 * Тонкая точка расширения содержимого ячейки поверх стандартного форматирования.
	 *
	 * В отличие от `column.cell`, этот слот не отключает общий formatting-runtime:
	 * `defaultContent` уже содержит отформатированное значение, если оно применимо.
	 */
	renderCellContent?: BaseTableProps<TData>["renderCellContent"];
}

/**
 * Плоская таблица на базе TanStack Table как React-альтернатива `sap.m.Table`.
 */
export function Table<TData extends object>({
	title,
	isLoading,
	isFetching,
	data,
	columns,
	selectionMode = "none",
	selectedRowIds,
	getRowId,
	className,
	minHeight,
	tableClassName,
	columnVisibility,
	defaultColumnVisibility,
	columnOrder,
	defaultColumnOrder,
	columnSizing,
	defaultColumnSizing,
	columnPinning,
	defaultColumnPinning,
	enableColumnResizing = false,
	enableColumnReordering = false,
	columnResizeMinWidth,
	onColumnVisibilityChange,
	onColumnOrderChange,
	onColumnSizingChange,
	onColumnPinningChange,
	onRowClick,
	onRowSelectionChange,
	onReachEnd,
	getRowCanSelect,
	getRowClassName,
	renderHeaderContextMenu,
	renderCellContent
}: TableProps<TData>) {
	const tableData = useMemo(() => data ?? [], [data]);
	const formattingSnapshot = useMemo(() => buildTableFormattingSnapshot(columns), [columns]);
	const resolveRowId = getRowId ?? defaultGetRowId<TData>;
	const rowById = useMemo(() => new Map(tableData.map((row, index) => [resolveRowId(row, index), row])), [resolveRowId, tableData]);
	const availableRowIds = useMemo(() => Array.from(rowById.keys()), [rowById]);
	const scrollableRef = useRef<HTMLDivElement | null>(null);
	const sentinelRef = useRef<HTMLDivElement | null>(null);

	const { rowSelection, activateRowSelection } = useTableRowSelection({
		availableRowIds,
		rowById,
		selectionMode,
		selectedRowIds,
		onRowSelectionChange
	});
	const { columnVisibility: resolvedColumnVisibility, onColumnVisibilityChange: handleColumnVisibilityChange } = useTableColumnVisibility(
		{
			columnVisibility,
			defaultColumnVisibility,
			onColumnVisibilityChange
		}
	);
	const { columnOrder: resolvedColumnOrder, onColumnOrderChange: handleColumnOrderChange } = useTableColumnOrder({
		columnOrder,
		defaultColumnOrder,
		onColumnOrderChange
	});
	const { columnSizing: resolvedColumnSizing, onColumnSizingChange: handleColumnSizingChange } = useTableColumnSizing({
		columnSizing,
		defaultColumnSizing,
		columnResizeMinWidth,
		onColumnSizingChange
	});
	const { columnPinning: resolvedColumnPinning, onColumnPinningChange: handleColumnPinningChange } = useTableColumnPinning({
		columnPinning,
		defaultColumnPinning,
		onColumnPinningChange
	});
	const baseTableColumnState = useMemo<BaseTableColumnState>(
		() => ({
			columnOrder: resolvedColumnOrder,
			columnPinning: resolvedColumnPinning,
			columnSizing: resolvedColumnSizing,
			columnVisibility: resolvedColumnVisibility
		}),
		[resolvedColumnOrder, resolvedColumnPinning, resolvedColumnSizing, resolvedColumnVisibility]
	);

	const emitReachEnd = useEffectEvent(() => {
		onReachEnd?.();
	});

	useEffect(() => {
		if (!onReachEnd || !scrollableRef.current || !sentinelRef.current || isLoading) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];

				if (entry?.isIntersecting) {
					emitReachEnd();
				}
			},
			{
				root: scrollableRef.current,
				threshold: 0.1
			}
		);

		observer.observe(sentinelRef.current);

		return () => observer.disconnect();
	}, [isLoading, onReachEnd, tableData.length]);

	const table = useReactTable<TData>({
		data: tableData as TData[],
		columns: columns as TableColumnDef<TData>[],
		state: {
			columnOrder: resolvedColumnOrder,
			columnPinning: resolvedColumnPinning,
			columnSizing: resolvedColumnSizing,
			columnVisibility: resolvedColumnVisibility,
			rowSelection
		},
		onColumnOrderChange: handleColumnOrderChange,
		onColumnPinningChange: handleColumnPinningChange,
		onColumnSizingChange: handleColumnSizingChange,
		onColumnVisibilityChange: handleColumnVisibilityChange,
		getRowId: (row, index) => resolveRowId(row, index),
		getCoreRowModel: getCoreRowModel(),
		enableMultiRowSelection: selectionMode === "multi",
		enableRowSelection: (row) => {
			if (selectionMode === "none") {
				return false;
			}

			return getRowCanSelect ? getRowCanSelect(row.original) : true;
		}
	});

	const visibleLeafColumns = getOrderedVisibleLeafColumns(table, baseTableColumnState);
	const rowModelRows = table.getRowModel().rows;
	const mergedCellLayout = useMemo(
		() =>
			buildBaseTableMergedCellsLayout({
				rows: rowModelRows,
				columns: visibleLeafColumns
			}),
		[rowModelRows, visibleLeafColumns]
	);
	const leadingColumnId = visibleLeafColumns[0]?.id;

	/**
	 * Активирует строку: обновляет выбор в соответствии с режимом и вызывает внешний callback.
	 */
	const activateRow = (row: Row<TData>) => {
		activateRowSelection(row.id, row.getCanSelect());
		onRowClick?.(row.original);
	};

	return (
		<BaseTable
			table={table}
			columnState={baseTableColumnState}
			title={title}
			isLoading={isLoading}
			isFetching={isFetching}
			className={className}
			minHeight={minHeight}
			tableClassName={tableClassName}
			selectionMode={selectionMode}
			scrollableRef={scrollableRef}
			onActivateRow={selectionMode !== "none" || onRowClick ? activateRow : undefined}
			isRowInteractive={(row) => Boolean(onRowClick || (selectionMode !== "none" && row.getCanSelect()))}
			getRowClassName={(row) => getRowClassName?.(row.original)}
			getCellClassName={({ row, cell }) =>
				cell.column.id === leadingColumnId && row.getIsSelected() ? styles.selectedIndicatorCell : undefined
			}
			getCellLayout={({ cell }) => mergedCellLayout.get(cell.id)}
			renderHeaderContextMenu={renderHeaderContextMenu}
			enableColumnResizing={enableColumnResizing}
			enableColumnReordering={enableColumnReordering}
			columnResizeMinWidth={columnResizeMinWidth}
			renderCellContent={(args) => {
				const displayValue = formatPipelineDisplayValue({
					field: formattingSnapshot.runtimeByColumnId[args.cell.column.id],
					rawValue: args.cell.getValue(),
					rowData: args.row.original as TableFormulaRowData,
					rowKind: "plain"
				});
				const defaultContent = !shouldUseTableFormatting({
					columnId: args.cell.column.id,
					runtimeByColumnId: formattingSnapshot.runtimeByColumnId,
					customCellColumnIds: formattingSnapshot.customCellColumnIds
				}) ? (
					args.defaultContent
				) : (
					<FormattedTableCell displayValue={displayValue} align={args.columnMeta?.align} />
				);

				if (renderCellContent) {
					return renderCellContent({
						...args,
						defaultContent,
						displayValue
					});
				}

				return defaultContent;
			}}
			afterTableContent={onReachEnd ? <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" /> : null}
		/>
	);
}
