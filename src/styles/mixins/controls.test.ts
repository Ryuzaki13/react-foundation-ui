import { compileString } from "sass-embedded";
import { describe, expect, it } from "vitest";

import { resolve } from "node:path";

/**
 * Компилирует реальный `ui-control-base`, чтобы тест закреплял CSS-контракт
 * кнопок и других интерактивных контролов, а не внутреннее устройство Sass-файла.
 */
function compileUiControlBase(): string {
	return compileString('@use "controls" as *; .control { @include ui-control-base; }', {
		loadPaths: [resolve("src/styles/mixins")],
		style: "expanded"
	}).css;
}

/**
 * Компилирует четыре appearance вместе с базовым контролом, чтобы проверять итоговый
 * disabled-контракт, который реально получают Button и другие scheme-компоненты.
 */
function compileUiAppearances(): string {
	return compileString(
		`@use "controls" as *;
		.solid { @include ui-tone("brand"); @include ui-appearance-solid; @include ui-control-base; }
		.outline { @include ui-tone("brand"); @include ui-appearance-outline; @include ui-control-base; }
		.ghost { @include ui-tone("brand"); @include ui-appearance-ghost; @include ui-control-base; }
		.transparent { @include ui-tone("brand"); @include ui-appearance-transparent; @include ui-control-base; }`,
		{
			loadPaths: [resolve("src/styles/mixins")],
			style: "expanded"
		}
	).css;
}

/** Компилирует только tone-adapter, чтобы закрепить его связь с токенами темы. */
function compileUiTone(): string {
	return compileString('@use "controls" as *; .tone { @include ui-tone("brand"); }', {
		loadPaths: [resolve("src/styles/mixins")],
		style: "expanded"
	}).css;
}

describe("ui-tone", () => {
	it("использует единые формулы локально для поддержки subtree overrides", () => {
		const css = compileUiTone();

		expect(css).toContain("--ui-tone-text-hover: color-mix(in srgb, var(--brand-text) 88%, var(--content-0))");
		expect(css).toContain("--ui-tone-text-active: color-mix(in srgb, var(--brand-text) 76%, var(--content-0))");
		expect(css).toContain("--ui-tone-fill-hover: color-mix(in srgb, var(--brand-fill) 88%, var(--content-0))");
		expect(css).toContain("--ui-tone-fill-active: color-mix(in srgb, var(--brand-fill) 76%, var(--content-0))");
		expect(css).toContain("--ui-tone-soft: color-mix(in srgb, var(--brand-fill) 12%, var(--surface-0))");
		expect(css).toContain("--ui-tone-border-hover: color-mix(in srgb, var(--brand-border) 88%, var(--content-0))");
		expect(css).toContain("--ui-tone-border-active: color-mix(in srgb, var(--brand-border) 76%, var(--content-0))");
		expect(css).toContain("--ui-tone-border-focus: var(--focus-ring)");
		expect(css).toContain("--ui-tone-ghost-hover: color-mix(in srgb, var(--brand-fill) 10%, var(--surface-0))");
		expect(css).toContain("--ui-tone-ghost-active: color-mix(in srgb, var(--brand-fill) 20%, var(--surface-0))");
	});
});

describe("ui-control-base", () => {
	it("ограничивает hover устройствами с поддержкой наведения", () => {
		const css = compileUiControlBase();

		expect(css).toMatch(
			/@media \(any-hover: hover\) \{\s*\.control:hover \{\s*color: var\(--ui-color-hover\);\s*background-color: var\(--ui-background-hover\);\s*border-color: var\(--ui-border-hover\);\s*\}\s*\}/
		);
	});

	it("сохраняет active-состояние для касания", () => {
		const css = compileUiControlBase();

		expect(css).toMatch(
			/\.control:active \{\s*color: var\(--ui-color-active\);\s*border-color: var\(--ui-border-active\);\s*background-color: var\(--ui-background-active\);\s*\}/
		);
	});

	it("сохраняет структуру appearance в disabled-состоянии без opacity", () => {
		const css = compileUiAppearances();

		expect(css).toMatch(/\.solid \{[^}]*--ui-disabled-background: color-mix\([^;]+\);[^}]*--ui-disabled-border: transparent;/s);
		expect(css).toMatch(
			/\.outline \{[^}]*--ui-disabled-background: var\(--surface-0\);[^}]*--ui-disabled-border: color-mix\([^;]+\);/s
		);
		expect(css).toMatch(/\.ghost \{[^}]*--ui-disabled-background: transparent;[^}]*--ui-disabled-border: transparent;/s);
		expect(css).toMatch(/\.transparent \{[^}]*--ui-disabled-background: transparent;[^}]*--ui-disabled-border: transparent;/s);

		const disabledRules = css.match(/\.(?:solid|outline|ghost|transparent):disabled[^}]*\}/g)?.join("\n") ?? "";
		expect(disabledRules).not.toContain("opacity");
		expect(disabledRules).toContain("cursor: not-allowed");
	});
});
