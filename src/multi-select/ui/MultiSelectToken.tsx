import styles from "./MultiSelect.module.scss";

interface MultiSelectTokenProps {
	value: string | undefined;
}

/**
 * Токен выбранного значения в `MultiSelect`. Показывает выбранный элемент и кнопку его удаления из текущего набора.
 */
export function MultiSelectToken({ value }: MultiSelectTokenProps) {
	if (!value) return null;

	return (
		<div className={styles.multiSelectTokens}>
			<div className={styles.multiSelectToken}>{value}</div>
		</div>
	);
}
