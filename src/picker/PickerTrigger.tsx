import { type ReactNode, type Ref } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "./Picker.module.scss";
import { PickerClearButton } from "./PickerClearButton";
import { getPickerPlaceholder } from "./PickerPlaceholder";
import { PickerSelectedToken } from "./PickerSelectedToken";
import { PickerTriggerActions } from "./PickerTriggerActions";
import { PickerTriggerInput, type PickerTriggerInputProps } from "./PickerTriggerInput";

export interface PickerTriggerProps extends Omit<PickerTriggerInputProps, "placeholder" | "overlay" | "endAdornment"> {
	ref?: Ref<HTMLInputElement>;
	open: boolean;
	optionCount: number;
	placeholder?: string;
	label?: ReactNode;
	placeholderFallback?: string;
	selectedValue?: ReactNode;
	hasSelection?: boolean;
	showSelectedValue?: boolean;
	clearable?: boolean;
	onClear?: () => void;
	clearAriaLabel?: string;
	onToggleMouseDown?: PickerTriggerActionsProps["onToggleMouseDown"];
	onToggleClick: PickerTriggerActionsProps["onToggleClick"];
	openAriaLabel?: string;
	closeAriaLabel?: string;
}

type PickerTriggerActionsProps = Parameters<typeof PickerTriggerActions>[0];

/**
 * Общая композиция picker-trigger: input, выбранное значение, очистка и кнопка
 * открытия. Владельцы picker-моделей передают только состояние и обработчики.
 */
export function PickerTrigger({
	ref,
	open,
	optionCount,
	placeholder,
	label,
	placeholderFallback,
	selectedValue,
	hasSelection,
	showSelectedValue = selectedValue !== undefined && selectedValue !== null,
	clearable = false,
	onClear,
	clearAriaLabel,
	onToggleMouseDown,
	onToggleClick,
	openAriaLabel,
	closeAriaLabel,
	disabled,
	inputClassName,
	...inputProps
}: PickerTriggerProps) {
	const hasSelectedValue = hasSelection ?? (selectedValue !== undefined && selectedValue !== null);
	const canClear = clearable && hasSelectedValue && onClear !== undefined && !disabled;

	return (
		<PickerTriggerInput
			{...inputProps}
			ref={ref}
			disabled={disabled}
			placeholder={
				showSelectedValue ? undefined : getPickerPlaceholder({ placeholder, label, optionCount, fallback: placeholderFallback })
			}
			inputClassName={cn(showSelectedValue && styles.inputWithSelectedToken, inputClassName)}
			overlay={showSelectedValue ? <PickerSelectedToken>{selectedValue}</PickerSelectedToken> : undefined}
			endAdornment={
				<PickerTriggerActions
					open={open}
					disabled={disabled}
					onToggleMouseDown={onToggleMouseDown}
					onToggleClick={onToggleClick}
					openAriaLabel={openAriaLabel}
					closeAriaLabel={closeAriaLabel}>
					{canClear ? <PickerClearButton ariaLabel={clearAriaLabel} onClear={onClear} /> : null}
				</PickerTriggerActions>
			}
		/>
	);
}
