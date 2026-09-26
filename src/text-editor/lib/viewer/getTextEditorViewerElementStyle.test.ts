import { describe, expect, it } from "vitest";

import { getTextEditorViewerElementStyle } from "./getTextEditorViewerElementStyle";

describe("getTextEditorViewerElementStyle", () => {
	it("не перекрывает наследуемое выравнивание и нулевой отступ", () => {
		expect(getTextEditorViewerElementStyle({ direction: null, alignment: "", indent: 0 })).toEqual({
			textAlign: undefined,
			marginInlineStart: undefined
		});
	});

	it("отделяет направление DOM от безопасного CSS и не меняет element", () => {
		const element = Object.freeze({ direction: "rtl", alignment: "end", indent: 1 } as const);
		expect(getTextEditorViewerElementStyle(element)).toEqual({
			textAlign: "end",
			marginInlineStart: "min(1 * var(--space-lg), 25%)"
		});
	});

	it("ограничивает максимальный визуальный отступ шириной consumer", () => {
		expect(getTextEditorViewerElementStyle({ direction: "ltr", alignment: "center", indent: 32 })).toEqual({
			textAlign: "center",
			marginInlineStart: "min(32 * var(--space-lg), 25%)"
		});
	});
});
