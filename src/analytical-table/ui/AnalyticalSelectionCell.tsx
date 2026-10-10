import { type AnalyticalModelRow } from "@ryuzaki13/react-foundation-lib/analytical-table";

import { CheckBox } from "../../check-box";
import { RadioButton } from "../../radio-button";
import { type AnalyticalSelection } from "../model/useAnalyticalSelection";

import styles from "./AnalyticalTable.module.scss";

/** Явный selector имеет собственный столбец; none действительно выключает выбор строк. */
type AnalyticalSelectionCellProps<T> = Readonly<{ row: AnalyticalModelRow<T>; selection: AnalyticalSelection<T>; instanceId: string }>;

export function AnalyticalSelectionCell<T>({ row, selection, instanceId }: AnalyticalSelectionCellProps<T>) {
	if (selection.rowMode === "none") return null;
	const canSelect = selection.canSelectRow(row.id);
	return (
		<td className={styles.selectionCell}>
			{canSelect ? (
				selection.rowMode === "multi" ? (
					<CheckBox
						value={Boolean(selection.rows[row.id])}
						onChange={() => selection.selectRow(row)}
						aria-label="Выбрать строку"
						data-row-id={row.id}
					/>
				) : (
					<RadioButton
						value={Boolean(selection.rows[row.id])}
						onChange={() => selection.selectRow(row)}
						aria-label="Выбрать строку"
						name={`${instanceId}-row`}
						data-row-id={row.id}
					/>
				)
			) : null}
		</td>
	);
}
