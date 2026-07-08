export type PickerTriggerMode = "display" | "search-single" | "search-multi";

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
		case "search-single":
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
		case "search-multi":
			return {
				focusFloatingOnOpen: false,
				restoreFocusOnClose: false,
				resetQueryOnClose: true,
				shouldOpenOnTriggerClick: () => false,
				shouldOpenOnInputChange: (open) => !open,
				shouldFocusReferenceOnToggle: (open) => !open,
				shouldSelectTriggerTextOnFocus: () => false
			};
		case "display":
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
