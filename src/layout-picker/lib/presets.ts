import { type LayoutPickerPreset } from "./types";

/**
 * Базовый набор layout-пресетов для первого среза выбора схемы.
 *
 * id формата:
 * - "2x3" — 2 строки, 3 колонки
 * - "2x2-l" — 2x2 с большой ячейкой слева
 * - "3x2-b" — 3x2 с широкой нижней ячейкой
 */
export const DEFAULT_LAYOUT_PICKER_PRESETS = [
	{
		id: "1x1",
		label: "1x1",
		columns: 1,
		rows: 1,
		cells: [{ id: "c11", row: 1, column: 1 }]
	},
	{
		id: "1x2",
		label: "1x2",
		columns: 2,
		rows: 1,
		cells: [
			{ id: "c11", row: 1, column: 1 },
			{ id: "c12", row: 1, column: 2 }
		]
	},
	{
		id: "1x3",
		label: "1x3",
		columns: 3,
		rows: 1,
		cells: [
			{ id: "c11", row: 1, column: 1 },
			{ id: "c12", row: 1, column: 2 },
			{ id: "c13", row: 1, column: 3 }
		]
	},
	{
		id: "2x1",
		label: "2x1",
		columns: 1,
		rows: 2,
		cells: [
			{ id: "c11", row: 1, column: 1 },
			{ id: "c21", row: 2, column: 1 }
		]
	},
	{
		id: "2x2",
		label: "2x2",
		columns: 2,
		rows: 2,
		cells: [
			{ id: "c11", row: 1, column: 1 },
			{ id: "c12", row: 1, column: 2 },
			{ id: "c21", row: 2, column: 1 },
			{ id: "c22", row: 2, column: 2 }
		]
	},
	{
		id: "2x3",
		label: "2x3",
		columns: 3,
		rows: 2,
		cells: [
			{ id: "c11", row: 1, column: 1 },
			{ id: "c12", row: 1, column: 2 },
			{ id: "c13", row: 1, column: 3 },
			{ id: "c21", row: 2, column: 1 },
			{ id: "c22", row: 2, column: 2 },
			{ id: "c23", row: 2, column: 3 }
		]
	},
	{
		id: "3x1",
		label: "3x1",
		columns: 1,
		rows: 3,
		cells: [
			{ id: "c11", row: 1, column: 1 },
			{ id: "c21", row: 2, column: 1 },
			{ id: "c31", row: 3, column: 1 }
		]
	},
	{
		id: "3x2",
		label: "3x2",
		columns: 2,
		rows: 3,
		cells: [
			{ id: "c11", row: 1, column: 1 },
			{ id: "c12", row: 1, column: 2 },
			{ id: "c21", row: 2, column: 1 },
			{ id: "c22", row: 2, column: 2 },
			{ id: "c31", row: 3, column: 1 },
			{ id: "c32", row: 3, column: 2 }
		]
	},
	{
		id: "3x3",
		label: "3x3",
		columns: 3,
		rows: 3,
		cells: [
			{ id: "c11", row: 1, column: 1 },
			{ id: "c12", row: 1, column: 2 },
			{ id: "c13", row: 1, column: 3 },
			{ id: "c21", row: 2, column: 1 },
			{ id: "c22", row: 2, column: 2 },
			{ id: "c23", row: 2, column: 3 },
			{ id: "c31", row: 3, column: 1 },
			{ id: "c32", row: 3, column: 2 },
			{ id: "c33", row: 3, column: 3 }
		]
	},
	{
		id: "4x1",
		label: "4x1",
		columns: 1,
		rows: 4,
		cells: [
			{ id: "c11", row: 1, column: 1 },
			{ id: "c21", row: 2, column: 1 },
			{ id: "c31", row: 3, column: 1 },
			{ id: "c41", row: 4, column: 1 }
		]
	},
	{
		id: "4x2",
		label: "4x2",
		columns: 2,
		rows: 4,
		cells: [
			{ id: "c11", row: 1, column: 1 },
			{ id: "c12", row: 1, column: 2 },
			{ id: "c21", row: 2, column: 1 },
			{ id: "c22", row: 2, column: 2 },
			{ id: "c31", row: 3, column: 1 },
			{ id: "c32", row: 3, column: 2 },
			{ id: "c41", row: 4, column: 1 },
			{ id: "c42", row: 4, column: 2 }
		]
	},
	{
		id: "4x3",
		label: "4x3",
		columns: 3,
		rows: 4,
		cells: [
			{ id: "c11", row: 1, column: 1 },
			{ id: "c12", row: 1, column: 2 },
			{ id: "c13", row: 1, column: 3 },
			{ id: "c21", row: 2, column: 1 },
			{ id: "c22", row: 2, column: 2 },
			{ id: "c23", row: 2, column: 3 },
			{ id: "c31", row: 3, column: 1 },
			{ id: "c32", row: 3, column: 2 },
			{ id: "c33", row: 3, column: 3 },
			{ id: "c41", row: 4, column: 1 },
			{ id: "c42", row: 4, column: 2 },
			{ id: "c43", row: 4, column: 3 }
		]
	},

	{
		id: "2x2-l",
		label: "Большая слева + две справа",
		columns: 2,
		rows: 2,
		cells: [
			{ id: "left", row: 1, column: 1, rowSpan: 2 },
			{ id: "rt", row: 1, column: 2 },
			{ id: "rb", row: 2, column: 2 }
		]
	},
	{
		id: "2x2-r",
		label: "Две слева + большая справа",
		columns: 2,
		rows: 2,
		cells: [
			{ id: "lt", row: 1, column: 1 },
			{ id: "lb", row: 2, column: 1 },
			{ id: "right", row: 1, column: 2, rowSpan: 2 }
		]
	},
	{
		id: "2x2-t",
		label: "Широкая сверху + две снизу",
		columns: 2,
		rows: 2,
		cells: [
			{ id: "top", row: 1, column: 1, columnSpan: 2 },
			{ id: "bl", row: 2, column: 1 },
			{ id: "br", row: 2, column: 2 }
		]
	},
	{
		id: "2x2-b",
		label: "Две сверху + широкая снизу",
		columns: 2,
		rows: 2,
		cells: [
			{ id: "tl", row: 1, column: 1 },
			{ id: "tr", row: 1, column: 2 },
			{ id: "bottom", row: 2, column: 1, columnSpan: 2 }
		]
	},

	{
		id: "3x2-t",
		label: "Широкая сверху + 2x2",
		columns: 2,
		rows: 3,
		cells: [
			{ id: "top", row: 1, column: 1, columnSpan: 2 },
			{ id: "c21", row: 2, column: 1 },
			{ id: "c22", row: 2, column: 2 },
			{ id: "c31", row: 3, column: 1 },
			{ id: "c32", row: 3, column: 2 }
		]
	},
	{
		id: "3x2-b",
		label: "2x2 + широкая снизу",
		columns: 2,
		rows: 3,
		cells: [
			{ id: "c11", row: 1, column: 1 },
			{ id: "c12", row: 1, column: 2 },
			{ id: "c21", row: 2, column: 1 },
			{ id: "c22", row: 2, column: 2 },
			{ id: "bottom", row: 3, column: 1, columnSpan: 2 }
		]
	},
	{
		id: "3x2-m",
		label: "Широкая по центру",
		columns: 2,
		rows: 3,
		cells: [
			{ id: "tl", row: 1, column: 1 },
			{ id: "tr", row: 1, column: 2 },
			{ id: "middle", row: 2, column: 1, columnSpan: 2 },
			{ id: "bl", row: 3, column: 1 },
			{ id: "br", row: 3, column: 2 }
		]
	},

	{
		id: "3x3-l",
		label: "Большая слева + 2x3 справа",
		columns: 3,
		rows: 3,
		cells: [
			{ id: "left", row: 1, column: 1, rowSpan: 3 },
			{ id: "c12", row: 1, column: 2 },
			{ id: "c13", row: 1, column: 3 },
			{ id: "c22", row: 2, column: 2 },
			{ id: "c23", row: 2, column: 3 },
			{ id: "c32", row: 3, column: 2 },
			{ id: "c33", row: 3, column: 3 }
		]
	},
	{
		id: "3x3-r",
		label: "2x3 слева + большая справа",
		columns: 3,
		rows: 3,
		cells: [
			{ id: "c11", row: 1, column: 1 },
			{ id: "c12", row: 1, column: 2 },
			{ id: "right", row: 1, column: 3, rowSpan: 3 },
			{ id: "c21", row: 2, column: 1 },
			{ id: "c22", row: 2, column: 2 },
			{ id: "c31", row: 3, column: 1 },
			{ id: "c32", row: 3, column: 2 }
		]
	},
	{
		id: "3x3-t",
		label: "Широкая сверху + 2x3",
		columns: 3,
		rows: 3,
		cells: [
			{ id: "top", row: 1, column: 1, columnSpan: 3 },
			{ id: "c21", row: 2, column: 1 },
			{ id: "c22", row: 2, column: 2 },
			{ id: "c23", row: 2, column: 3 },
			{ id: "c31", row: 3, column: 1 },
			{ id: "c32", row: 3, column: 2 },
			{ id: "c33", row: 3, column: 3 }
		]
	},
	{
		id: "3x3-b",
		label: "2x3 + широкая снизу",
		columns: 3,
		rows: 3,
		cells: [
			{ id: "c11", row: 1, column: 1 },
			{ id: "c12", row: 1, column: 2 },
			{ id: "c13", row: 1, column: 3 },
			{ id: "c21", row: 2, column: 1 },
			{ id: "c22", row: 2, column: 2 },
			{ id: "c23", row: 2, column: 3 },
			{ id: "bottom", row: 3, column: 1, columnSpan: 3 }
		]
	},

	{
		id: "4x2-t",
		label: "Широкая сверху + 3x2",
		columns: 2,
		rows: 4,
		cells: [
			{ id: "top", row: 1, column: 1, columnSpan: 2 },
			{ id: "c21", row: 2, column: 1 },
			{ id: "c22", row: 2, column: 2 },
			{ id: "c31", row: 3, column: 1 },
			{ id: "c32", row: 3, column: 2 },
			{ id: "c41", row: 4, column: 1 },
			{ id: "c42", row: 4, column: 2 }
		]
	},
	{
		id: "4x2-b",
		label: "3x2 + широкая снизу",
		columns: 2,
		rows: 4,
		cells: [
			{ id: "c11", row: 1, column: 1 },
			{ id: "c12", row: 1, column: 2 },
			{ id: "c21", row: 2, column: 1 },
			{ id: "c22", row: 2, column: 2 },
			{ id: "c31", row: 3, column: 1 },
			{ id: "c32", row: 3, column: 2 },
			{ id: "bottom", row: 4, column: 1, columnSpan: 2 }
		]
	},
	{
		id: "4x3-t",
		label: "Широкая сверху + 3x3",
		columns: 3,
		rows: 4,
		cells: [
			{ id: "top", row: 1, column: 1, columnSpan: 3 },
			{ id: "c21", row: 2, column: 1 },
			{ id: "c22", row: 2, column: 2 },
			{ id: "c23", row: 2, column: 3 },
			{ id: "c31", row: 3, column: 1 },
			{ id: "c32", row: 3, column: 2 },
			{ id: "c33", row: 3, column: 3 },
			{ id: "c41", row: 4, column: 1 },
			{ id: "c42", row: 4, column: 2 },
			{ id: "c43", row: 4, column: 3 }
		]
	},
	{
		id: "4x3-b",
		label: "3x3 + широкая снизу",
		columns: 3,
		rows: 4,
		cells: [
			{ id: "c11", row: 1, column: 1 },
			{ id: "c12", row: 1, column: 2 },
			{ id: "c13", row: 1, column: 3 },
			{ id: "c21", row: 2, column: 1 },
			{ id: "c22", row: 2, column: 2 },
			{ id: "c23", row: 2, column: 3 },
			{ id: "c31", row: 3, column: 1 },
			{ id: "c32", row: 3, column: 2 },
			{ id: "c33", row: 3, column: 3 },
			{ id: "bottom", row: 4, column: 1, columnSpan: 3 }
		]
	}
] as const satisfies readonly LayoutPickerPreset[];

export type DefaultLayoutPickerPresetId = (typeof DEFAULT_LAYOUT_PICKER_PRESETS)[number]["id"];

export function getDefaultLayoutPickerPresetId(): DefaultLayoutPickerPresetId {
	return DEFAULT_LAYOUT_PICKER_PRESETS[0].id;
}

/** Возвращает layout-пресет по id с fallback на дефолт chart-ракурса. */
export function resolveLayoutPreset(layoutId: string | undefined): LayoutPickerPreset {
	return DEFAULT_LAYOUT_PICKER_PRESETS.find((preset) => preset.id === layoutId) ?? DEFAULT_LAYOUT_PICKER_PRESETS[0];
}

export function resolveLayoutCellCount(layoutId: string): number {
	return DEFAULT_LAYOUT_PICKER_PRESETS.find((preset) => preset.id === layoutId)?.cells.length ?? 1;
}
