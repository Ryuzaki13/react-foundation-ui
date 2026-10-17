// @vitest-environment node

import { compileString } from "sass-embedded";
import { describe, expect, it } from "vitest";

import { fileURLToPath } from "node:url";

type ThemeMode = "light" | "dark";
type ContrastMode = "normal" | "high" | "auto";
type Tokens = ReadonlyMap<string, string>;
type Rgba = readonly [number, number, number, number];

const packageRoot = fileURLToPath(new URL("../../", import.meta.url));
const surfaces = ["canvas", "surface", "elevated", "secondary", "sunken", "hover", "pressed", "accent", "disabled"].map(
	(role) => `--bg-${role}`
);
const states = ["", "-hover", "-pressed"];
const statuses = ["success", "warning", "error", "info"];
const softSurfaces = [
	...[...states, "-disabled"].map((state) => `--selection-bg${state}`),
	...statuses.flatMap((status) => states.map((state) => `--${status}-bg${state}`))
];

function compile(source: string) {
	return compileString(`@use "styles/themes" as themes; ${source}`, { loadPaths: [packageRoot] }).css;
}

function declarations(css: string): Map<string, string> {
	return new Map(Array.from(css.matchAll(/(--[\w-]+):\s*([^;]+);/g), (match) => [match[1], match[2].trim()]));
}

