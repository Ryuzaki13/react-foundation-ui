import { ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { Header } from "@tanstack/react-table";

import { TableHeaderInteractionCell } from "../../table-column-interactions";

import styles from "./BaseTable.module.scss";

interface BaseTableHeaderCellProps<TData extends object> {
	header: Header<TData, unknown>;
	isPinnedLeft: boolean;
	left?: string;
	isPinnedBoundary: boolean;
	isDragDisabled: boolean;
	enableColumnResizing: boolean;
	enableColumnReordering: boolean;
	columnResizeMinWidth: number | undefined;
	renderHeaderContent: (header: Header<TData, unknown>) => ReactNode;
	onResizeColumn: (columnId: string, width: number) => void;
	onResetColumnWidth: (columnId: string) => void;
}

export function BaseTableHeaderCell<TData extends object>({
	header,
	isPinnedLeft,
	left,
	isPinnedBoundary,
	isDragDisabled,
	enableColumnResizing,
	enableColumnReordering,
	columnResizeMinWidth,
	renderHeaderContent,
	onResizeColumn,
	onResetColumnWidth
}: BaseTableHeaderCellProps<TData>) {
	return (
		<TableHeaderInteractionCell
			columnId={header.column.id}
			dragDisabled={!enableColumnReordering || isDragDisabled}
			draggingClassName={styles.headerCellDragging}
			className={cn(styles.headerCell, isPinnedLeft && styles.headerCellPinnedLeft, isPinnedBoundary && styles.pinnedLeftBoundary)}
			style={{
				// NOTE: заголовок всегда по левому краю
				// ...(meta?.align ? { textAlign: meta.align } : {}),
				...(isPinnedLeft ? { left } : {})
			}}
			resizeHandle={
				enableColumnResizing && !header.isPlaceholder
					? {
							columnId: header.column.id,
							minWidth: columnResizeMinWidth,
							onResize: onResizeColumn,
							onReset: onResetColumnWidth
						}
					: undefined
			}>
			{({ listeners, setActivatorElement }) => (
				<div
					ref={enableColumnReordering && !isDragDisabled ? setActivatorElement : undefined}
					className={cn(styles.headerCellContent, enableColumnReordering && !isDragDisabled && styles.headerCellDraggable)}
					{...(enableColumnReordering && !isDragDisabled ? (listeners ?? {}) : {})}>
					{renderHeaderContent(header)}
				</div>
			)}
		</TableHeaderInteractionCell>
	);
}
