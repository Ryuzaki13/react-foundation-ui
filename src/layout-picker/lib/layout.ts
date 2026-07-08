import { type CSSProperties } from "react";

import { type LayoutPickerPreset, type LayoutPickerPresetCell } from "./types";

/**
 * Возвращает CSS Grid-стиль для схематичного layout-пресета.
 */
export function getLayoutStyle(preset: LayoutPickerPreset, rowMinHeightInEm?: number): CSSProperties {
	return {
		gridTemplateColumns: `repeat(${preset.columns}, minmax(0, 1fr))`,
		gridTemplateRows: `repeat(${preset.rows}, minmax(${rowMinHeightInEm ?? 0}em, 1fr))`
	};
}

/**
 * Возвращает позиционирование ячейки внутри CSS Grid.
 */
export function getLayoutCellStyle(cell: LayoutPickerPresetCell): CSSProperties {
	return {
		gridColumn: `${cell.column} / span ${cell.columnSpan ?? 1}`,
		gridRow: `${cell.row} / span ${cell.rowSpan ?? 1}`
	};
}
