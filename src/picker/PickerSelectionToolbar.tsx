import { type Ref } from "react";

import { Grid } from "../grid";

import styles from "./Picker.module.scss";

type PickerSelectionToolbarProps = {
	onSelectAll: () => void;
	onDeselectAll: () => void;
	selectAllButtonRef?: Ref<HTMLButtonElement>;
};

/**
 * Общая панель массовых действий для picker-компонентов с множественным выбором.
 * Компонент не знает формат значения и делегирует изменение владельцу selection-модели.
 */
export function PickerSelectionToolbar({ onSelectAll, onDeselectAll, selectAllButtonRef }: PickerSelectionToolbarProps) {
	return (
		<Grid.Container gap="xs" templateColumns="1fr 1fr">
			<button
				ref={selectAllButtonRef}
				type="button"
				className={styles.selectionActionButton}
				onClick={onSelectAll}
				data-ui="picker-select-all"
				data-action="select-all">
				Выбрать все
			</button>
			<button
				type="button"
				className={styles.selectionActionButton}
				onClick={onDeselectAll}
				data-ui="picker-deselect-all"
				data-action="deselect-all">
				Снять выбор
			</button>
		</Grid.Container>
	);
}
