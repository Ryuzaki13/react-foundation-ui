/* eslint-disable react-hooks/incompatible-library */
import { useEffect, useEffectEvent, useMemo, useRef, useState, type ReactNode } from "react";

import { formatPipelineDisplayValue } from "@ryuzaki13/react-foundation-lib/formatters";
import {
	resolveTableLength,
	TableColumnDef,
	type TableColumnOrderState,
	type TableColumnSizingState,
	TableSelectionMode,
	useTableRowSelection
} from "@ryuzaki13/react-foundation-lib/table";
import { buildTreeTableRows, type TreeTableFlatHierarchy, type TreeTableRowNode } from "@ryuzaki13/react-foundation-lib/tree-table";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import {
	getCoreRowModel,
	getExpandedRowModel,
	useReactTable,
	type ExpandedState,
	type Row,
	type VisibilityState
} from "@tanstack/react-table";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

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
	type BaseTableCellRenderArgs,
	type BaseTableColumnState,
	type BaseTableProps,
	type TableColumnPinningState
} from "../base-table";

import styles from "./TreeTable.module.scss";

import type { TableFormulaRowData } from "@ryuzaki13/react-foundation-lib/formulas";

/**
 * Внутренний тип строки TreeTable после преобразования в иерархию.
 */
type TreeTableRuntimeRow<TData extends object> = TreeTableRowNode<TData>;

/**
 * Пропсы компонента TreeTable.
 *
 * Компонент принимает плоский OData-список и сам строит иерархию,
 * оставляя управление раскрытием и выбором во внутреннем состоянии.
 */
export interface TreeTableProps<TData extends object> {
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
	 * Описание колонок через исходный тип строки.
	 */
	columns: readonly TableColumnDef<TData>[];
	/**
	 * Правила восстановления дерева из плоского списка.
	 */
	hierarchy: TreeTableFlatHierarchy<TData>;
	/**
	 * Режим выбора строк.
	 */
	selectionMode?: TableSelectionMode;
	/**
	 * Если `true`, при первом появлении данных раскрывает корневой уровень.
	 */
	expandFirstLevel?: boolean;
	/**
	 * Дополнительные строки, которые должны быть раскрыты при первой инициализации.
	 */
	defaultExpandedRowIds?: readonly string[];
	/**
	 * Идентификатор колонки, в которой нужно рисовать tree-toggle и отступы.
	 *
	 * Если не указан, используется первая видимая колонка.
	 */
	treeColumnId?: string;
	/**
	 * Отступ на один уровень вложенности.
	 *
	 * Числовое значение трактуется как `em`.
	 */
	indentSize?: string | number;
	/**
	 * Дополнительный CSS-класс корневого контейнера.
	 */
	className?: string;
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
	 * Вызывается после изменения раскрытых узлов.
	 */
	onExpandedRowIdsChange?: (rowIds: string[]) => void;
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
	 * Контекстное меню заголовка колонки. Получает runtime-строки дерева,
	 * потому что BaseTable работает уже после сборки flat hierarchy.
	 */
	renderHeaderContextMenu?: BaseTableProps<TreeTableRuntimeRow<TData>>["renderHeaderContextMenu"];
	/**
	 * Точка расширения содержимого ячейки после общего форматирования.
	 *
	 * Для tree-column в `defaultContent` передается только содержимое ячейки:
	 * TreeTable сам добавит expander и отступ после выполнения слота.
	 */
	renderCellContent?: BaseTableProps<TreeTableRuntimeRow<TData>>["renderCellContent"];
}

/**
 * Преобразует массив идентификаторов в формат состояния раскрытия TanStack.
 */
function toExpandedState(rowIds: readonly string[]): ExpandedState {
	return Object.fromEntries(rowIds.map((rowId) => [rowId, true]));
}

/**
 * Извлекает из состояния раскрытия только активные идентификаторы.
 */
function extractExpandedRowIds(expanded: ExpandedState): string[] {
	if (typeof expanded === "boolean") {
		return [];
	}

	return Object.keys(expanded).filter((rowId) => expanded[rowId]);
}

/**
 * Нормализует исходную строку, убирая зависимость от внутреннего поля `children`.
 */
function resolveOriginalRow<TData extends object>(row: Row<TreeTableRuntimeRow<TData>>, rowById: Map<string, TData>): TData {
	return rowById.get(row.id) ?? (row.original as TData);
}

/**
 * Рендерит содержимое древовидной ячейки.
 */
