import { compileString } from "sass-embedded";
import { describe, expect, it } from "vitest";

import { resolve } from "node:path";

/** Компилирует публичный themes entrypoint с точной hex-палитрой host-приложения. */
function compileExactTheme(): string {
	return compileString(
		`@use "themes" as foundationThemes;

.custom-theme {
	@include foundationThemes.theme(light, (
		tokens: (
			"--surface-0": #fefefe,
			"--error-text": #990011
		),
		status: (
			accent: (
				text: #123456,
				border: #345678,
				fill: #ddeeff,
				on-fill: #102030
			),
			error: (
				text: #aa0011,
				border: #bb1122,
				fill: #cc2233,
				on-fill: #ffffff
			)
		)
	));
}`,
		{
			loadPaths: [resolve("src/styles")],
			style: "expanded"
		}
	).css;
}

describe("theme", () => {
	it("наследует baseline и принимает четыре роли каждой hex-схемы", () => {
		const css = compileExactTheme();
		const tones = ["accent", "brand", "neutral", "error", "warning", "success", "info"] as const;
		const roles = ["text", "border", "fill", "on-fill"] as const;

		expect(css).toContain("--surface-1: var(--hc-surface-1, #f8f8f9)");

		for (const tone of tones) {
			for (const role of roles) {
				expect(css).toContain(`--${tone}-${role}: var(--hc-${tone}-${role},`);
			}
		}

		expect(css).toContain("--accent-text: var(--hc-accent-text, #123456)");
		expect(css).toContain("--accent-border: var(--hc-accent-border, #345678)");
		expect(css).toContain("--accent-fill: var(--hc-accent-fill, #ddeeff)");
		expect(css).toContain("--accent-on-fill: var(--hc-accent-on-fill, #102030)");
		expect(css).toContain("--error-text: var(--hc-error-text, #aa0011)");
		expect(css).toContain("--error-border: var(--hc-error-border, #bb1122)");
		expect(css).toContain("--error-fill: var(--hc-error-fill, #cc2233)");
		expect(css).toContain("--error-on-fill: var(--hc-error-on-fill, #ffffff)");
		expect(css).toContain("--overlay-backdrop: var(--hc-overlay-backdrop, #0000001a)");
		expect(css).toContain("--shadow-xs: var(--hc-shadow-xs, 0 0 0.25em #00000026)");
	});

	it("оборачивает первичные root-цвета одноимёнными high-contrast токенами", () => {
		const css = compileString('@use "root-tokens";', {
			loadPaths: [resolve("src/styles")],
			style: "expanded"
		}).css;

		expect(css).toContain("--white: var(--hc-white, #ffffff)");
		expect(css).toContain("--black: var(--hc-black, #000000)");
	});

	it("выводит плоские token overrides после палитры", () => {
		const css = compileExactTheme();
		const paletteTextIndex = css.indexOf("--error-text: var(--hc-error-text, #aa0011)");
		const exactTokenIndex = css.lastIndexOf("--error-text: var(--hc-error-text, #990011)");

		expect(paletteTextIndex).toBeGreaterThanOrEqual(0);
		expect(exactTokenIndex).toBeGreaterThan(paletteTextIndex);
		expect(css).toContain("--surface-0: var(--hc-surface-0, #fefefe)");
	});

	it("наследует неуказанные роли схемы и не выводит прежние color contracts", () => {
		const css = compileString(
			`@use "themes" as foundationThemes;

.custom-theme {
	@include foundationThemes.theme(dark, (
		status: (
			error: (
				text: #ff6677
			)
		)
	));
}`,
			{
				loadPaths: [resolve("src/styles")],
				style: "expanded"
			}
		).css;

		expect(css).toContain("--error-text: var(--hc-error-text, #ff6677)");
		expect(css).toContain("--error-border: var(--hc-error-border, #ff7879)");
		expect(css).toContain("--brand-fill: var(--hc-brand-fill, #97b5ff)");
		expect(css).toContain("--neutral-border: var(--hc-neutral-border, #4e5661)");
		expect(css).not.toContain("oklch(");
		expect(css).not.toContain("--interactive-");
		expect(css).not.toContain("--status-");
	});
});

describe("interactive surface", () => {
	it("использует accent-схему для hover, active и selected", () => {
		const css = compileString('@use "interactive-surface";', {
			loadPaths: [resolve("src/styles/themes")],
			style: "expanded"
		}).css;

		expect(css).toContain("--ch: var(--accent-on-fill)");
		expect(css).toContain("--sh: var(--accent-fill)");
		expect(css).toContain("--bh: var(--accent-border)");
		expect(css).toMatch(/\.interactiveSurface\[data-selected=true\]\.interactiveSurfaceFrame\s*\{\s*border-color: var\(--bs\);\s*\}/);
		expect(css).not.toContain("--interactive-");
	});
});
