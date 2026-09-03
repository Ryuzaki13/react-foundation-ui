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
});
