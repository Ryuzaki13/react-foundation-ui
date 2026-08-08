import { ReactNode } from "react";

import { type FoundationTableHeader } from "@ryuzaki13/react-foundation-lib/table";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { TableHeaderInteractionCell } from "../../table-column-interactions";

import styles from "./BaseTable.module.scss";

interface BaseTableHeaderCellProps<TData extends object> {
	header: FoundationTableHeader<TData>;
	isPinnedStart: boolean;
	insetInlineStart?: string;
	isPinnedBoundary: boolean;
	isDragDisabled: boolean;
	enableColumnResizing: boolean;
	enableColumnReordering: boolean;
	columnResizeMinWidth: number | undefined;
	renderHeaderContent: (header: FoundationTableHeader<TData>) => ReactNode;
	onResizeColumn: (columnId: string, width: number) => void;
	onResetColumnWidth: (columnId: string) => void;
}

export function BaseTableHeaderCell<TData extends object>({
	header,
	isPinnedStart,
	insetInlineStart,
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
			className={cn(styles.headerCell, isPinnedStart && styles.headerCellPinnedStart, isPinnedBoundary && styles.pinnedStartBoundary)}
			style={{
				// NOTE: заголовок всегда по левому краю
				// ...(meta?.align ? { textAlign: meta.align } : {}),
				...(isPinnedStart ? { insetInlineStart } : {})
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
