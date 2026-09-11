import { useState, type ReactNode } from "react";

import { updateTableDocumentCell, type TableDocumentCell } from "@ryuzaki13/react-foundation-lib/table-document";

import { CheckBox } from "../../check-box";
import { Input, InputNumber } from "../../input";
import { type TableEditorController } from "../model/useTableEditor";

import styles from "./TableEditor.module.scss";
import { TableEditorGrid } from "./TableEditorGrid";
import { TableEditorStructure } from "./TableEditorStructure";
import { TableEditorToolbar } from "./TableEditorToolbar";

/** Host задаёт редактор содержимого: plain text, Lexical или ссылки на документы без KTK-зависимости пакета. */
export type TableEditorValueProps<T> = {
	readonly cell: TableDocumentCell<T>;
	readonly disabled: boolean;
	readonly onChange: (value: T) => void;
};
export type TableEditorProps<T> = {
	readonly editor: TableEditorController<T>;
	readonly renderCell: (cell: TableDocumentCell<T>) => ReactNode;
	/** Доступное текстовое представление preview, в котором интерактивные ссылки отключены. */
	readonly getCellText: (cell: TableDocumentCell<T>) => string;
	readonly renderValueEditor: (props: TableEditorValueProps<T>) => ReactNode;
	readonly createEmptyValue: () => T;
	readonly disabled?: boolean;
};

/** Композиция редактора, не владеющая transport, server state или форматом содержимого ячеек. */
export function TableEditor<T>({
	editor,
	renderCell,
	getCellText,
	renderValueEditor,
	createEmptyValue,
	disabled = false
}: TableEditorProps<T>) {
	const [extendSelection, setExtendSelection] = useState(false);
	const { document, focus } = editor;
	const cell = document.rows[focus.row].cells[focus.column];
	return (
		<section className={styles.editor} aria-label="Конструктор таблицы">
			<Input
				label="Название таблицы"
				value={document.caption}
				disabled={disabled}
				onChange={(caption) => editor.change({ ...document, caption: caption ?? "" })}
			/>
			<TableEditorToolbar
				editor={editor}
				disabled={disabled}
				extendSelection={extendSelection}
				onExtendSelectionChange={setExtendSelection}
			/>
			{editor.error ? <p role="alert">{editor.error}</p> : null}
			<TableEditorGrid
				editor={editor}
				disabled={disabled}
				renderCell={renderCell}
				getCellText={getCellText}
				extendSelection={extendSelection}
			/>
			<div className={styles.inspector}>
				<strong>
					Ячейка: строка {focus.row + 1}, столбец {focus.column + 1}
				</strong>
				{renderValueEditor({ cell, disabled, onChange: (value) => editor.change(updateTableDocumentCell(document, focus, value)) })}
				{editor.selection.rowSpan * editor.selection.columnSpan > 1 ? (
					<p>
						При объединении показывается верхняя левая ячейка. Остальное содержимое сохранится и снова появится после
						разъединения.
					</p>
				) : null}
			</div>
			<TableEditorStructure editor={editor} disabled={disabled} createEmptyValue={createEmptyValue} />
			<div className={styles.toolbar}>
				<CheckBox
					label="Скрыть заголовки при публикации"
					value={document.hideHeaders}
					disabled={disabled}
					onChange={(hideHeaders) => editor.change({ ...document, hideHeaders })}
				/>
				<CheckBox
					label="Показывать номера строк"
					value={document.showRowNumbers}
					disabled={disabled}
					onChange={(showRowNumbers) => editor.change({ ...document, showRowNumbers })}
				/>
				<InputNumber
					label="Ширина выбранного столбца, px"
					value={document.columns[focus.column].width ?? undefined}
					min={40}
					max={1600}
					disabled={disabled}
					onChange={(width) => {
						if (width !== undefined && (width < 40 || width > 1600)) return;
						editor.change({
							...document,
							columns: document.columns.map((column, c) =>
								c === focus.column ? { ...column, width: width ?? null } : column
							)
						});
					}}
				/>
			</div>
		</section>
	);
}
