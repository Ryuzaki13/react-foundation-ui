// @vitest-environment jsdom

import { compileAsync } from "sass-embedded";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { resolve } from "node:path";

const stylesheet = document.createElement("style");

/** CSS-контракт проверяется отдельно от геометрии: jsdom не выполняет browser layout. */
function readLayoutStyle(selector: string): CSSStyleDeclaration {
	const rules = stylesheet.sheet?.cssRules;
	if (!rules) throw new Error("Не удалось прочитать скомпилированные стили Tabs.");
	for (const rule of Array.from(rules)) {
		if (rule instanceof CSSStyleRule && rule.selectorText === selector) return rule.style;
	}
	throw new Error(`Не найдено правило геометрии Tabs: ${selector}.`);
}

beforeAll(async () => {
	// Package script задаёт cwd; stylesheet читается независимо от Vitest CSS Modules proxy.
	stylesheet.textContent = (await compileAsync(resolve("src/tabs/ui/Tabs.module.scss"))).css;
	document.head.append(stylesheet);
});

afterAll(() => stylesheet.remove());

describe("минимальная ширина grid-областей Tabs", () => {
	it("горизонтальная колонка не принимает intrinsic minimum длинного scroll-контента", () => {
		expect(readLayoutStyle(".horizontal").getPropertyValue("grid-template-columns")).toBe("minmax(0, 1fr)");
	});

	it("область tablist разрешает сжатие до ширины родителя", () => {
		expect(Number.parseFloat(readLayoutStyle(".tabsWrapper").getPropertyValue("min-width"))).toBe(0);
	});

	it("вертикальная компоновка сохраняет отдельную колонку заголовков", () => {
		expect(readLayoutStyle(".vertical").getPropertyValue("grid-template-columns")).toBe("10em minmax(0, 1fr)");
	});
});
