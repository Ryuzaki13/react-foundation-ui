import { Grid } from "../../grid";

import styles from "./MultiSelect.module.scss";

/**
 * Панель массовых действий для `MultiSelect`. Позволяет быстро выбрать все доступные элементы или снять выбор.
 */
export function MultiSelectOptionsToolbar({ onSelectAll, onDeselectAll }: { onSelectAll: () => void; onDeselectAll: () => void }) {
	return (
		<Grid.Container gap="xs" templateColumns="1fr 1fr">
			<button
				type="button"
				className={styles.selectAllButton}
				onClick={onSelectAll}
				data-ui="multi-select-select-all"
				data-action="select-all">
				Выбрать все
			</button>
			<button
				type="button"
				className={styles.selectAllButton}
				onClick={onDeselectAll}
				data-ui="multi-select-deselect-all"
				data-action="deselect-all">
				Снять выбор
			</button>
		</Grid.Container>
	);
}
