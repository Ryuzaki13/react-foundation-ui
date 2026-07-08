import { MouseEvent, ReactNode } from "react";

import { ChevronDownIcon } from "lucide-react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../ui.module.scss";

interface PickerTriggerActionsProps {
	open: boolean;
	disabled?: boolean;
	children?: ReactNode;
	onToggleMouseDown?: (event: MouseEvent<HTMLButtonElement>) => void;
	onToggleClick: () => void;
	openAriaLabel?: string;
	closeAriaLabel?: string;
}

export function PickerTriggerActions({
	open,
	disabled,
	children,
	onToggleMouseDown,
	onToggleClick,
	openAriaLabel = "Открыть список",
	closeAriaLabel = "Закрыть список"
}: PickerTriggerActionsProps) {
	return (
		<div className={uiStyles.uiToggleButtonContainer} data-disabled={disabled || undefined}>
			{children}

			<div className={uiStyles.uiButtonSeparator} />

			<button
				type="button"
				aria-label={open ? closeAriaLabel : openAriaLabel}
				className={uiStyles.uiToggleButton}
				onMouseDown={onToggleMouseDown}
				onClick={onToggleClick}>
				<ChevronDownIcon className={cn(uiStyles.uiToggleIcon, open && uiStyles.uiToggleIconOpen)} />
			</button>
		</div>
	);
}
