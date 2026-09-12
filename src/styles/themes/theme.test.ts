import { compile, compileString } from "sass-embedded";
import { describe, expect, it } from "vitest";

import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

/** Компилирует публичный themes entrypoint с точной hex-палитрой host-приложения. */
function compileExactTheme(): string {
	return compileString(
		`@use "themes" as foundationThemes;

.custom-theme {
	@include foundationThemes.theme(light, (
		tokens: (
			"--surface-0": #fefefe,
			"--error-text": #990011,
			"--border-0": #abcdef,
			"--error-soft": var(--surface-2)
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

/** Компилирует общий CSS Module с тем же `@/` alias, который использует Vite-сборка пакета. */
function compileUiModule(): string {
	return compile(resolve("src/ui.module.scss"), {
		importers: [
			{
				findFileUrl(url) {
					return url.startsWith("@/") ? pathToFileURL(resolve("src", url.slice(2))) : null;
				}
			}
		],
		style: "expanded"
	}).css;
}

describe("theme", () => {
	it("наследует baseline и принимает четыре настраиваемые роли каждой hex-схемы", () => {
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
		expect(css).toContain("--error-text: var(--hc-error-text, #990011)");
		expect(css).toContain("--error-border: var(--hc-error-border, #bb1122)");
		expect(css).toContain("--error-fill: var(--hc-error-fill, #cc2233)");
		expect(css).toContain("--error-on-fill: var(--hc-error-on-fill, #ffffff)");
		expect(css).toContain("--overlay-backdrop: var(--hc-overlay-backdrop, #0000001a)");
		expect(css).toContain("--shadow-xs: var(--hc-shadow-xs, 0 0 0.25em #00000026)");
	});

	it("выводит переиспользуемые производные состояния для каждой схемы", () => {
		const css = compileExactTheme();
		const tones = ["accent", "brand", "neutral", "error", "warning", "success", "info"] as const;
		const derivedRoles = ["text-hover", "text-active", "border-hover", "border-active", "fill-hover", "fill-active", "soft"] as const;

		for (const tone of tones) {
			for (const role of derivedRoles) {
				expect(css).toContain(`--${tone}-${role}:`);
			}

			expect(css).toContain(`--${tone}-text-hover: color-mix(in srgb, var(--${tone}-text) 88%, var(--content-0))`);
			expect(css).toContain(`--${tone}-text-active: color-mix(in srgb, var(--${tone}-text) 76%, var(--content-0))`);
			expect(css).toContain(`--${tone}-border-hover: color-mix(in srgb, var(--${tone}-border) 88%, var(--content-0))`);
			expect(css).toContain(`--${tone}-border-active: color-mix(in srgb, var(--${tone}-border) 76%, var(--content-0))`);
			expect(css).toContain(`--${tone}-fill-hover: color-mix(in srgb, var(--${tone}-fill) 88%, var(--content-0))`);
			expect(css).toContain(`--${tone}-fill-active: color-mix(in srgb, var(--${tone}-fill) 76%, var(--content-0))`);

			if (tone === "error") {
				expect(css).toContain("--error-soft: var(--surface-2)");
			} else {
				expect(css).toContain(`--${tone}-soft: color-mix(in srgb, var(--${tone}-fill) 12%, var(--surface-0))`);
			}
		}
	});

	it("оборачивает первичные root-цвета одноимёнными high-contrast токенами", () => {
		const css = compileString('@use "root-tokens";', {
			loadPaths: [resolve("src/styles")],
			style: "expanded"
		}).css;

		expect(css).toContain("--white: var(--hc-white, #ffffff)");
		expect(css).toContain("--black: var(--hc-black, #000000)");
	});

	it("разрешает token overrides на этапе сборки и выводит каждое свойство один раз", () => {
		const css = compileExactTheme();
		const declarationNames = Array.from(css.matchAll(/^\s*(--[\w-]+):/gm), ([, name]) => name);
		const duplicateNames = declarationNames.filter((name, index) => declarationNames.indexOf(name) !== index);

		expect(declarationNames).toHaveLength(94);
		expect(duplicateNames).toEqual([]);
		expect(css).toContain("--error-text: var(--hc-error-text, #990011)");
		expect(css).not.toContain("--error-text: var(--hc-error-text, #aa0011)");
		expect(css).toContain("--border-0: var(--hc-border-0, #abcdef)");
		expect(css).not.toContain("--border-0: var(--hc-border-0, var(--neutral-border))");
		expect(css).toContain("--error-soft: var(--surface-2)");
		expect(css).not.toContain("--error-soft: color-mix(in srgb, var(--error-fill) 12%, var(--surface-0))");
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
	it("использует соответствующие состояния accent-схемы для hover, active и selected", () => {
		const css = compileString('@use "interactive-surface";', {
			loadPaths: [resolve("src/styles/themes")],
			style: "expanded"
		}).css;

		expect(css).toContain("--ch: var(--accent-text-hover)");
		expect(css).toContain("--sh: var(--accent-fill-hover)");
		expect(css).toContain("--bh: var(--accent-border-hover)");
		expect(css).toContain("--ca: var(--accent-text-active)");
		expect(css).toContain("--sa: var(--accent-fill-active)");
		expect(css).toContain("--ba: var(--accent-border-active)");
		expect(css).toContain("--cs: var(--accent-on-fill)");
		expect(css).toContain("--ss: var(--accent-fill)");
		expect(css).toContain("--bs: var(--accent-border)");
		expect(css).toMatch(/\.interactiveSurface\[data-selected=true\]\.interactiveSurfaceFrame\s*\{\s*border-color: var\(--bs\);\s*\}/);
		expect(css).not.toContain("--interactive-");
	});

	it("сохраняет ту же карту состояний в используемом popup option", () => {
		const css = compileUiModule();

		expect(css).toMatch(/\.uiPopupOption\.selected\s*\{\s*color: var\(--accent-on-fill\);\s*background-color: var\(--accent-fill\);/);
		expect(css).toMatch(
			/\.uiPopupOption\.uiPopupOptionActive,\s*\.uiPopupOption:active\s*\{\s*color: var\(--accent-text-active\);\s*background-color: var\(--accent-fill-active\);/
		);
		expect(css).toMatch(
			/@media \(any-hover: hover\)\s*\{\s*\.uiPopupOption:hover\s*\{\s*color: var\(--accent-text-hover\);\s*background-color: var\(--accent-fill-hover\);/
		);
		expect(css).not.toMatch(/@media \(any-hover: none\)\s*\{\s*\.uiPopupOption:active/);
	});
});
