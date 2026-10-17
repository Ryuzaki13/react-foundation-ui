import { GridContainer } from "../../../grid";

import styles from "./ThemeContrast.module.scss";

/** Статические состояния позволяют сравнивать палитры без одновременного наведения на две колонки. */
export function ThemeContrastSwatches() {
	return (
		<GridContainer gap="sm" templateColumns="repeat(3, minmax(0, 1fr))" className={styles.states}>
			{(["normal", "hover", "pressed"] as const).map((state) => (
				<GridContainer gap="sm" key={state}>
					<p className={styles.stateHeading}>{state === "normal" ? "Обычное" : state === "hover" ? "Наведение" : "Нажатие"}</p>
					<span className={styles.swatch} data-swatch-role="neutral" data-state={state}>
						Граница поля
					</span>
					<span className={styles.swatch} data-swatch-role="accent" data-state={state}>
						Акцент
					</span>
					<span className={styles.swatch} data-swatch-role="selection" data-state={state}>
						Выбор
					</span>
					<span className={styles.swatch} data-swatch-role="selection-fill" data-state={state}>
						Флажок
					</span>
					<span className={styles.swatch} data-swatch-role="success" data-state={state}>
						Успех
					</span>
					<span className={styles.swatch} data-swatch-role="warning" data-state={state}>
						Внимание
					</span>
					<span className={styles.swatch} data-swatch-role="error" data-state={state}>
						Ошибка
					</span>
					<span className={styles.swatch} data-swatch-role="info" data-state={state}>
						Информация
					</span>
				</GridContainer>
			))}
		</GridContainer>
	);
}
