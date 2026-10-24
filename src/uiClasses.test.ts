import { describe, expect, it } from "vitest";

import { resolveUiScheme } from "./uiClasses";

describe("resolveUiScheme", () => {
	it.each(["neutral", "accent", "error", "warning", "success", "info"] as const)(
		"сохраняет заданный тон %s для содержимого ghost",
		(tone) => {
			expect(resolveUiScheme({ tone, appearance: "ghost" })).toEqual({ tone, appearance: "ghost" });
		}
	);

	it("сохраняет нейтральный ghost без явно заданного тона", () => {
		expect(resolveUiScheme({ appearance: "ghost" })).toEqual({ tone: "neutral", appearance: "ghost" });
	});

	it("применяет резервный тон к ghost, если основной тон не задан", () => {
		expect(resolveUiScheme({ appearance: "ghost", fallbackTone: "info" })).toEqual({ tone: "info", appearance: "ghost" });
	});

	it("сохраняет явный тон при резервном ghost appearance", () => {
		expect(resolveUiScheme({ tone: "error", fallbackAppearance: "ghost" })).toEqual({ tone: "error", appearance: "ghost" });
	});

	it("сохраняет обычную нейтральную схему и outline для цветного тона без appearance", () => {
		expect(resolveUiScheme({})).toEqual({ tone: "neutral", appearance: undefined });
		expect(resolveUiScheme({ tone: "accent" })).toEqual({ tone: "accent", appearance: "outline" });
	});

	it.each(["solid", "outline"] as const)("сохраняет прежнее разрешение %s", (appearance) => {
		expect(resolveUiScheme({ tone: "neutral", appearance })).toEqual({ tone: "neutral", appearance: undefined });
		expect(resolveUiScheme({ tone: "success", appearance })).toEqual({ tone: "success", appearance });
	});
});
