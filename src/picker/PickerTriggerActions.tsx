import { type AriaAttributes, type MouseEvent, type ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { ChevronDownIcon } from "lucide-react";

import uiStyles from "../ui.module.scss";

interface PickerTriggerActionsProps {
	open: boolean;
	disabled?: boolean;
	children?: ReactNode;
	onToggleMouseDown?: (event: MouseEvent<HTMLButtonElement>) => void;
	onToggleClick: () => void;
	openAriaLabel?: string;
	closeAriaLabel?: string;
	/**
	 * Передаёт ARIA-связи непосредственно кнопке раскрытия, не меняя геометрию
	 * контейнера с adornment-действиями.
	 */
	toggleAria?: Pick<AriaAttributes, "aria-controls" | "aria-expanded" | "aria-haspopup">;
}

export function PickerTriggerActions({
	open,
	disabled,
	children,
	onToggleMouseDown,
	onToggleClick,
	openAriaLabel = "Открыть список",
	closeAriaLabel = "Закрыть список",
	toggleAria
}: PickerTriggerActionsProps) {
	return (
		<div className={uiStyles.uiToggleButtonContainer} data-disabled={disabled || undefined}>
			{children}

			<div className={uiStyles.uiButtonSeparator} />

			<button
				{...toggleAria}
				type="button"
				disabled={disabled}
				aria-label={open ? closeAriaLabel : openAriaLabel}
				className={uiStyles.uiToggleButton}
				onMouseDown={onToggleMouseDown}
				onClick={onToggleClick}>
				<ChevronDownIcon className={cn(uiStyles.uiToggleIcon, open && uiStyles.uiToggleIconOpen)} />
			</button>
		</div>
	);
}