function renderTreeCellContent<TData extends object>(
	args: BaseTableCellRenderArgs<TreeTableRuntimeRow<TData>>,
	content: ReactNode,
	treeColumnId: string | undefined,
	indentSize: string | number
): ReactNode {
	if (args.cell.column.id !== treeColumnId) {
		return content;
	}

	return (
		<div
			className={styles.treeCell}
			style={{
				paddingInlineStart: `calc(${args.row.depth} * ${resolveTableLength(indentSize) ?? "0em"})`
			}}>
			{args.row.getCanExpand() ? (
				<button
					type="button"
					className={styles.expanderButton}
					aria-label={args.row.getIsExpanded() ? "Свернуть строку" : "Развернуть строку"}
					data-tree-table-interactive="true"
					data-ui="tree-table-expander"
					data-action={args.row.getIsExpanded() ? "collapse-tree-table-row" : "expand-tree-table-row"}
					onClick={(event) => {
						event.stopPropagation();
						args.row.toggleExpanded();
					}}>
					{args.row.getIsExpanded() ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
				</button>
			) : (
				<span className={styles.expanderSpacer} aria-hidden="true" />
			)}

			<div className={styles.treeCellContent}>{content}</div>
		</div>
	);
}

/**
 * Древовидная таблица на базе TanStack Table для плоских OData-данных.
 */
export function TreeTable<TData extends object>({
	title,
	isLoading,
	isFetching,
	data,
	columns,
	hierarchy,
	selectionMode = "none",
	expandFirstLevel = false,
	defaultExpandedRowIds,
	treeColumnId,
	indentSize = 1,
	className,
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
	onExpandedRowIdsChange,
	onReachEnd,
	getRowCanSelect,
	getRowClassName,
	renderHeaderContextMenu,
	renderCellContent
}: TreeTableProps<TData>) {
	const treeData = useMemo(() => buildTreeTableRows(data ?? [], hierarchy), [data, hierarchy]);
	const formattingSnapshot = useMemo(() => buildTableFormattingSnapshot(columns), [columns]);
	const initialExpandedRowIds = useMemo(() => {
		const nextExpandedRowIds = new Set(defaultExpandedRowIds ?? []);

		if (expandFirstLevel) {
			for (const rootRowId of treeData.rootRowIds) {
				nextExpandedRowIds.add(rootRowId);
			}
		}

		return Array.from(nextExpandedRowIds);
	}, [defaultExpandedRowIds, expandFirstLevel, treeData.rootRowIds]);

	const [expanded, setExpanded] = useState<ExpandedState>({});
	const hasInitializedExpansionRef = useRef(false);
	const scrollableRef = useRef<HTMLDivElement | null>(null);
	const sentinelRef = useRef<HTMLDivElement | null>(null);

	const { rowSelection, activateRowSelection } = useTableRowSelection({
		availableRowIds: treeData.allRowIds,
		rowById: treeData.rowById,
		selectionMode,
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

	const syncExpandedState = useEffectEvent((availableRowIds: readonly string[], nextInitialExpandedRowIds: readonly string[]) => {
		if (availableRowIds.length === 0) {
			hasInitializedExpansionRef.current = false;
			setExpanded({});
			return;
		}

		const availableRowIdSet = new Set(availableRowIds);

		setExpanded((currentExpanded) => {
			const persistedRowIds = extractExpandedRowIds(currentExpanded).filter((rowId) => availableRowIdSet.has(rowId));

			if (!hasInitializedExpansionRef.current) {
				hasInitializedExpansionRef.current = true;

				const seededRowIds = Array.from(
					new Set([...persistedRowIds, ...nextInitialExpandedRowIds.filter((rowId) => availableRowIdSet.has(rowId))])
				);

				return toExpandedState(seededRowIds);
			}

			return toExpandedState(persistedRowIds);
		});
	});

	const emitExpandedRowIdsChange = useEffectEvent((currentExpanded: ExpandedState) => {
		onExpandedRowIdsChange?.(extractExpandedRowIds(currentExpanded));
	});

	const emitReachEnd = useEffectEvent(() => {
		onReachEnd?.();
	});

	useEffect(() => {
		syncExpandedState(treeData.allRowIds, initialExpandedRowIds);
	}, [initialExpandedRowIds, treeData.allRowIds]);

	useEffect(() => {
		emitExpandedRowIdsChange(expanded);
	}, [expanded]);

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
	}, [isLoading, onReachEnd, treeData.rows.length]);

	const table = useReactTable<TreeTableRuntimeRow<TData>>({
		data: treeData.rows as TreeTableRuntimeRow<TData>[],
		columns: columns as TableColumnDef<TreeTableRuntimeRow<TData>>[],
		state: {
			columnOrder: resolvedColumnOrder,
			columnPinning: resolvedColumnPinning,
			columnSizing: resolvedColumnSizing,
			columnVisibility: resolvedColumnVisibility,
			expanded,
			rowSelection
		},
		getRowId: (row) => hierarchy.getRowId(row as TData),
		getSubRows: (row) => row.children,
		getCoreRowModel: getCoreRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		onColumnOrderChange: handleColumnOrderChange,
		onColumnPinningChange: handleColumnPinningChange,
		onColumnSizingChange: handleColumnSizingChange,
		onColumnVisibilityChange: handleColumnVisibilityChange,
		onExpandedChange: setExpanded,
		enableMultiRowSelection: selectionMode === "multi",
		enableRowSelection: (row) => {
			if (selectionMode === "none") {
				return false;
			}

			const originalRow = resolveOriginalRow(row, treeData.rowById);

			return getRowCanSelect ? getRowCanSelect(originalRow) : true;
		}
	});

	const visibleLeafColumns = getOrderedVisibleLeafColumns(table, baseTableColumnState);
	const resolvedTreeColumnId = treeColumnId ?? visibleLeafColumns[0]?.id;
	const rowModelRows = table.getRowModel().rows;
	const mergedCellLayout = useMemo(
		() =>
			buildBaseTableMergedCellsLayout({
				rows: rowModelRows,
				columns: visibleLeafColumns,
				resolveRowBoundaryKey: (row) => row.depth,
				excludeColumnIds: resolvedTreeColumnId ? new Set([resolvedTreeColumnId]) : undefined
			}),
		[rowModelRows, visibleLeafColumns, resolvedTreeColumnId]
	);

	/**
	 * Активирует строку: обновляет выбор в соответствии с режимом и вызывает внешний callback.
	 */
	const activateRow = (row: Row<TreeTableRuntimeRow<TData>>) => {
		const originalRow = resolveOriginalRow(row, treeData.rowById);

		activateRowSelection(row.id, row.getCanSelect());
		onRowClick?.(originalRow);
	};

	return (
		<BaseTable
			table={table}
			columnState={baseTableColumnState}
			title={title}
			isLoading={isLoading}
			isFetching={isFetching}
			className={className}
			tableClassName={tableClassName}
			selectionMode={selectionMode}
			scrollableRef={scrollableRef}
			interactiveElementSelector='[data-tree-table-interactive="true"]'
			onActivateRow={selectionMode !== "none" || onRowClick ? activateRow : undefined}
			isRowInteractive={(row) => Boolean(onRowClick || (selectionMode !== "none" && row.getCanSelect()))}
			getRowClassName={(row) => {
				const originalRow = resolveOriginalRow(row, treeData.rowById);

				return getRowClassName?.(originalRow);
			}}
			getCellClassName={({ row, cell }) =>
				cn(
					cell.column.id === resolvedTreeColumnId && styles.treeColumnCell,
					cell.column.id === resolvedTreeColumnId && row.getIsSelected() && styles.selectedIndicatorCell
				)
			}
			getCellLayout={({ cell }) => mergedCellLayout.get(cell.id)}
			renderHeaderContextMenu={renderHeaderContextMenu}
			enableColumnResizing={enableColumnResizing}
			enableColumnReordering={enableColumnReordering}
			columnResizeMinWidth={columnResizeMinWidth}
			renderCellContent={(args) => {
				const originalRow = resolveOriginalRow(args.row, treeData.rowById);
				const displayValue = formatPipelineDisplayValue({
					field: formattingSnapshot.runtimeByColumnId[args.cell.column.id],
					rawValue: args.cell.getValue(),
					rowData: originalRow as TableFormulaRowData,
					rowKind: "tree"
				});
				const defaultContent = shouldUseTableFormatting({
					columnId: args.cell.column.id,
					runtimeByColumnId: formattingSnapshot.runtimeByColumnId,
					customCellColumnIds: formattingSnapshot.customCellColumnIds
				}) ? (
					<FormattedTableCell displayValue={displayValue} align={args.columnMeta?.align} />
				) : (
					args.defaultContent
				);
				const content = renderCellContent
					? renderCellContent({
							...args,
							defaultContent,
							displayValue
						})
					: defaultContent;

				return renderTreeCellContent(args, content, resolvedTreeColumnId, indentSize);
			}}
			afterTableContent={onReachEnd ? <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" /> : null}
		/>
	);
}
