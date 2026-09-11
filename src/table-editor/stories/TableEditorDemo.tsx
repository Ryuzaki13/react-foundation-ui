import { Textarea } from "../../textarea";
import { TableEditor, useTableEditor } from "../index";

import { tableEditorDemoDocument } from "./tableEditorDemoDocument";

/** Рабочий пример host-интеграции; production приложение заменяет plain text своим редактором значения. */
export function TableEditorDemo() {
	const editor = useTableEditor(tableEditorDemoDocument);
	return (
		<TableEditor
			editor={editor}
			createEmptyValue={() => ""}
			getCellText={(cell) => cell.value}
			renderCell={(cell) => cell.value || "Пустая ячейка"}
			renderValueEditor={({ cell, disabled, onChange }) => (
				<Textarea label="Содержимое ячейки" value={cell.value} disabled={disabled} onChange={onChange} />
			)}
		/>
	);
}
