import { Placement } from "@floating-ui/react";
import {
	type FloatingListboxPlacementStrategy,
	type FloatingListboxSizeResolver,
	useFloatingListbox
} from "@ryuzaki13/react-foundation-lib/hooks";

import { PickerTriggerMode, createPickerTriggerPolicy } from "./createPickerTriggerPolicy";

interface UsePickerFloatingListboxParams<T> {
	options: readonly T[];
	selectedIndex: number;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	getOptionDisabled?: (option: T) => boolean;
	onSelect?: (option: T) => void;
	disabled?: boolean;
	placement?: Placement;
	placementStrategy?: FloatingListboxPlacementStrategy;
	closeOnSelect?: boolean;
	focusFloatingOnOpen?: boolean;
	allowOpenWithoutOptions?: boolean;
	restoreFocusOnClose?: boolean;
	triggerMode?: PickerTriggerMode;
	resolveFloatingSize?: FloatingListboxSizeResolver;
}

/**
 * Единая точка входа для popup/listbox поведения во всех picker-компонентах.
 */
export function usePickerFloatingListbox<T>(params: UsePickerFloatingListboxParams<T>) {
	const triggerPolicy = params.triggerMode ? createPickerTriggerPolicy(params.triggerMode) : undefined;

	return useFloatingListbox({
		...params,
		focusFloatingOnOpen: params.focusFloatingOnOpen ?? triggerPolicy?.focusFloatingOnOpen,
		restoreFocusOnClose: params.restoreFocusOnClose ?? triggerPolicy?.restoreFocusOnClose
	});
}
