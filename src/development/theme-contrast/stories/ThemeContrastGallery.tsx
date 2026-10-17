import { GridContainer } from "../../../grid";

import styles from "./ThemeContrast.module.scss";
import { ThemeContrastPair } from "./ThemeContrastPair";
import { themeContrastThemes } from "./themeContrastThemes";

/** Одновременное сравнение исключает влияние глобального переключателя темы Storybook. */
export function ThemeContrastGallery() {
	return (
		<GridContainer gap="lg" className={styles.gallery}>
			<header>
				<h1>Автоматическая контрастность темы</h1>
				<p>
					У каждой темы одна исходная RGB-палитра. Справа те же токены после общей коррекции контраста: текст — 7:1,
					функциональные границы — 3:1. Наведите указатель на кнопки, нажмите их, пройдите по элементам клавишей Tab и выделите
					текст.
				</p>
			</header>
			{themeContrastThemes.map((theme) => (
				<ThemeContrastPair key={theme.id} theme={theme} />
			))}
		</GridContainer>
	);
}
