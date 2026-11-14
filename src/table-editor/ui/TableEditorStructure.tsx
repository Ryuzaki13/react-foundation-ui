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
import { UI_TONE_ERROR } from "../../uiSchemeConstants";
import { type TableEditorController } from "../model/useTableEditor";

import styles from "./TableEditor.module.scss";

const TABLE_DOCUMENT_AXIS_ROW = "row";
const TABLE_DOCUMENT_AXIS_COLUMN = "column";
const TABLE_DOCUMENT_ROW_HEADER = "header";

type TableEditorStructureProps<T> = {
	readonly editor: TableEditorController<T>;
	readonly createEmptyValue: () => T;
	readonly disabled?: boolean;
};

/** Вставка и доступный reorder без обязательного drag; удаление подтверждает весь затронутый блок. */
export function TableEditorStructure<T>({ editor, createEmptyValue, disabled }: TableEditorStructureProps<T>) {
	const [removing, setRemoving] = useState<typeof TABLE_DOCUMENT_AXIS_ROW | typeof TABLE_DOCUMENT_AXIS_COLUMN | null>(null);
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
				{([TABLE_DOCUMENT_AXIS_ROW, TABLE_DOCUMENT_AXIS_COLUMN] as const).map((axis) => (
					<div
						key={axis}
						className={styles.toolbar}
						role="group"
						aria-label={axis === TABLE_DOCUMENT_AXIS_ROW ? "Строки" : "Столбцы"}>
						<strong>{axis === TABLE_DOCUMENT_AXIS_ROW ? "Строка" : "Столбец"}</strong>
						{([0, 1] as const).map((offset) => (
							<Button
								key={offset}
								disabled={disabled}
								onClick={() => {
									const cells = Array.from(
										{ length: axis === TABLE_DOCUMENT_AXIS_ROW ? document.columns.length : document.rows.length },
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
											focus.row < document.headerRowCount ? TABLE_DOCUMENT_ROW_HEADER : "body"
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
								Переместить{" "}
								{axis === TABLE_DOCUMENT_AXIS_ROW
									? direction === -1
										? "выше"
										: "ниже"
									: direction === -1
										? "левее"
										: "правее"}
							</Button>
						))}
						<Button tone={UI_TONE_ERROR} disabled={disabled} onClick={() => setRemoving(axis)}>
							Удалить {axis === TABLE_DOCUMENT_AXIS_ROW ? "строку" : "столбец"}
						</Button>
					</div>
				))}
				<Button
					disabled={disabled}
					onClick={() => {
						const cells = document.columns.map(() => ({ id: uuidv4(), value: createEmptyValue() }));
						const id = uuidv4();
						editor.execute((current) =>
							insertTableDocumentAxis(
								current,
								TABLE_DOCUMENT_AXIS_ROW,
								current.headerRowCount,
								id,
								cells,
								TABLE_DOCUMENT_ROW_HEADER
							)
						);
					}}>
					Добавить строку заголовка
				</Button>
			</details>
			<Dialog
				open={Boolean(removing)}
				onClose={() => setRemoving(null)}
				title="Удалить часть таблицы?"
				description={`Будет удалено ${group?.count ?? 0} ${removing === TABLE_DOCUMENT_AXIS_ROW ? "строк" : "столбцов"}, включая скрытое объединением содержимое. Объединённая группа удаляется целиком. До сохранения действие можно отменить.`}>
				<div className={styles.toolbar}>
					<Button onClick={() => setRemoving(null)}>Не удалять</Button>
					<Button
						tone={UI_TONE_ERROR}
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
