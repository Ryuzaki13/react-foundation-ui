import { PICKER_TRIGGER_MODE_DISPLAY, PICKER_TRIGGER_MODE_SEARCH_SINGLE, PICKER_TRIGGER_MODE_SEARCH_MULTI } from "./pickerTriggerModes";
export type PickerTriggerMode =
	typeof PICKER_TRIGGER_MODE_DISPLAY | typeof PICKER_TRIGGER_MODE_SEARCH_SINGLE | typeof PICKER_TRIGGER_MODE_SEARCH_MULTI;

interface PickerTriggerTextFocusParams {
	open: boolean;
	currentQuery: string;
	hasDisplayValue: boolean;
}

export interface PickerTriggerPolicy {
	focusFloatingOnOpen: boolean;
	restoreFocusOnClose: boolean;
	resetQueryOnClose: boolean;
	shouldOpenOnTriggerClick: (open: boolean) => boolean;
	shouldOpenOnInputChange: (open: boolean) => boolean;
	shouldFocusReferenceOnToggle: (open: boolean) => boolean;
	shouldSelectTriggerTextOnFocus: (params: PickerTriggerTextFocusParams) => boolean;
}

/**
 * Единая политика поведения trigger-input для picker-компонентов.
 * Нормализует различия между display-режимом, single-search и multi-search.
 */
export function createPickerTriggerPolicy(mode: PickerTriggerMode): PickerTriggerPolicy {
	switch (mode) {
		case PICKER_TRIGGER_MODE_SEARCH_SINGLE:
			return {
				focusFloatingOnOpen: false,
				restoreFocusOnClose: false,
				resetQueryOnClose: true,
				shouldOpenOnTriggerClick: () => false,
				shouldOpenOnInputChange: (open) => !open,
				shouldFocusReferenceOnToggle: (open) => !open,
				shouldSelectTriggerTextOnFocus: ({ open, currentQuery, hasDisplayValue }) =>
					!open && currentQuery.length === 0 && hasDisplayValue
			};
		case PICKER_TRIGGER_MODE_SEARCH_MULTI:
			return {
				focusFloatingOnOpen: false,
				restoreFocusOnClose: false,
				resetQueryOnClose: true,
				shouldOpenOnTriggerClick: () => false,
				shouldOpenOnInputChange: (open) => !open,
				shouldFocusReferenceOnToggle: (open) => !open,
				shouldSelectTriggerTextOnFocus: () => false
			};
		case PICKER_TRIGGER_MODE_DISPLAY:
		default:
			return {
				focusFloatingOnOpen: true,
				restoreFocusOnClose: true,
				resetQueryOnClose: false,
				shouldOpenOnTriggerClick: (open) => !open,
				shouldOpenOnInputChange: () => false,
				shouldFocusReferenceOnToggle: () => false,
				shouldSelectTriggerTextOnFocus: () => false
			};
	}
}
