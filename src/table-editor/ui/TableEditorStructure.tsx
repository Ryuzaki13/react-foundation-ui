import { useState } from "react";

import { uuidv4 } from "@ryuzaki13/react-foundation-lib/crypto";
import {
	deleteTableDocumentAxisGroup,
	getTableDocumentAxisGroups,
	insertTableDocumentAxis,
	moveTableDocumentAxisGroup
} from "@ryuzaki13/react-foundation-lib/table-document";

import { Button } from "../../button";
import { Dialog } from "../../dialog";
import { type TableEditorController } from "../model/useTableEditor";

import styles from "./TableEditor.module.scss";

type TableEditorStructureProps<T> = {
	readonly editor: TableEditorController<T>;
	readonly createEmptyValue: () => T;
	readonly disabled?: boolean;
};

/** Вставка и доступный reorder без обязательного drag; удаление подтверждает весь затронутый блок. */
export function TableEditorStructure<T>({ editor, createEmptyValue, disabled }: TableEditorStructureProps<T>) {
	const [removing, setRemoving] = useState<"row" | "column" | null>(null);
	const { document, focus } = editor;
	const group = removing
		? getTableDocumentAxisGroups(document, removing).find(
				(item) => focus[removing] >= item.start && focus[removing] < item.start + item.count
			)
		: null;
	return (
		<>
			<details className={styles.structure}>
				<summary>Строки и столбцы</summary>
				{(["row", "column"] as const).map((axis) => (
					<div key={axis} className={styles.toolbar} role="group" aria-label={axis === "row" ? "Строки" : "Столбцы"}>
						<strong>{axis === "row" ? "Строка" : "Столбец"}</strong>
						{([0, 1] as const).map((offset) => (
							<Button
								key={offset}
								disabled={disabled}
								onClick={() => {
									const cells = Array.from(
										{ length: axis === "row" ? document.columns.length : document.rows.length },
										() => ({ id: uuidv4(), value: createEmptyValue() })
									);
									const id = uuidv4();
									editor.execute((current) =>
										insertTableDocumentAxis(
											current,
											axis,
											focus[axis] + offset,
											id,
											cells,
											focus.row < document.headerRowCount ? "header" : "body"
										)
									);
								}}>
								Вставить {offset ? "после" : "перед"}
							</Button>
						))}
						{([-1, 1] as const).map((direction) => (
							<Button
								key={direction}
								disabled={disabled}
								onClick={() =>
									editor.execute((current) => moveTableDocumentAxisGroup(current, axis, focus[axis], direction))
								}>
								Переместить {axis === "row" ? (direction === -1 ? "выше" : "ниже") : direction === -1 ? "левее" : "правее"}
							</Button>
						))}
						<Button tone="error" disabled={disabled} onClick={() => setRemoving(axis)}>
							Удалить {axis === "row" ? "строку" : "столбец"}
						</Button>
					</div>
				))}
				<Button
					disabled={disabled}
					onClick={() => {
						const cells = document.columns.map(() => ({ id: uuidv4(), value: createEmptyValue() }));
						const id = uuidv4();
						editor.execute((current) => insertTableDocumentAxis(current, "row", current.headerRowCount, id, cells, "header"));
					}}>
					Добавить строку заголовка
				</Button>
			</details>
			<Dialog
				open={Boolean(removing)}
				onClose={() => setRemoving(null)}
				title="Удалить часть таблицы?"
				description={`Будет удалено ${group?.count ?? 0} ${removing === "row" ? "строк" : "столбцов"}, включая скрытое объединением содержимое. Объединённая группа удаляется целиком. До сохранения действие можно отменить.`}>
				<div className={styles.toolbar}>
					<Button onClick={() => setRemoving(null)}>Не удалять</Button>
					<Button
						tone="error"
						disabled={disabled}
						onClick={() => {
							if (removing) editor.execute((current) => deleteTableDocumentAxisGroup(current, removing, focus[removing]));
							setRemoving(null);
						}}>
						Удалить группу
					</Button>
				</div>
			</Dialog>
		</>
	);
}
