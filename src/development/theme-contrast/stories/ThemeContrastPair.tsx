import { GridContainer } from "../../../grid";

import styles from "./ThemeContrast.module.scss";
import { ThemeContrastSample } from "./ThemeContrastSample";
import { type ThemeContrastTheme } from "./themeContrastThemes";

type ThemeContrastPairProps = {
	readonly theme: ThemeContrastTheme;
};

/** Пары имеют одинаковое содержимое: различается только атрибут режима контрастности. */
export function ThemeContrastPair({ theme }: ThemeContrastPairProps) {
	return (
		<section className={styles.pair}>
			<h2>{theme.title}</h2>
			<GridContainer gap="md" templateColumns="repeat(auto-fit, minmax(min(100%, 24em), 1fr))" align="start">
				<ThemeContrastSample theme={theme} contrast="normal" />
				<ThemeContrastSample theme={theme} contrast="high" />
			</GridContainer>
		</section>
	);
}
