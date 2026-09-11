import {
	mergeTableDocumentCells,
	splitTableDocumentCell,
	type TableDocumentPosition
} from "@ryuzaki13/react-foundation-lib/table-document";

import { Button } from "../../button";
import { CheckBox } from "../../check-box";
import { type TableEditorController } from "../model/useTableEditor";

import styles from "./TableEditor.module.scss";

type TableEditorToolbarProps<T> = {
	readonly editor: TableEditorController<T>;
	readonly disabled?: boolean;
	readonly extendSelection: boolean;
	readonly onExtendSelectionChange: (value: boolean) => void;
};

/** Явные названия действий вместо скрытых режимов merge/split из legacy. */
export function TableEditorToolbar<T>({ editor, disabled, extendSelection, onExtendSelectionChange }: TableEditorToolbarProps<T>) {
	const { document, selection } = editor;
	const end: TableDocumentPosition = { row: selection.row + selection.rowSpan - 1, column: selection.column + selection.columnSpan - 1 };
	const isSingle = selection.rowSpan * selection.columnSpan === 1;
	const crossesHeader = selection.row < document.headerRowCount && end.row >= document.headerRowCount;
	const merge = document.merges.find(
		(range) =>
			range.row === selection.row &&
			range.column === selection.column &&
			range.rowSpan === selection.rowSpan &&
			range.columnSpan === selection.columnSpan
	);
	return (
		<div className={styles.toolbar} role="group" aria-label="История и объединение">
			<Button disabled={disabled || !editor.canUndo} onClick={editor.undo}>
				Отменить
			</Button>
			<Button disabled={disabled || !editor.canRedo} onClick={editor.redo}>
				Повторить
			</Button>
			<Button
				disabled={disabled || isSingle || crossesHeader || Boolean(merge)}
				onClick={() => editor.execute((current) => mergeTableDocumentCells(current, selection, end))}>
				Объединить ячейки
			</Button>
			<Button disabled={disabled || !merge} onClick={() => editor.execute((current) => splitTableDocumentCell(current, selection))}>
				Разъединить ячейки
			</Button>
			<CheckBox label="Выделять диапазон" value={extendSelection} disabled={disabled} onChange={onExtendSelectionChange} />
			<span role="status">
				Выделение: {selection.rowSpan} × {selection.columnSpan}. Шаг {editor.historyPosition} из {editor.historyLength - 1}.
			</span>
			{crossesHeader ? <p>Заголовок и основную часть нельзя объединить в одну ячейку.</p> : null}
		</div>
	);
}