function rule(css: string, selector: string) {
	const normalizedSelector = selector.replace(/(["'])high\1/g, "high");
	const declarationBlock = Array.from(css.matchAll(/([^{}]+)\{([^{}]*)\}/g)).find(
		(match) => match[1].trim().replace(/(["'])high\1/g, "high") === normalizedSelector
	)?.[2];
	expect(declarationBlock, `Ожидалось правило ${selector}`).toBeDefined();
	return declarations(declarationBlock ?? "");
}

function theme(mode: ThemeMode, contrast: ContrastMode, overrides = ""): Tokens {
	return declarations(compile(`.theme { @include themes.theme(${mode}, (tokens: (${overrides})), $contrast: ${contrast}); }`));
}

// Проверка считает WCAG по скомпилированному CSS независимо от Sass solver:
// так неверная формула или потерянное при выводе значение не подтвердят сами себя.
function rgba(value: string): Rgba {
	const hex = /^#([a-f\d]{3,8})$/i.exec(value)?.[1];
	if (hex) {
		const expanded = hex.length <= 4 ? Array.from(hex, (channel) => channel.repeat(2)).join("") : hex;
		return [
			parseInt(expanded.slice(0, 2), 16),
			parseInt(expanded.slice(2, 4), 16),
			parseInt(expanded.slice(4, 6), 16),
			expanded.length === 8 ? parseInt(expanded.slice(6, 8), 16) / 255 : 1
		];
	}

	const rgb = /^rgba?\((.+)\)$/.exec(value)?.[1];
	if (rgb) {
		const channels = rgb.split(/[\s,/]+/).filter(Boolean);
		const rgbChannel = (index: number) => parseFloat(channels[index]) * (channels[index].endsWith("%") ? 2.55 : 1);
		return [
			rgbChannel(0),
			rgbChannel(1),
			rgbChannel(2),
			channels[3] === undefined ? 1 : parseFloat(channels[3]) / (channels[3].endsWith("%") ? 100 : 1)
		];
	}

	if (value === "white") return [255, 255, 255, 1];
	if (value === "black") return [0, 0, 0, 1];
	throw new Error(`Проверка контраста не распознала RGB-цвет: ${value}`);
}

function comparableValue(value: string | undefined) {
	return value && /^(#|rgba?\(|white$|black$)/.test(value) ? rgba(value) : value;
}

function comparableTokens(tokens: Tokens) {
	return new Map([...tokens].map(([name, value]) => [name, comparableValue(value)] as const));
}

function tokenColor(tokens: Tokens, role: string, resolving: readonly string[] = []): Rgba {
	const value = tokens.get(role);
	if (!value) throw new Error(`В CSS отсутствует ${role}`);
	const reference = /^var\((--[\w-]+)\)$/.exec(value)?.[1];
	if (reference) {
		if (resolving.includes(role)) throw new Error(`Циклическая ссылка ${role}`);
		return tokenColor(tokens, reference, [...resolving, role]);
	}
	return rgba(value);
}

function composite(front: Rgba, back: Rgba): Rgba {
	return [
		front[0] * front[3] + back[0] * (1 - front[3]),
		front[1] * front[3] + back[1] * (1 - front[3]),
		front[2] * front[3] + back[2] * (1 - front[3]),
		1
	];
}

function luminance(color: Rgba) {
	const linear = color.slice(0, 3).map((channel) => {
		const srgb = channel / 255;
		return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
	});
	return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrast(front: Rgba, back: Rgba) {
	const foreground = luminance(composite(front, back));
	const background = luminance(back);
	return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
}

function expectPair(tokens: Tokens, foreground: string, background: string, minimum = 7) {
	const canvas = tokenColor(tokens, "--bg-canvas");
	const surface = composite(tokenColor(tokens, "--bg-surface"), canvas);
	const opaqueBackground =
		background === "--bg-canvas"
			? canvas
			: background === "--bg-surface"
				? surface
				: composite(tokenColor(tokens, background), surface);
	const actual = contrast(tokenColor(tokens, foreground), opaqueBackground);
	expect(actual, `${foreground} / ${background}: ${actual.toFixed(5)}:1`).toBeGreaterThanOrEqual(minimum - 0.0001);
}

function expectSemanticContrast(tokens: Tokens) {
	for (const background of [...surfaces, ...softSurfaces]) {
		for (const foreground of [
			"--text-primary",
			"--text-secondary",
			"--text-muted",
			"--text-link",
			"--text-link-hover",
			...states.map((state) => `--accent-text${state}`)
		]) {
			expectPair(tokens, foreground, background);
		}
		expectPair(tokens, "--focus-ring", background, 3);
	}
	for (const background of [...surfaces, ...softSurfaces]) {
		for (const foreground of [
			"--border-subtle",
			"--border-default",
			"--border-strong",
			"--border-interactive",
			"--border-interactive-hover",
			"--border-interactive-pressed",
			"--focus-ring",
			...states.map((state) => `--accent-border${state}`)
		]) {
			expectPair(tokens, foreground, background, 3);
		}
	}

	for (const state of states) {
		expectPair(tokens, "--accent-on-fill", `--accent-fill${state}`);
		expectPair(tokens, `--selection-text${state}`, `--selection-bg${state}`);
		expectPair(tokens, `--selection-border${state}`, `--selection-bg${state}`, 3);
		for (const background of surfaces) expectPair(tokens, `--selection-border${state}`, background, 3);
		expectPair(tokens, "--selection-on-fill", `--selection-fill${state}`);
		for (const status of statuses) {
			expectPair(tokens, `--${status}-text`, `--${status}-bg${state}`);
			expectPair(tokens, `--${status}-on-fill`, `--${status}-fill${state}`);
		}
	}
	for (const state of ["", "-current"]) {
		expectPair(tokens, `--highlight-text${state}`, `--highlight-bg${state}`);
		expectPair(tokens, `--highlight-border${state}`, `--highlight-bg${state}`, 3);
	}
	expectPair(tokens, "--text-selection-text", "--text-selection-bg");
	expectPair(tokens, "--text-inverse", "--text-primary");
	expectPair(tokens, "--text-disabled", "--bg-disabled");
	expectPair(tokens, "--border-interactive-disabled", "--bg-disabled", 3);
	expectPair(tokens, "--selection-text-disabled", "--selection-bg-disabled");
	expectPair(tokens, "--selection-border-disabled", "--selection-bg-disabled", 3);
	expectPair(tokens, "--selection-on-fill-disabled", "--selection-fill-disabled");
}

describe("Расчёт повышенной контрастности Sass-темы", () => {
	it.each(["light", "dark"] as const)("обеспечивает текст 7:1 и функциональные границы 3:1 в схеме %s", (mode) => {
		expectSemanticContrast(theme(mode, "high"));
	});

	it.each([
		["light", "#edf7ee", "#e4f1e5", "#98ad9c"],
		["dark", "#101b28", "#18283b", "#6f8297"]
	] as const)("применяет общую политику к авторской цветной %s теме", (mode, surface, pressed, text) => {
		const overrides = [
			...surfaces.map((role) => `"${role}": ${role === "--bg-pressed" ? pressed : surface}`),
			`"--text-primary": ${text}`,
			`"--text-secondary": ${text}`,
			`"--text-muted": ${text}`,
			'"--accent-text": #80789b',
			'"--focus-ring": #719282'
		].join(",");
		const tokens = theme(mode, "high", overrides);
		expectSemanticContrast(tokens);
		expect(tokens.get("--bg-canvas")).toBe(surface);
		expect(tokens.get("--bg-surface")).toBe(surface);
	});

	it.each([
		["light", "#111111", "#ffffff"],
		["dark", "#fdfdfd", "#010203"]
	] as const)("сохраняет уже контрастную авторскую палитру с противоположной исходной схеме %s светлотой", (mode, background, text) => {
		const foregrounds = [
			"--text-primary",
			"--text-secondary",
			"--text-muted",
			"--text-disabled",
			"--text-link",
			"--text-link-hover",
			...states.map((state) => `--accent-text${state}`)
		];
		const backgrounds = [...surfaces, ...softSurfaces];
		const overrides = [
			...backgrounds.map((role) => `"${role}": ${background}`),
			...foregrounds.map((role) => `"${role}": ${text}`)
		].join(",");
		const normal = theme(mode, "normal", overrides);
		const high = theme(mode, "high", overrides);

		expectSemanticContrast(high);
		for (const role of [...backgrounds, ...foregrounds]) {
			expect(comparableValue(high.get(role)), role).toEqual(comparableValue(normal.get(role)));
		}
	});

	it.each(["light", "dark"] as const)("выводит в auto только изменившиеся токены в том же selector схемы %s", (mode) => {
		const css = compile(`.theme { @include themes.theme(${mode}); }`);
		const normal = theme(mode, "normal");
		const high = theme(mode, "high");
		const base = rule(css, ".theme");
		const overrides = rule(css, '.theme[data-contrast="high"]');

		expect(base).toEqual(normal);
		expect(comparableTokens(new Map([...normal, ...overrides]))).toEqual(comparableTokens(high));
		expect(overrides.size).toBeGreaterThan(0);
		for (const [name, value] of overrides) {
			expect(comparableValue(value), name).not.toEqual(comparableValue(normal.get(name)));
			expect(normal.has(name), name).toBe(true);
		}
		expect(css).not.toContain("--hc-");
		expect(css).not.toMatch(/oklch|oklab|color-mix/i);
	});

	it("сохраняет исходную палитру normal, декоративные значения и подходящий цвет текста", () => {
		const overrides =
			'"--text-primary": #010203, "--border-decorative": #abcdef, "--gradient-accent": linear-gradient(90deg, red, blue)';
		const normal = theme("light", "normal", overrides);
		const high = theme("light", "high", overrides);

		expect(normal.get("--text-primary")).toBe("#010203");
		expect(high.get("--text-primary")).toBe(normal.get("--text-primary"));
		for (const role of ["--bg-canvas", "--bg-surface", "--border-decorative", "--gradient-accent", "--bg-overlay", "--shadow-card"]) {
			expect(comparableValue(high.get(role)), role).toEqual(comparableValue(normal.get(role)));
		}
	});

	it("останавливает RGB-коррекцию при достижении порога, сохраняя цветной оттенок", () => {
		const overrides = [...surfaces, ...softSurfaces]
			.map((role) => `"${role}": #ffffff`)
			.concat('"--text-primary": #7999bb')
			.join(",");
		const tokens = theme("light", "high", overrides);
		const corrected = tokenColor(tokens, "--text-primary");
		const background = tokenColor(tokens, "--bg-surface");
		const original = [121, 153, 187];
		// Округлённые каналы задают интервал коэффициентов одного RGB-смешивания.
		// Шаг 1/255 ближе к исходному цвету должен снова нарушать порог.
		const minimumAmount = Math.max(...original.map((channel, index) => 1 - (corrected[index] + 0.5) / channel));
		const maximumAmount = Math.min(...original.map((channel, index) => 1 - (corrected[index] - 0.5) / channel));
		const closerAmount = Math.max(0, minimumAmount - 1 / 255);
		const channel = (index: number) => Math.round(original[index] * (1 - closerAmount));
		const slightlyCloserToOriginal: Rgba = [channel(0), channel(1), channel(2), 1];

		expectPair(tokens, "--text-primary", "--bg-surface");
		expect(contrast(slightlyCloserToOriginal, background)).toBeLessThan(7);
		expect(minimumAmount).toBeLessThanOrEqual(maximumAmount);
		expect(corrected[0]).toBeLessThan(corrected[1]);
		expect(corrected[1]).toBeLessThan(corrected[2]);
	});

	it("исправляет всю группу заливок, когда единый on-fill не подходит светлому и тёмному состояниям", () => {
		const tokens = theme(
			"light",
			"high",
			'"--accent-fill": #ffffff, "--accent-fill-hover": #777777, "--accent-fill-pressed": #000000, "--accent-on-fill": #808080'
		);

		for (const state of states) expectPair(tokens, "--accent-on-fill", `--accent-fill${state}`);
		expect([tokens.get("--accent-fill"), tokens.get("--accent-fill-pressed")]).not.toEqual(["#ffffff", "#000000"]);
	});

	it("согласует обычные поверхности, если один текст не может контрастировать с исходной белой и чёрной подложкой", () => {
		const tokens = theme("light", "high", '"--bg-surface": #ffffff, "--bg-pressed": #000000, "--text-primary": #777777');

		for (const background of surfaces) expectPair(tokens, "--text-primary", background);
		expect(tokens.get("--bg-pressed")).not.toBe("#000000");
	});

	it("проверяет полупрозрачный текст и подложки после композиции над поверхностью темы", () => {
		const overrides = [
			'"--bg-canvas": #fff7ef',
			'"--bg-surface": rgb(255 255 255 / 0.6)',
			'"--bg-secondary": rgb(112 160 190 / 0.15)',
			'"--text-muted": rgb(80 105 130 / 0.35)',
			'"--selection-bg": rgb(80 70 180 / 0.2)',
			'"--selection-text": rgb(100 75 120 / 0.45)'
		].join(",");
		const normal = theme("light", "normal", overrides);
		const tokens = theme("light", "high", overrides);

		expect(tokenColor(normal, "--text-muted")[3]).toBe(0.35);
		const expectedSurface = composite(tokenColor(normal, "--bg-surface"), tokenColor(normal, "--bg-canvas"));
		for (let channel = 0; channel < 4; channel++) {
			expect(tokenColor(tokens, "--bg-surface")[channel]).toBeCloseTo(expectedSurface[channel], 6);
		}
		for (const background of surfaces) expectPair(tokens, "--text-muted", background);
		expectPair(tokens, "--selection-text", "--selection-bg");
	});

	it("сохраняет контраст обратного текста на эффективном полупрозрачном основном цвете", () => {
		const tokens = theme("light", "high", '"--text-primary": rgb(0 0 0 / 0.8), "--text-inverse": rgb(255 255 255 / 0.65)');

		expectPair(tokens, "--text-primary", "--bg-surface");
		expectPair(tokens, "--text-inverse", "--text-primary");
	});

	it("отклоняет полупрозрачный canvas, для которого неизвестен фон документа", () => {
		const overrides = '"--bg-canvas": rgb(255 255 255 / 0.8)';
		expect(() => theme("light", "high", overrides)).toThrow(/--bg-canvas/);
		expect(() => theme("light", "auto", overrides)).toThrow(/--bg-canvas/);
		expect(() => theme("light", "normal", overrides)).not.toThrow();
	});

	it("фиксирует ссылки проверяемых ролей до изменения роли, на которую они ссылаются", () => {
		const aliased = theme("light", "high", '"--text-primary": var(--bg-pressed), "--bg-pressed": #aa3377');
		const literal = theme("light", "high", '"--text-primary": #aa3377, "--bg-pressed": #aa3377');

		expect(tokenColor(aliased, "--text-primary")).toEqual(tokenColor(literal, "--text-primary"));
		expectSemanticContrast(aliased);
	});

	it("сохраняет дополнительные project-specific aliases как ссылки на адаптированные семантические роли", () => {
		const overrides = [
			'"--text-primary": #7999bb',
			'"--project-ink": var(--text-primary)',
			'"--project-ink-alias": var(--project-ink)',
			'"--project-unknown": var(--host-specific-color)'
		].join(",");
		const normal = theme("light", "normal", overrides);
		const high = theme("light", "high", overrides);

		expect(high.get("--project-ink")).toBe("var(--text-primary)");
		expect(high.get("--project-ink-alias")).toBe("var(--project-ink)");
		expect(high.get("--project-unknown")).toBe("var(--host-specific-color)");
		expect(tokenColor(high, "--project-ink-alias")).toEqual(tokenColor(high, "--text-primary"));
		expect(tokenColor(high, "--project-ink-alias")).not.toEqual(tokenColor(normal, "--project-ink-alias"));
	});

	it("разрешает цепочки ссылок на известные токены только при расчёте контраста", () => {
		const overrides = '"--text-primary": var(--my-text), "--my-text": var(--my-ink), "--my-ink": #aaaaaa';
		const normal = theme("light", "normal", overrides);
		const high = theme("light", "high", overrides);

		expect(normal.get("--text-primary")).toBe("var(--my-text)");
		for (const background of surfaces) expectPair(high, "--text-primary", background);
		expect(high.get("--my-ink")).toBe("#aaaaaa");
	});

	it.each(['"--text-primary": var(--unknown-color)', '"--text-primary": var(--my-text), "--my-text": var(--text-primary)'])(
		"отклоняет неразрешимую ссылку в проверяемой цветовой роли: %s",
		(overrides) => {
			expect(() => theme("light", "high", overrides)).toThrow(/--text-primary|--unknown-color|--my-text/);
			expect(() => theme("light", "auto", overrides)).toThrow(/--text-primary|--unknown-color|--my-text/);
			expect(() => theme("light", "normal", overrides)).not.toThrow();
		}
	);

	it("оценивает выходящие за sRGB каналы после того же ограничения, которое применяет браузер", () => {
		const outside = theme("light", "high", '"--accent-text": rgb(300 -10 0)');
		const clipped = theme("light", "high", '"--accent-text": #ff0000');

		expect(comparableTokens(outside)).toEqual(comparableTokens(clipped));
		expectSemanticContrast(outside);
	});

	it.each(["huge", "true", "null"])("отклоняет неизвестный режим контрастности %s", (mode) => {
		expect(() => compile(`.theme { @include themes.theme(light, $contrast: ${mode}); }`)).toThrow(/контраст|contrast/i);
	});
});
