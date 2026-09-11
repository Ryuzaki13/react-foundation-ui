import { useId, useRef, type ReactNode } from "react";

import {
	getTableDocumentCellRange,
	type TableDocumentCell,
	type TableDocumentPosition
} from "@ryuzaki13/react-foundation-lib/table-document";

import { type TableEditorController } from "../model/useTableEditor";
import { useTableEditorTable } from "../model/useTableEditorTable";

import styles from "./TableEditor.module.scss";

type TableEditorGridProps<T> = {
	readonly editor: TableEditorController<T>;
	readonly extendSelection: boolean;
	readonly disabled?: boolean;
	readonly renderCell: (cell: TableDocumentCell<T>) => ReactNode;
	readonly getCellText: (cell: TableDocumentCell<T>) => string;
};

/** Доступная сетка: roving tabindex, стрелки/Shift и выбор диапазона без drag-only действий. */
export function TableEditorGrid<T>({ editor, extendSelection, disabled, renderCell, getCellText }: TableEditorGridProps<T>) {
	const helpId = useId();
	const nodes = useRef(new Map<string, HTMLTableCellElement>());
	const table = useTableEditorTable(editor.document);
	const { document, selection, focus } = editor;
	return (
		<>
			<p id={helpId} className={styles.help}>
				Стрелки — переход между ячейками. Shift + стрелки или Shift + щелчок — выделение диапазона. Содержимое выбранной ячейки
				редактируется под таблицей.
			</p>
			<div className={styles.scroll}>
				<table
					role="grid"
					aria-label={document.caption || "Редактор таблицы"}
					aria-describedby={helpId}
					aria-multiselectable="true"
					aria-disabled={disabled || undefined}
					className={styles.table}>
					<colgroup>
						{document.columns.map((column) => (
							<col key={column.id} style={{ width: column.width ?? 180 }} />
						))}
					</colgroup>
					<tbody>
						{table.getRowModel().rows.map((row) => (
							<tr key={row.id} aria-rowindex={row.index + 1} data-header={row.index < document.headerRowCount || undefined}>
								{row.getAllCells().map((cell, column) => {
									if (cell.getIsCovered()) return null;
									const selected =
										row.index >= selection.row &&
										row.index < selection.row + selection.rowSpan &&
										column >= selection.column &&
										column < selection.column + selection.columnSpan;
									const position = { row: row.index, column };
									const original = row.original.cells[column];
									const Cell = row.index < document.headerRowCount ? "th" : "td";
									return (
										<Cell
											key={cell.id}
											role={row.index < document.headerRowCount ? "columnheader" : "gridcell"}
											ref={(node) => {
												if (node) nodes.current.set(original.id, node);
												else nodes.current.delete(original.id);
											}}
											rowSpan={cell.getRowSpan()}
											colSpan={cell.getColSpan()}
											aria-colindex={column + 1}
											aria-label={`Строка ${row.index + 1}, столбец ${column + 1}: ${getCellText(original) || "Пустая ячейка"}`}
											aria-selected={selected}
											tabIndex={!disabled && focus.row === row.index && focus.column === column ? 0 : -1}
											onClick={(event) => {
												if (!disabled) editor.select(position, extendSelection || event.shiftKey);
											}}
											onPointerEnter={(event) => {
												if (!disabled && event.pointerType === "mouse" && event.buttons === 1)
													editor.select(position, true);
											}}
											onKeyDown={(event) => {
												if (disabled || event.altKey || event.ctrlKey || event.metaKey) return;
												let next: TableDocumentPosition;
												switch (event.key) {
													case "ArrowRight":
														next = { ...position, column: column + cell.getColSpan() };
														break;
													case "ArrowLeft":
														next = { ...position, column: column - 1 };
														break;
													case "ArrowDown":
														next = { ...position, row: row.index + cell.getRowSpan() };
														break;
													case "ArrowUp":
														next = { ...position, row: row.index - 1 };
														break;
													case "Home":
														next = { ...position, column: 0 };
														break;
													case "End":
														next = { ...position, column: document.columns.length - 1 };
														break;
													case " ":
														event.preventDefault();
														editor.select(position, event.shiftKey);
														return;
													default:
														return;
												}
												event.preventDefault();
												if (
													next.row < 0 ||
													next.column < 0 ||
													next.row >= document.rows.length ||
													next.column >= document.columns.length
												)
													return;
												const range = getTableDocumentCellRange(document, next);
												editor.select(next, event.shiftKey);
												nodes.current.get(document.rows[range.row].cells[range.column].id)?.focus();
											}}>
											{/* Preview не должен создавать вложенные tab stops или открывать ссылки вместо выделения. */}
											{row.index < document.headerRowCount ? (
												<span className="visuallyHidden">{getCellText(original) || "Пустой заголовок"}</span>
											) : null}
											<div inert className={styles.cellContent}>
												{renderCell(original)}
											</div>
										</Cell>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
}
