import { describe, expect, it } from "vitest";

import { DEFAULT_LAYOUT_PICKER_PRESETS } from "./presets";
import { type LayoutPickerPreset } from "./types";

describe("DEFAULT_LAYOUT_PICKER_PRESETS", () => {
	it("сохраняет уникальные ID схем", () => {
		expect(new Set(DEFAULT_LAYOUT_PICKER_PRESETS.map((preset) => preset.id)).size).toBe(DEFAULT_LAYOUT_PICKER_PRESETS.length);
	});

	it.each<LayoutPickerPreset>(DEFAULT_LAYOUT_PICKER_PRESETS)("$id заполняет сетку без пересечений и пропусков", (preset) => {
		const positions = new Set<string>();
		const cellIds = new Set<string>();

		// Пресет служит геометрией внешнего layout: каждая позиция должна принадлежать
		// ровно одной области, включая позиции под растянутой большой ячейкой.
		for (const cell of preset.cells) {
			expect(cellIds.has(cell.id)).toBe(false);
			cellIds.add(cell.id);

			const rowSpan = cell.rowSpan ?? 1;
			const columnSpan = cell.columnSpan ?? 1;

			expect(cell.row).toBeGreaterThanOrEqual(1);
			expect(cell.column).toBeGreaterThanOrEqual(1);
			expect(rowSpan).toBeGreaterThanOrEqual(1);
			expect(columnSpan).toBeGreaterThanOrEqual(1);
			expect(cell.row + rowSpan - 1).toBeLessThanOrEqual(preset.rows);
			expect(cell.column + columnSpan - 1).toBeLessThanOrEqual(preset.columns);

			for (let row = cell.row; row < cell.row + rowSpan; row++) {
				for (let column = cell.column; column < cell.column + columnSpan; column++) {
					const position = `${row}:${column}`;
					expect(positions.has(position)).toBe(false);
					positions.add(position);
				}
			}
		}

		expect(positions.size).toBe(preset.rows * preset.columns);
	});
});
