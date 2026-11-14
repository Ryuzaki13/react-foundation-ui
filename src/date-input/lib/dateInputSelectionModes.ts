import { normalizePresetIds, resolvePresetOptionsByIds, type PresetOption } from "@ryuzaki13/react-foundation-lib/presets";

import {
	DATE_INPUT_SELECTION_MODE_DAY,
	DATE_INPUT_SELECTION_MODE_WEEK,
	DATE_INPUT_SELECTION_MODE_MONTH,
	DATE_INPUT_SELECTION_MODE_YEAR
} from "./dateInputCalendarConstants";

import type { DateInputSelectionMode } from "./types";

/**
 * Описание встроенного режима выбора даты для runtime-переключателя и внешних конфигураторов.
 */
export interface DateInputSelectionModeOption extends PresetOption<DateInputSelectionMode> {}

/**
 * Канонический список режимов выбора даты.
 */
export const DATE_INPUT_SELECTION_MODES = Object.freeze([
	DATE_INPUT_SELECTION_MODE_DAY,
	DATE_INPUT_SELECTION_MODE_WEEK,
	DATE_INPUT_SELECTION_MODE_MONTH,
	DATE_INPUT_SELECTION_MODE_YEAR
] as const satisfies readonly DateInputSelectionMode[]);

/**
 * Встроенные режимы выбора даты с пользовательскими подписями.
 */
export const DATE_INPUT_SELECTION_MODE_OPTIONS: readonly DateInputSelectionModeOption[] = Object.freeze([
	{ id: DATE_INPUT_SELECTION_MODE_DAY, label: "День" },
	{ id: DATE_INPUT_SELECTION_MODE_WEEK, label: "Неделя" },
	{ id: DATE_INPUT_SELECTION_MODE_MONTH, label: "Месяц" },
	{ id: DATE_INPUT_SELECTION_MODE_YEAR, label: "Год" }
]);

const DATE_INPUT_SELECTION_MODE_SET: ReadonlySet<string> = new Set(DATE_INPUT_SELECTION_MODES);

/**
 * Проверяет, что внешнее значение является поддерживаемым режимом выбора даты.
 */
export function isDateInputSelectionMode(value: unknown): value is DateInputSelectionMode {
	return typeof value === "string" && DATE_INPUT_SELECTION_MODE_SET.has(value);
}

/**
 * Нормализует сохранённый список режимов, сохраняя пользовательский порядок и удаляя дубли.
 */
export function normalizeDateInputSelectionModes(
	value: unknown,
	fallbackModes: readonly DateInputSelectionMode[] = DATE_INPUT_SELECTION_MODES
): DateInputSelectionMode[] {
	return normalizePresetIds(value, isDateInputSelectionMode, fallbackModes);
}

/**
 * Формирует упорядоченный список описаний по сохранённым режимам выбора.
 */
export function resolveDateInputSelectionModeOptionsByModes(
	modes: readonly DateInputSelectionMode[],
	options: readonly DateInputSelectionModeOption[] = DATE_INPUT_SELECTION_MODE_OPTIONS
): DateInputSelectionModeOption[] {
	return resolvePresetOptionsByIds(modes, options);
}
