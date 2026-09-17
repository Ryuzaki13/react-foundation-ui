import { useCallback, type MouseEvent } from "react";

import { PickerTriggerActions } from "../picker";
import { usePopoverContext } from "../popover";

export interface SliderPopoverToggleProps {
	open: boolean;
	disabled?: boolean;
	setOpen: (nextOpen: boolean | ((prev: boolean) => boolean)) => void;
}

/**
 * Сохраняет прежний wrapper как floating-anchor, а popup-семантику передаёт
 * вложенной кнопке: так ARIA остаётся валидной без сдвига панели на один пиксель.
 */
export function SliderPopoverToggle({ open, disabled, setOpen }: SliderPopoverToggleProps) {
	const { refs, contentId } = usePopoverContext();
	const setReference = useCallback((node: HTMLDivElement | null) => refs.setReference(node), [refs]);

	const handleWrapperClick = (event: MouseEvent<HTMLDivElement>) => {
		if (event.defaultPrevented) return;

		event.preventDefault();
		event.stopPropagation();
	};

	return (
		<div ref={setReference} onClick={handleWrapperClick}>
			<PickerTriggerActions
				open={open}
				disabled={disabled}
				openAriaLabel="Открыть слайдер"
				closeAriaLabel="Закрыть слайдер"
				toggleAria={{
					"aria-controls": contentId,
					"aria-expanded": open,
					"aria-haspopup": "dialog"
				}}
				onToggleMouseDown={(event) => event.preventDefault()}
				onToggleClick={() => setOpen((prev) => !prev)}
			/>
		</div>
	);
}
