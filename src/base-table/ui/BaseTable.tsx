import {
	useCallback,
	useMemo,
	type CSSProperties,
	type KeyboardEvent as ReactKeyboardEvent,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	type Ref
} from "react";

import { DragEndEvent } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { flexRender, Header, type Cell, type Row, type Table as TanStackTable } from "@tanstack/react-table";

import type { FormattersPipelineDisplayValue } from "@ryuzaki13/react-foundation-lib/formatters";
import { useDndSortableSensors } from "@ryuzaki13/react-foundation-lib/hooks";
import {
	getTableColumnMeta,
	isTableInteractiveElement,
	patchTableColumnWidth,
	removeTableColumnWidth,
	resolveReorderedTableHeaderColumns,
	resolveTableColumnOrder,
	type TableColumnMeta,
	type TableSelectionMode
} from "@ryuzaki13/react-foundation-lib/table";
import { cn, handleKeyboardActivation } from "@ryuzaki13/react-foundation-lib/utils";

import { ContextMenu } from "../../context-menu";
import { GridContainer } from "../../grid";
import { LoadingMessage, NoData, Scrollable } from "../../misc";
import { getSortableReorderResult, Sortable } from "../../sortable";
import { BaseTableColumnState, buildBaseTableColumnLayout, getLeftPinnedColumnOffsets } from "../lib/columnPinning";
import { BaseTableCellLayout } from "../lib/mergeDuplicates";

import styles from "./BaseTable.module.scss";
import { BaseTableHeaderCell } from "./BaseTableHeaderCell";

/**
 * Аргументы кастомизации рендера ячейки базовой таблицы.
 */
export interface BaseTableCellRenderArgs<TData extends object> {
	row: Row<TData>;
	cell: Cell<TData, unknown>;
	defaultContent: ReactNode;
	/**
	 * Display-модель ячейки после общего formatting runtime.
	 *
	 * BaseTable сам не форматирует значения, поэтому поле заполняют адаптеры
	 * `Table`/`TreeTable`. Слот может отсутствовать у низкоуровневых
	 * потребителей BaseTable.
	 */
	displayValue?: FormattersPipelineDisplayValue;
	columnMeta?: TableColumnMeta;
}

/**
 * Внутренний базовый рендерер таблицы.
 *
 * Не знает о плоских или древовидных данных и работает с уже подготовленным экземпляром TanStack Table.
 *
 * @NOTE: не для использования напрямую, это база для `Table` и `TreeTable`
 */
export interface BaseTableProps<TData extends object> {
	table: TanStackTable<TData>;
	columnState: BaseTableColumnState;
	title?: string;
	isLoading?: boolean;
	isFetching?: boolean;
	className?: string;
	minHeight?: `${number}em` | `${number}%`;
	tableClassName?: string;
	selectionMode?: TableSelectionMode;
	scrollableRef?: Ref<HTMLDivElement>;
	interactiveElementSelector?: string;
	onActivateRow?: (row: Row<TData>) => void;
	isRowInteractive?: (row: Row<TData>) => boolean;
	getRowClassName?: (row: Row<TData>) => string | undefined;
	getCellClassName?: (args: BaseTableCellRenderArgs<TData>) => string | undefined;
	getCellStyle?: (args: BaseTableCellRenderArgs<TData>) => CSSProperties | undefined;
	getCellLayout?: (args: BaseTableCellRenderArgs<TData>) => BaseTableCellLayout | undefined;
	renderCellContent?: (args: BaseTableCellRenderArgs<TData>) => ReactNode;
	/**
	 * Общий слот контекстного меню заголовка.
	 *
	 * BaseTable намеренно не знает про сортировку, группировку или доменные
	 * действия. Он только сохраняет единый доступный способ открыть меню для
	 * `Table` и `TreeTable`, а содержимое передает потребитель.
	 */
	renderHeaderContextMenu?: (header: Header<TData, unknown>) => ReactNode;
	enableColumnResizing?: boolean;
	enableColumnReordering?: boolean;
	columnResizeMinWidth?: number;
	afterTableContent?: ReactNode;
}

/**
 * Объединяет header groups из pinned/center/right зон в единый порядок рендера.
 */
function resolveHeaderOrderIndex<TData extends object>(
	header: Header<TData, unknown>,
	columnIndexById: ReadonlyMap<string, number>
): number {
	const indexes = header
		.getLeafHeaders()
		.map((leafHeader) => columnIndexById.get(leafHeader.column.id))
		.filter((index): index is number => typeof index === "number");

	return indexes.length ? Math.min(...indexes) : Number.MAX_SAFE_INTEGER;
}

