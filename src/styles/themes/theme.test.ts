import { compileString } from "sass-embedded";
import { describe, expect, it } from "vitest";

import { resolve } from "node:path";

/**
 * Компилирует публичный themes entrypoint с точной палитрой host-приложения.
 * Тест защищает порядок слоёв: baseline обязан заполнить контракт, а exact values — победить генератор.
 */
function compileExactTheme(): string {
	return compileString(
		`@use "themes" as foundationThemes;

.custom-theme {
	@include foundationThemes.theme(light, (
		tokens: (
			"--surface-0": #fefefe,
			"--status-error-text": #990011
		),
		accent: (
			content: #123456,
			surface: #ddeeff,
			border: #345678
		),
		status: (
			error: (
				text: (
					base: #aa0011,
					hover: #bb1122,
					active: #880000
				),
				fill: (
					base: #cc2233,
					hover: #dd3344,
					active: #aa1122,
					on-fill: #ffffff
				)
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
	it("наследует полный baseline и принимает точные accent/status scales", () => {
		const css = compileExactTheme();

		expect(css).toContain("--surface-1: var(--hc-surface, #f8f8f9)");
		expect(css).toContain("--content-accent: var(--hc-content-accent, #123456)");
		expect(css).toContain("--status-error-text-hover: var(--hc-status-error-text, #bb1122)");
		expect(css).toContain("--status-error-border-hover: var(--hc-status-error-border, #bb1122)");
		expect(css).toMatch(
			/--status-error-soft:\s*var\(\s*--hc-status-error-soft,\s*color-mix\(in srgb, var\(--status-error-fill\) 12%, var\(--surface-0\)\)\s*\)/
		);
	});

	it("выводит плоские token overrides после сгенерированной палитры", () => {
		const css = compileExactTheme();
		const generatedTextIndex = css.indexOf("--status-error-text: var(--hc-status-error-text, #aa0011)");
		const exactTokenIndex = css.lastIndexOf("--status-error-text: #990011");

		expect(generatedTextIndex).toBeGreaterThanOrEqual(0);
		expect(exactTokenIndex).toBeGreaterThan(generatedTextIndex);
		expect(css).toContain("--surface-0: #fefefe");
	});

	it("связывает brand, neutral и недостающие status tokens с точной палитрой", () => {
		const css = compileString(
			`@use "themes" as foundationThemes;

.custom-theme {
	@include foundationThemes.theme(dark, (
		tokens: (
			"--content-accent": #00ffaa,
			"--surface-accent": #003322,
			"--border-accent": #00cc88,
			"--status-error-text": #ff6677,
			"--status-error-text-hover": #ff8899,
			"--status-error-text-active": #dd4455,
			"--status-error-fill": #991122
		)
	));
}`,
			{
				loadPaths: [resolve("src/styles")],
				style: "expanded"
			}
		).css;

		expect(css).toContain("--status-brand-fill: var(--hc-status-brand-fill, var(--content-accent))");
		expect(css).toContain("--status-neutral-border-focus: var(--hc-status-neutral-border, var(--focus-ring))");
		expect(css).toContain("--status-error-border-hover: var(--hc-status-error-border, var(--status-error-text-hover))");
	});
});

describe("interactive surface", () => {
	it("применяет отдельный border token выбранного состояния", () => {
		const css = compileString('@use "interactive-surface";', {
			loadPaths: [resolve("src/styles/themes")],
			style: "expanded"
		}).css;

		expect(css).toMatch(/\.interactiveSurface\[data-selected=true\]\.interactiveSurfaceFrame\s*\{\s*border-color: var\(--bs\);\s*\}/);
	});
});
