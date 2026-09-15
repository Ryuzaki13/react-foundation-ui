import { compileString } from "sass-embedded";
import { describe, expect, it } from "vitest";

import { resolve } from "node:path";

/** Компилирует публичный resize-handle-dots с указанным направлением. */
function compileResizeHandleDots(direction?: "horizontal" | "vertical"): string {
	const argument = direction ? `(${direction})` : "";

	return compileString(`@use "mixin" as *; .handle { @include resize-handle-dots${argument}; }`, {
		loadPaths: [resolve("src/styles/mixins")],
		style: "expanded"
	}).css;
}

describe("resize-handle-dots", () => {
	it.each([
		{ direction: undefined, width: 12, height: 12 },
		{ direction: "horizontal" as const, width: 12, height: 4 },
		{ direction: "vertical" as const, width: 4, height: 12 }
	])("рисует ожидаемую матрицу для направления $direction", ({ direction, width, height }) => {
		const css = compileResizeHandleDots(direction);

		expect(css).toMatch(new RegExp(`\\.handle::after \\{[^}]*width: ${width}px;[^}]*height: ${height}px;`, "s"));
	});
});