function buildOrderedHeaderGroups<TData extends object>(
	table: TanStackTable<TData>,
	columnIndexById: ReadonlyMap<string, number>
): Header<TData, unknown>[][] {
	const leftHeaderGroups = table.getLeftHeaderGroups();
	const centerHeaderGroups = table.getCenterHeaderGroups();
	const rightHeaderGroups = table.getRightHeaderGroups();
	const headerGroupCount = Math.max(leftHeaderGroups.length, centerHeaderGroups.length, rightHeaderGroups.length);

	return Array.from({ length: headerGroupCount }, (_, index) => {
		const headers = [
			...(leftHeaderGroups[index]?.headers ?? []),
			...(centerHeaderGroups[index]?.headers ?? []),
			...(rightHeaderGroups[index]?.headers ?? [])
		];

		return headers
			.filter((header) => {
				if (header.isPlaceholder) return true;

				return header.getLeafHeaders().some((leafHeader) => columnIndexById.has(leafHeader.column.id));
			})
			.sort((left, right) => resolveHeaderOrderIndex(left, columnIndexById) - resolveHeaderOrderIndex(right, columnIndexById));
	});
}

/**
 * Проверяет, что весь header целиком относится к pinned-left зоне.
 *
 * Смешанные grouped headers намеренно не переводятся в sticky-режим в первой итерации.
 */
function resolveHeaderPinnedLeftState<TData extends object>(
	header: Header<TData, unknown>,
	leftPinnedOffsets: Readonly<Record<string, string>>,
	lastPinnedColumnId: string | undefined
): { isPinnedLeft: boolean; left?: string; isPinnedBoundary: boolean } {
	const leafHeaders = header.getLeafHeaders();
	const leafColumnIds = leafHeaders.map((leafHeader) => leafHeader.column.id);
	const isPinnedLeft = leafColumnIds.length > 0 && leafColumnIds.every((columnId) => columnId in leftPinnedOffsets);

	if (!isPinnedLeft) {
		return {
			isPinnedLeft: false,
			isPinnedBoundary: false
		};
	}

	return {
		isPinnedLeft: true,
		left: leftPinnedOffsets[leafColumnIds[0]!] ?? "0px",
		isPinnedBoundary: Boolean(lastPinnedColumnId && leafColumnIds.includes(lastPinnedColumnId))
	};
}

function getCurrentLeafColumnOrder<TData extends object>(table: TanStackTable<TData>, columnState: BaseTableColumnState): string[] {
	const definedColumnIds = table.getAllLeafColumns().map((column) => column.id);

	return resolveTableColumnOrder({
		ids: definedColumnIds,
		order: columnState.columnOrder
	});
}

/**
 * Базовая таблица с общим UI-каркасом для Table и TreeTable.
 *
 * @NOTE: не для использования напрямую, это база для `Table` и `TreeTable`
 */
