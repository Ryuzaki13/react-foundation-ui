import {
	DATE_INPUT_SELECTION_MODES,
	normalizeDateInputSelectionModes,
	resolveDateInputSelectionModeOptionsByModes,
	type DateInputSelectionModeOption
} from "./dateInputSelectionModes";
import { type DateInputSelectionMode } from "./types";

/** Текущий controlled-режим остаётся доступен даже вне внешнего списка переключателя. */
export function resolveDateInputSelectionModeOptions(
	selectionModeOptions: readonly DateInputSelectionMode[] | undefined,
	selectionMode: DateInputSelectionMode
): readonly DateInputSelectionModeOption[] {
	const configuredModes = normalizeDateInputSelectionModes(selectionModeOptions, DATE_INPUT_SELECTION_MODES);
	const availableModes = configuredModes.includes(selectionMode) ? configuredModes : [...configuredModes, selectionMode];

	return resolveDateInputSelectionModeOptionsByModes(availableModes);
}
