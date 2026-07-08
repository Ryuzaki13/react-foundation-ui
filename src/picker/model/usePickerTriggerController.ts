import { MouseEvent, RefObject } from "react";

import { PickerTriggerMode, createPickerTriggerPolicy } from "./createPickerTriggerPolicy";

interface UsePickerTriggerControllerOptions {
	mode: PickerTriggerMode;
	open: boolean;
	currentQuery: string;
	hasDisplayValue: boolean;
	inputRef: RefObject<HTMLInputElement | null>;
	setQuery?: (value: string) => void;
	openList?: () => void;
	close?: () => void;
	toggleOpen?: () => void;
	onBeforeOpen?: () => void;
}

interface HandleTriggerKeyDownOptions {
	event: React.KeyboardEvent<HTMLElement>;
	onActivateWhenOpen?: () => void;
	enableSpaceActivation?: boolean;
	enableClosedArrowDownOpen?: boolean;
	suppressClosedArrowUp?: boolean;
}

function focusInput(inputRef: RefObject<HTMLInputElement | null>) {
	requestAnimationFrame(() => {
		inputRef.current?.focus();
	});
}

/**
 * Единый контроллер пользовательских действий на trigger-input.
 * Держит поведение display/search-single/search-multi в одном месте.
 */
export function usePickerTriggerController({
	mode,
	open,
	currentQuery,
	hasDisplayValue,
	inputRef,
	setQuery,
	openList,
	close,
	toggleOpen,
	onBeforeOpen
}: UsePickerTriggerControllerOptions) {
	const policy = createPickerTriggerPolicy(mode);

	const openTrigger = () => {
		onBeforeOpen?.();

		if (openList) {
			openList();
			return;
		}

		toggleOpen?.();
	};

	const closeTrigger = () => {
		if (close) {
			close();
			return;
		}

		toggleOpen?.();
	};

	const toggleTrigger = () => {
		if (open) {
			closeTrigger();
		} else {
			openTrigger();
		}

		if (policy.shouldFocusReferenceOnToggle(open)) {
			focusInput(inputRef);
		}
	};

	return {
		policy,
		handleTriggerInputChange: (nextValue: string) => {
			setQuery?.(nextValue);

			if (policy.shouldOpenOnInputChange(open)) {
				openTrigger();
			}
		},
		handleTriggerClick: () => {
			if (policy.shouldOpenOnTriggerClick(open)) {
				openTrigger();
			}
		},
		handleTriggerFocus: (input: HTMLInputElement) => {
			if (
				policy.shouldSelectTriggerTextOnFocus({
					open,
					currentQuery,
					hasDisplayValue
				})
			) {
				requestAnimationFrame(() => {
					input.select();
				});
			}
		},
		handleToggleMouseDown: (event: MouseEvent<HTMLButtonElement>) => {
			event.preventDefault();
		},
		handleToggleClick: () => {
			toggleTrigger();
		},
		handleTriggerKeyDown: ({
			event,
			onActivateWhenOpen,
			enableSpaceActivation = false,
			enableClosedArrowDownOpen = false,
			suppressClosedArrowUp = false
		}: HandleTriggerKeyDownOptions) => {
			if (!open && suppressClosedArrowUp && event.key === "ArrowUp") {
				event.preventDefault();
				return;
			}

			if (!open && enableClosedArrowDownOpen && event.key === "ArrowDown") {
				event.preventDefault();
				toggleTrigger();
				return;
			}

			if (event.key === "Enter") {
				event.preventDefault();

				if (open) {
					onActivateWhenOpen?.();
				} else {
					toggleTrigger();
				}

				return;
			}

			if (enableSpaceActivation && event.key === " ") {
				event.preventDefault();

				if (open) {
					onActivateWhenOpen?.();
				} else {
					toggleTrigger();
				}
			}
		},
		toggleTrigger
	};
}
