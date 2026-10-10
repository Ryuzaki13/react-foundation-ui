// @vitest-environment node

import { compileString } from "sass-embedded";
import { describe, expect, it } from "vitest";

import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("../../", import.meta.url));

const backgroundRoles = ["canvas", "surface", "elevated", "secondary", "sunken", "hover", "pressed", "accent", "disabled", "overlay"].map(
	(part) => `--bg-${part}`
);

// Проверяем публичный Sass-контракт: обе схемы должны предоставлять каждую
// независимую роль, даже когда текущий компонент использует не все состояния.
const semanticRoles = [
	...["text", "border", "fill"].flatMap((part) => ["", "-hover", "-pressed"].map((state) => `--accent-${part}${state}`)),
	"--accent-on-fill",
	...["subtle", "default", "strong", "interactive", "interactive-hover", "interactive-pressed", "interactive-disabled", "decorative"].map(
		(part) => `--border-${part}`
	),
	"--focus-ring",
	...["bg", "text", "border", "fill"].flatMap((part) =>
		["", "-hover", "-pressed", "-disabled"].map((state) => `--selection-${part}${state}`)
	),
	"--selection-on-fill",
	"--selection-on-fill-disabled",
	"--text-selection-bg",
	"--text-selection-text",
	...["bg", "text", "border"].flatMap((part) => ["", "-current"].map((state) => `--highlight-${part}${state}`))
];

const statuses = ["success", "warning", "error", "info"];
const statusRoles = statuses.flatMap((status) =>
	["text", "bg", "bg-hover", "bg-pressed", "fill", "fill-hover", "fill-pressed", "on-fill"].map((part) => `--${status}-${part}`)
);

function compileTheme(source: string) {
	const css = compileString(source, { loadPaths: [packageRoot] }).css;
	return new Map(Array.from(css.matchAll(/(--[\w-]+):\s*([^;]+);/g), (match) => [match[1], match[2]]));
}

