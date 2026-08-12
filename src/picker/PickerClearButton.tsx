import { type MouseEvent } from "react";

import { XIcon } from "lucide-react";

import uiStyles from "../ui.module.scss";

type PickerClearButtonProps = {
	disabled?: boolean;
	ariaLabel?: string;
	onClear: () => void;
};

/** Единое действие очистки выбранного значения во всех clearable picker-компонентах. */
export function PickerClearButton({ disabled, ariaLabel = "Очистить выбор", onClear }: PickerClearButtonProps) {
	const stopTriggerInteraction = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		event.stopPropagation();
	};

	return (
		<button
			type="button"
			disabled={disabled}
			className={uiStyles.uiClearButton}
			data-ui="picker-clear-button"
			data-action="clear-picker"
			onMouseDown={stopTriggerInteraction}
			onClick={(event) => {
				stopTriggerInteraction(event);
				onClear();
			}}
			aria-label={ariaLabel}>
			<XIcon />
		</button>
	);
}
