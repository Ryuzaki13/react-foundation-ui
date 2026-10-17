import { FlexContainer } from "../../../flex";
import { GridContainer } from "../../../grid";

import styles from "./ThemeContrast.module.scss";
import { ThemeContrastControls } from "./ThemeContrastControls";
import { ThemeContrastSwatches } from "./ThemeContrastSwatches";
import { type ThemeContrastTheme } from "./themeContrastThemes";

type ThemeContrastSampleProps = {
	readonly theme: ThemeContrastTheme;
	readonly contrast: "normal" | "high";
};

/** Все образцы читают стандартные роли; отдельной контрастной палитры у стенда нет. */
export function ThemeContrastSample({ theme, contrast }: ThemeContrastSampleProps) {
	return (
		<GridContainer
			as="section"
			gap="md"
			className={styles.sample}
			data-contrast-theme={theme.id}
			data-contrast={contrast}
			aria-label={`${theme.title}: ${contrast === "high" ? "повышенная контрастность" : "исходная палитра"}`}>
			<h3>{contrast === "high" ? "Повышенная контрастность" : "Исходная палитра"}</h3>
			<GridContainer gap="sm" className={styles.surface}>
				<p className={styles.primary} data-text-role="primary">
					Основной текст на поверхности
				</p>
				<p className={styles.secondary} data-text-role="secondary">
					Вторичная подпись с дополнительной информацией
				</p>
				<p className={styles.muted} data-text-role="muted">
					Приглушённая подпись тоже остаётся читаемой
				</p>
				<p>
					<a href="#theme-contrast-help" className={styles.link}>
						Ссылка в тексте
					</a>
				</p>
				<p className={styles.accentText}>Акцентный текст</p>
				<FlexContainer wrap gap="sm">
					<mark className={styles.highlight}>Совпадение поиска</mark>
					<mark className={styles.currentHighlight}>Текущее совпадение</mark>
					<span className={styles.textSelection}>Выделенный текст</span>
				</FlexContainer>
				<p className={styles.focusPreview}>Образец цвета контура фокуса</p>
			</GridContainer>
			<ThemeContrastControls />
			<ThemeContrastSwatches />
			<p className={styles.secondary} id={contrast === "normal" && theme.id === "light" ? "theme-contrast-help" : undefined}>
				Состояния ниже показаны постоянно для сравнения; живые элементы выше поддерживают наведение, нажатие и клавиатурный фокус.
			</p>
		</GridContainer>
	);
}
