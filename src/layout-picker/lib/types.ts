/**
 * Ячейка схематичного layout-пресета.
 */
export type LayoutPickerPresetCell = {
	id: string;
	column: number;
	columnSpan?: number;
	row: number;
	rowSpan?: number;
};

/**
 * Layout-пресет, который выбирает `LayoutPicker`.
 */
export type LayoutPickerPreset = {
	id: string;
	label: string;
	description?: string;
	columns: number;
	rows: number;
	cells: readonly LayoutPickerPresetCell[];
};
