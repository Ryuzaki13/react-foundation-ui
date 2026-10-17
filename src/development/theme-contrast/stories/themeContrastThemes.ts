/** Исходные палитры задаются в SCSS один раз; обе колонки используют один theme mixin. */
export const themeContrastThemes = [
	{ id: "light", title: "Светлая" },
	{ id: "dark", title: "Тёмная" },
	{ id: "lilac", title: "Светлая сиреневая" },
	{ id: "forest", title: "Тёмная зелёная" }
] as const;

export type ThemeContrastTheme = (typeof themeContrastThemes)[number];