export function BaseTable<TData extends object>({
	table,
	columnState,
	title,
	isLoading,
	isFetching,
	className,
	minHeight = "15em",
	tableClassName,
	selectionMode = "none",
	scrollableRef,
	interactiveElementSelector,
	onActivateRow,
	isRowInteractive,
	getRowClassName,
	getCellClassName,
	getCellStyle,
	getCellLayout,
	renderCellContent,
	renderHeaderContextMenu,
	enableColumnResizing = false,
	enableColumnReordering = false,
	columnResizeMinWidth,
	afterTableContent
}: BaseTableProps<TData>) {
	const columnLayout = buildBaseTableColumnLayout(table, columnState);
	const visibleColumns = useMemo(() => columnLayout.map((column) => column.column), [columnLayout]);
	const visibleColumnIds = useMemo(() => columnLayout.map((column) => column.id), [columnLayout]);
	const visibleColumnIndexById = useMemo(() => new Map(visibleColumnIds.map((columnId, index) => [columnId, index])), [visibleColumnIds]);
	const visibleColumnIdSet = useMemo(() => new Set(visibleColumnIds), [visibleColumnIds]);
	const sensors = useDndSortableSensors({ activationDistance: 8 });
	const orderedHeaderGroups = buildOrderedHeaderGroups(table, visibleColumnIndexById);
	const leftPinnedOffsets = getLeftPinnedColumnOffsets(table, columnState);
	const lastPinnedColumnId = visibleColumns.filter((column) => column.getIsPinned() === "left").at(-1)?.id;
	const pinnedLeftColumnIds = useMemo(() => columnState.columnPinning.left ?? [], [columnState.columnPinning.left]);
	const pinnedLeftColumnIdSet = useMemo(() => new Set(pinnedLeftColumnIds), [pinnedLeftColumnIds]);
	const rowModel = table.getRowModel();
	const hasTitle = Boolean(title);
	const hasRows = rowModel.rows.length > 0;
	const orderVisibleCells = useCallback(
		(cells: readonly Cell<TData, unknown>[]) =>
			[...cells].sort(
				(left, right) =>
					(visibleColumnIndexById.get(left.column.id) ?? Number.MAX_SAFE_INTEGER) -
					(visibleColumnIndexById.get(right.column.id) ?? Number.MAX_SAFE_INTEGER)
			),
		[visibleColumnIndexById]
	);

	const handleResizeColumn = useCallback(
		(columnId: string, width: number) => {
			table.setColumnSizing((current) => patchTableColumnWidth(current, columnId, width, columnResizeMinWidth));
		},
		[columnResizeMinWidth, table]
	);

	const handleResetColumnWidth = useCallback(
		(columnId: string) => {
			table.setColumnSizing((current) => removeTableColumnWidth(current, columnId));
		},
		[table]
	);

	const handleHeaderColumnDragEnd = useCallback(
		(event: DragEndEvent) => {
			const reorder = getSortableReorderResult({
				event,
				items: visibleColumnIds
			});
			if (!reorder) return;

			const currentOrder = getCurrentLeafColumnOrder(table, columnState);
			const nextOrder = resolveReorderedTableHeaderColumns({
				order: currentOrder,
				headerIds: visibleColumnIds,
				pinnedIds: pinnedLeftColumnIds,
				activeId: String(reorder.activeId),
				overId: String(reorder.overId)
			});

			if (!nextOrder) return;

			table.setColumnOrder(nextOrder);
		},
		[columnState, pinnedLeftColumnIds, table, visibleColumnIds]
	);

	const renderHeaderContent = (header: Header<TData, unknown>) => {
		if (header.isPlaceholder) return null;

		const content = flexRender(header.column.columnDef.header, header.getContext());
		const menu = renderHeaderContextMenu?.(header);

		if (!menu) {
			return content;
		}

		return (
			<ContextMenu>
				<ContextMenu.Trigger>
					<div className={styles.headerContextMenuTrigger} tabIndex={0}>
						{content}
					</div>
				</ContextMenu.Trigger>
				<ContextMenu.Content>{menu}</ContextMenu.Content>
			</ContextMenu>
		);
	};

	/**
	 * Обрабатывает клик по строке, не перехватывая вложенные интерактивные элементы.
	 */
	const handleRowClick = (event: ReactMouseEvent<HTMLTableRowElement>, row: Row<TData>) => {
		const interactive = isRowInteractive?.(row) ?? Boolean(onActivateRow);

		if (!interactive || !onActivateRow || isTableInteractiveElement(event.target, interactiveElementSelector)) {
			return;
		}

		onActivateRow(row);
	};

	/**
	 * Дублирует активацию строки для клавиатуры.
	 */
	const handleRowKeyDown = (event: ReactKeyboardEvent<HTMLTableRowElement>, row: Row<TData>) => {
		const interactive = isRowInteractive?.(row) ?? Boolean(onActivateRow);

		if (!interactive || !onActivateRow || isTableInteractiveElement(event.target, interactiveElementSelector)) {
			return;
		}

		handleKeyboardActivation(event, () => onActivateRow(row));
	};

	return (
		<GridContainer
			templateRows={hasTitle ? "auto 1fr" : "1fr"}
			className={cn("overflowHidden w100 h100", styles.root, className)}
			style={{ minHeight }}>
			{hasTitle && <h3 className="marginBottomXs">{title}</h3>}

			<div className="surface0 overflowHidden relative w100 h100">
				<Scrollable ref={scrollableRef} className="w100 h100">
					<>
						<table className={cn(styles.table, tableClassName)}>
							<colgroup>
								{columnLayout.map((column) => (
									<col key={column.id} style={column.width ? { width: column.width } : undefined} />
								))}
							</colgroup>

							<thead className={cn("stickyTop", styles.head)}>
								{enableColumnReordering ? (
									<Sortable.Root
										sensors={sensors}
										modifiers={[restrictToHorizontalAxis]}
										onDragEnd={handleHeaderColumnDragEnd}>
										<Sortable.Container containerId="base-table-header" items={visibleColumnIds} layout="horizontal">
											{orderedHeaderGroups.map((headers, headerGroupIndex) => (
												<tr key={`header-group-${headerGroupIndex}`} className={styles.headerRow}>
													{headers.map((header) => {
														const { isPinnedLeft, left, isPinnedBoundary } = resolveHeaderPinnedLeftState(
															header,
															leftPinnedOffsets,
															lastPinnedColumnId
														);
														const isDragDisabled =
															header.isPlaceholder ||
															!visibleColumnIdSet.has(header.column.id) ||
															pinnedLeftColumnIdSet.has(header.column.id);

														return (
															<BaseTableHeaderCell
																key={header.id}
																header={header}
																isPinnedLeft={isPinnedLeft}
																left={left}
																isPinnedBoundary={isPinnedBoundary}
																isDragDisabled={isDragDisabled}
																enableColumnResizing={enableColumnResizing}
																enableColumnReordering={enableColumnReordering}
																columnResizeMinWidth={columnResizeMinWidth}
																renderHeaderContent={renderHeaderContent}
																onResizeColumn={handleResizeColumn}
																onResetColumnWidth={handleResetColumnWidth}
															/>
														);
													})}
												</tr>
											))}
										</Sortable.Container>
									</Sortable.Root>
								) : (
									orderedHeaderGroups.map((headers, headerGroupIndex) => (
										<tr key={`header-group-${headerGroupIndex}`} className={styles.headerRow}>
											{headers.map((header) => {
												const { isPinnedLeft, left, isPinnedBoundary } = resolveHeaderPinnedLeftState(
													header,
													leftPinnedOffsets,
													lastPinnedColumnId
												);

												return (
													<BaseTableHeaderCell
														key={header.id}
														header={header}
														isPinnedLeft={isPinnedLeft}
														left={left}
														isPinnedBoundary={isPinnedBoundary}
														isDragDisabled
														enableColumnResizing={enableColumnResizing}
														enableColumnReordering={enableColumnReordering}
														columnResizeMinWidth={columnResizeMinWidth}
														renderHeaderContent={renderHeaderContent}
														onResizeColumn={handleResizeColumn}
														onResetColumnWidth={handleResetColumnWidth}
													/>
												);
											})}
										</tr>
									))
								)}
							</thead>

							<tbody>
								{rowModel.rows.map((row) => {
									const interactive = isRowInteractive?.(row) ?? Boolean(onActivateRow);

									return (
										<tr
											key={row.id}
											className={cn(
												styles.bodyRow,
												interactive && styles.bodyRowInteractive,
												row.getIsSelected() && styles.bodyRowSelected,
												getRowClassName?.(row)
											)}
											aria-selected={selectionMode !== "none" ? row.getIsSelected() : undefined}
											tabIndex={interactive ? 0 : undefined}
											onClick={(event) => handleRowClick(event, row)}
											onKeyDown={(event) => handleRowKeyDown(event, row)}>
											{orderVisibleCells([
												...row.getLeftVisibleCells(),
												...row.getCenterVisibleCells(),
												...row.getRightVisibleCells()
											]).map((cell) => {
												const columnMeta = getTableColumnMeta(cell.column.columnDef);
												const defaultContent = flexRender(cell.column.columnDef.cell, cell.getContext());
												const renderArgs: BaseTableCellRenderArgs<TData> = {
													row,
													cell,
													defaultContent,
													columnMeta
												};
												const cellLayout = getCellLayout?.(renderArgs);
												const isPinnedLeft = cell.column.getIsPinned() === "left";
												const isPinnedBoundary = cell.column.id === lastPinnedColumnId;

												const resolvedStyle = {
													...(columnMeta?.align ? { textAlign: columnMeta.align } : {}),
													...(isPinnedLeft ? { left: leftPinnedOffsets[cell.column.id] ?? "0px" } : {}),
													...(getCellStyle?.(renderArgs) ?? {})
												};

												return (
													<td
														key={cell.id}
														className={cn(
															styles.bodyCell,
															isPinnedLeft && styles.bodyCellPinnedLeft,
															isPinnedBoundary && styles.pinnedLeftBoundary,
															cellLayout?.mergeWithNext && styles.bodyCellMergedWithNext,
															getCellClassName?.(renderArgs)
														)}
														style={resolvedStyle}>
														{cellLayout?.hideContent
															? null
															: renderCellContent
																? renderCellContent(renderArgs)
																: defaultContent}
													</td>
												);
											})}
										</tr>
									);
								})}

								{isFetching && hasRows && (
									<tr className={styles.fetchingRow}>
										<td colSpan={Math.max(visibleColumns.length, 1)} className={styles.feedbackCell}>
											<LoadingMessage />
										</td>
									</tr>
								)}
							</tbody>
						</table>

						{afterTableContent}
					</>
				</Scrollable>

				<div className="absolute inset0 border radiusSm" style={{ pointerEvents: "none", zIndex: 20 }}>
					{!isLoading && !isFetching && !hasRows && <NoData className={styles.noData} />}
					{isLoading && !hasRows && <LoadingMessage className="h100 w100" />}
				</div>
			</div>
		</GridContainer>
	);
}
