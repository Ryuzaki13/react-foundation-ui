import { useState } from "react";

import { useCopyText } from "@ryuzaki13/react-foundation-lib/copy";

import { ContextMenu } from "../../context-menu";
import { ANALYTICAL_TREE_COLUMN } from "../lib/analyticalTableLayout";
import { formatAnalyticalCell } from "../lib/formatAnalyticalCell";
import { type AnalyticalSelection } from "../model/useAnalyticalSelection";
import { type AnalyticalTableProps, type AnalyticalTableRuntime } from "../types/analyticalTable";

import { AnalyticalColumnMenu } from "./AnalyticalColumnMenu";

/** Контекстные команды используют raw values для фильтра и display values для clipboard. */
type AnalyticalBodyMenuProps<T> = Readonly<{
	rowId: string;
	columnId: string;
	runtime: AnalyticalTableRuntime<T>;
	selection: AnalyticalSelection<T>;
	options: AnalyticalTableProps<T>;
}>;

export function AnalyticalBodyMenu<T>({ rowId, columnId, runtime, selection, options }: AnalyticalBodyMenuProps<T>) {
	const { copyToClipboard } = useCopyText();
	const [copyFailed, setCopyFailed] = useState(false);
	const row = runtime.model.rowById.get(rowId);
	const column = runtime.visibleColumns.find((item) => item.id === columnId);
	if (!row) return null;
	const copy = async () => {
		const cells = selection.isCellSelected(rowId, columnId) ? selection.cells : [{ rowId, columnId }];
		const text = cells
			.flatMap((cell) => {
				const valueRow = runtime.model.rowById.get(cell.rowId);
				const valueColumn = runtime.visibleColumns.find((item) => item.id === cell.columnId);
				return valueRow && valueColumn
					? [formatAnalyticalCell(valueColumn, valueRow, runtime.formattingFields[valueColumn.id])]
					: [];
			})
			.join("\t");
		setCopyFailed(!(await copyToClipboard(text)));
	};
	return (
		<>
			{column ? (
				<>
					<ContextMenu.Item closeOnSelect={false} onSelect={() => void copy()}>
						Копировать значение
					</ContextMenu.Item>
					{copyFailed ? <div role="alert">Не удалось скопировать значение.</div> : null}
					{column.filterable !== false ? (
						<div data-action="filter-analytical-value">
							<ContextMenu.Item onSelect={() => runtime.filterColumn(column.id, row.values[column.id])}>
								Фильтровать по значению
							</ContextMenu.Item>
						</div>
					) : null}
					<ContextMenu.Separator />
					<AnalyticalColumnMenu column={column} runtime={runtime} enableGrouping={options.enableGrouping !== false} />
				</>
			) : null}
			{row.isExpandable || columnId === ANALYTICAL_TREE_COLUMN ? (
				<>
					<ContextMenu.Separator />
					<ContextMenu.Item disabled={!row.isExpandable} onSelect={() => runtime.collapseBranch(row.id)}>
						Свернуть ветку
					</ContextMenu.Item>
					<ContextMenu.Item onSelect={runtime.collapseAll}>Свернуть всё</ContextMenu.Item>
				</>
			) : null}
		</>
	);
}