describe("Семантические цветовые роли темы", () => {
	it.each(["light", "dark"])("предоставляет все фоновые роли с поддержкой high contrast в схеме %s", (mode) => {
		const tokens = compileTheme(`@use "styles/themes" as themes; .theme { @include themes.theme(${mode}); }`);

		for (const role of backgroundRoles) {
			expect(tokens.get(role), role).toMatch(new RegExp(`^var\\(--hc-${role.slice(2)}, .+\\)$`));
		}
	});

	it.each(["light", "dark"])("настраивает вспомогательный фон независимо от содержимого и состояний в схеме %s", (mode) => {
		const defaults = compileTheme(`@use "styles/themes" as themes; .theme { @include themes.theme(${mode}); }`);
		const config = `@use "styles/config" with ($${mode}-theme-overrides: (tokens: ("--bg-secondary": #123456)));`;
		const configured = compileTheme(`${config} @use "styles/themes" as themes; .theme { @include themes.theme(${mode}); }`);
		const overridden = compileTheme(`
			${config}
			@use "styles/themes" as themes;
			.theme { @include themes.theme(${mode}, (tokens: ("--bg-secondary": #abcdef))); }
		`);

		expect(configured.get("--bg-secondary")).toBe("var(--hc-bg-secondary, #123456)");
		expect(overridden.get("--bg-secondary")).toBe("var(--hc-bg-secondary, #abcdef)");
		for (const role of [...backgroundRoles.filter((role) => role !== "--bg-secondary"), "--text-primary", "--text-secondary"]) {
			expect(configured.get(role), role).toBe(defaults.get(role));
			expect(overridden.get(role), role).toBe(defaults.get(role));
		}
	});

	it.each(["light", "dark"])("предоставляет все 45 ролей в схеме %s", (mode) => {
		const tokens = compileTheme(`@use "styles/themes" as themes; .theme { @include themes.theme(${mode}); }`);

		expect(new Set(semanticRoles).size).toBe(45);
		for (const role of semanticRoles) {
			expect(tokens.get(role), role).toMatch(new RegExp(`^var\\(--hc-${role.slice(2)}, .+\\)$`));
		}

		for (const retiredRole of [
			"accent-brand",
			"accent-selection",
			"accent-focus",
			"accent-highlight",
			"border-thin",
			"border-hover",
			"border-accent"
		]) {
			expect(tokens.has(`--${retiredRole}`), retiredRole).toBe(false);
		}
	});

	it("сохраняет одинаковый набор ролей в обеих схемах", () => {
		const light = compileTheme('@use "styles/themes" as themes; .theme { @include themes.theme(light); }');
		const dark = compileTheme('@use "styles/themes" as themes; .theme { @include themes.theme(dark); }');

		expect([...light.keys()].sort()).toEqual([...dark.keys()].sort());
	});

	it.each(["light", "dark"])("предоставляет независимые мягкие и насыщенные роли статусов в схеме %s", (mode) => {
		const tokens = compileTheme(`@use "styles/themes" as themes; .theme { @include themes.theme(${mode}); }`);

		for (const role of statusRoles) {
			expect(tokens.get(role), role).toMatch(new RegExp(`^var\\(--hc-${role.slice(2)}, .+\\)$`));
		}
		for (const status of statuses) {
			expect(tokens.has(`--${status}-hover`)).toBe(false);
			expect(tokens.has(`--${status}-pressed`)).toBe(false);
		}
	});

	it("не связывает фон, заливку и содержимое статуса при переопределении темы", () => {
		const defaults = compileTheme('@use "styles/themes" as themes; .theme { @include themes.theme(light); }');
		const tokens = compileTheme(`
			@use "styles/themes" as themes;
			.theme { @include themes.theme(light, (tokens: (
				"--error-bg-hover": #123456, "--error-fill": #654321,
				"--error-fill-pressed": #abcdef, "--error-on-fill": #fedcba
			))); }
		`);

		for (const [role, value] of Object.entries({
			"--error-bg-hover": "#123456",
			"--error-fill": "#654321",
			"--error-fill-pressed": "#abcdef",
			"--error-on-fill": "#fedcba"
		})) {
			expect(tokens.get(role)).toBe(`var(--hc-${role.slice(2)}, ${value})`);
		}
		for (const role of ["--error-text", "--error-bg", "--error-bg-pressed", "--error-fill-hover"]) {
			expect(tokens.get(role)).toBe(defaults.get(role));
		}
	});

	it("позволяет независимо переопределять части и состояния через публичный mixin", () => {
		const defaults = compileTheme('@use "styles/themes" as themes; .theme { @include themes.theme(light); }');
		const tokens = compileTheme(`
			@use "styles/config" with ($light-theme-overrides: (tokens: (
				"--accent-text": #123456, "--accent-fill": #654321,
				"--focus-ring": #123123, "--border-decorative": #321321
			)));
			@use "styles/themes" as themes;
			.theme { @include themes.theme(light, (tokens: (
				"--accent-text": #abcdef, "--selection-bg-pressed": #fedcba,
				"--selection-text-pressed": #012345, "--selection-fill-disabled": #456789,
				"--selection-on-fill-disabled": #987654, "--highlight-bg-current": #112233
			))); }
		`);

		for (const [role, value] of Object.entries({
			"--accent-text": "#abcdef",
			"--accent-fill": "#654321",
			"--focus-ring": "#123123",
			"--border-decorative": "#321321",
			"--selection-bg-pressed": "#fedcba",
			"--selection-text-pressed": "#012345",
			"--selection-fill-disabled": "#456789",
			"--selection-on-fill-disabled": "#987654",
			"--highlight-bg-current": "#112233"
		})) {
			expect(tokens.get(role)).toBe(`var(--hc-${role.slice(2)}, ${value})`);
		}

		// Настройка fill не должна менять on-fill, выбранность или ::selection.
		for (const role of ["--accent-on-fill", "--text-selection-bg", "--selection-border"]) {
			expect(tokens.get(role)).toBe(defaults.get(role));
		}
	});
});
