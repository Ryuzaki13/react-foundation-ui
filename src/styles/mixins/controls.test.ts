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

	it("не подменяет фон элемента при сохранённом focus", () => {
		const css = compileUiControlBase();
		const focusRule = css.match(/\.control:focus,\s*\.control:focus-within \{[^}]*\}/)?.[0];

		expect(focusRule).toContain("border-color: var(--ui-border-focus)");
		expect(focusRule).not.toContain("background-color");
		expect(css).toMatch(
			/\.control:focus-visible \{\s*outline: var\(--focus-width\) solid var\(--focus-ring\);\s*outline-offset: var\(--focus-offset\);\s*\}/
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
