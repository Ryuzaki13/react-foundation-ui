import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";

import { MoonStarIcon, SunIcon } from "lucide-react";

type DemoTheme = "light" | "dark";
type StoryLayout = "centered" | "fullscreen" | "padded";
type StoryViewMode = "docs" | "story";

export const THEME_STORAGE_KEY = "storybook-theme";
const DEFAULT_THEME_MODE = "default";

const shellStyle: CSSProperties = {
	width: "100%",
	padding: 16,
	background: "var(--surface-1)",
	color: "var(--content-0)",
	boxSizing: "border-box"
};

const frameStyle: CSSProperties = {
	width: "100%",
	overflow: "hidden",
	border: "var(--border)",
	borderRadius: "var(--radius-lg)",
	background: "var(--surface-0)",
	boxShadow: "var(--shadow-sm)"
};

const toolbarStyle: CSSProperties = {
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	gap: 12,
	padding: "14px 16px",
	borderBottom: "var(--border)",
	background: "var(--surface-2)"
};

const toolbarMetaStyle: CSSProperties = {
	display: "grid",
	gap: 2
};

const toolbarCaptionStyle: CSSProperties = {
	fontSize: "var(--font-size-sm)",
	color: "var(--content-2)"
};

const toolbarTitleStyle: CSSProperties = {
	fontSize: "var(--font-size-md)",
	fontWeight: 600
};

const toolbarActionsStyle: CSSProperties = {
	display: "flex",
	alignItems: "center",
	gap: 8,
	flexWrap: "wrap",
	justifyContent: "flex-end"
};

const themeBadgeStyle: CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	gap: 6,
	padding: "6px 10px",
	borderRadius: 999,
	border: "var(--border)",
	background: "var(--surface-0)",
	fontSize: "var(--font-size-sm)",
	color: "var(--content-1)"
};

const toggleButtonStyle: CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	gap: 8,
	padding: "8px 12px",
	borderRadius: 999,
	border: "var(--border)",
	background: "var(--surface-0)",
	color: "var(--content-0)",
	font: "inherit",
	cursor: "pointer",
	transition: "background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast)"
};

const contentStyle: CSSProperties = {
	width: "100%",
	boxSizing: "border-box"
};

const centeredContentStyle: CSSProperties = {
	display: "grid",
	placeItems: "center"
};

const paddedStorySurfaceStyle: CSSProperties = {
	width: "100%",
	padding: 24,
	boxSizing: "border-box"
};

const centeredStorySurfaceStyle: CSSProperties = {
	display: "inline-flex",
	justifyContent: "center",
	padding: 24,
	boxSizing: "border-box"
};

const fullscreenStorySurfaceStyle: CSSProperties = {
	width: "100%",
	padding: 0,
	boxSizing: "border-box"
};

const docsHeightStyle: CSSProperties = {
	minHeight: 220
};

const storyHeightStyle: CSSProperties = {
	minHeight: "calc(100vh - 32px)"
};

const docsContentHeightStyle: CSSProperties = {
	minHeight: 160
};

const storyContentHeightStyle: CSSProperties = {
	minHeight: "calc(100vh - 132px)"
};

export const resolveStoredTheme = (): DemoTheme => {
	if (typeof window === "undefined") {
		return "light";
	}

	const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

	if (storedTheme === "dark" || storedTheme === "light") {
		return storedTheme;
	}

	return document.documentElement.dataset.theme?.startsWith("dark:") ? "dark" : "light";
};

const normalizeLayout = (layout?: string): StoryLayout => {
	if (layout === "centered" || layout === "fullscreen") {
		return layout;
	}

	return "padded";
};

const resolveDocumentThemeMode = (): string => {
	const [, themeModeFromTheme] = document.documentElement.dataset.theme?.split(":", 2) ?? [];
	return themeModeFromTheme || document.documentElement.dataset.themeMode || DEFAULT_THEME_MODE;
};

/**
 * Синхронизирует полный набор theme-атрибутов, используемый foundation styles.
 * При переключении scheme сохраняет theme, переданную host-проектом, поэтому
 * `light:<theme>` и `dark:<theme>` остаются симметричной парой.
 */
export const applyDocumentTheme = (theme: DemoTheme, themeMode = resolveDocumentThemeMode()): void => {
	const html = document.documentElement;

	html.setAttribute("data-theme", `${theme}:${themeMode}`);
	html.setAttribute("data-scheme", theme);
	html.setAttribute("data-theme-mode", themeMode);
	html.setAttribute("data-contrast", "auto");
	html.setAttribute("data-motion", "auto");
	html.setAttribute("data-line-height", "normal");
	html.setAttribute("data-letter-spacing", "normal");
	html.setAttribute("data-word-spacing", "normal");
	html.setAttribute("data-paragraph-spacing", "normal");
	document.body.style.backgroundColor = "var(--surface-1)";
	document.body.style.color = "var(--content-0)";
	document.body.style.transition = "background-color var(--transition-fast), color var(--transition-fast)";
};

/**
 * Возвращает для атомарной story одинаковую рамку, layout и переключатель темы,
 * которые использовались до выделения компонентов в отдельный пакет.
 */
export function AtomicStoryCanvas({ children, layout, viewMode }: { children: ReactNode; layout?: string; viewMode: StoryViewMode }) {
	const [theme, setTheme] = useState<DemoTheme>(resolveStoredTheme);
	const normalizedLayout = normalizeLayout(layout);
	const isLight = theme === "light";

	useEffect(() => {
		applyDocumentTheme(theme);
		window.localStorage.setItem(THEME_STORAGE_KEY, theme);
	}, [theme]);

	const frameHeightStyle = viewMode === "docs" ? docsHeightStyle : storyHeightStyle;
	const canvasHeightStyle = viewMode === "docs" ? docsContentHeightStyle : storyContentHeightStyle;
	const canvasLayoutStyle = normalizedLayout === "centered" ? centeredContentStyle : undefined;
	const storySurfaceStyle =
		normalizedLayout === "fullscreen"
			? fullscreenStorySurfaceStyle
			: normalizedLayout === "centered"
				? centeredStorySurfaceStyle
				: paddedStorySurfaceStyle;

	return (
		<div style={{ ...shellStyle, ...frameHeightStyle }}>
			<div style={frameStyle}>
				<div style={toolbarStyle}>
					<div style={toolbarMetaStyle}>
						<span style={toolbarCaptionStyle}>СПК - UI Storybook</span>
						<span style={toolbarTitleStyle}>Тема интерфейса</span>
					</div>

					<div style={toolbarActionsStyle}>
						<span style={themeBadgeStyle}>{isLight ? "Light" : "Dark"}</span>

						<button
							type="button"
							style={toggleButtonStyle}
							onClick={() => setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"))}>
							{isLight ? <MoonStarIcon size={16} /> : <SunIcon size={16} />}
							<span>{isLight ? "Тёмная тема" : "Светлая тема"}</span>
						</button>
					</div>
				</div>

				<div style={{ ...contentStyle, ...canvasHeightStyle, ...canvasLayoutStyle }}>
					<div style={storySurfaceStyle}>{children}</div>
				</div>
			</div>
		</div>
	);
}
