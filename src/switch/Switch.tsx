import React, { useId } from "react";

import { BanIcon, CheckCircle2Icon } from "lucide-react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { UiBaseProps } from "../types";
import uiStyles from "../ui.module.scss";

import styles from "./Switch.module.scss";

type BaseSwitchProps = {
	checkedIcon?: React.ReactNode;
	uncheckedIcon?: React.ReactNode;
};

type BiStateSwitchProps = BaseSwitchProps &
	UiBaseProps<boolean> & {
		triState?: false;
	};

type TriStateSwitchProps = BaseSwitchProps &
	UiBaseProps<boolean | undefined> & {
		triState: true;
	};

type SwitchProps = (TriStateSwitchProps | BiStateSwitchProps) &
	Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onChange" | "value">;

/**
 * Переключатель boolean-состояния в виде слайдера. Подходит для быстрых настроек и включения/отключения опций.
 */
export function Switch(props: SwitchProps) {
	const {
		label,
		description,
		disabled,
		checkedIcon = <CheckCircle2Icon />,
		uncheckedIcon = <BanIcon />,
		className,
		type,
		id: externalId,
		size,
		placeholder,
		onChange: _onChange,
		value: _value,
		triState: _triState,
		...buttonProps
	} = props;
	const autoId = useId();
	const id = externalId ?? autoId;
	const descriptionId = description ? `${id}-description` : undefined;
	const labelId = label ? `${id}-label` : undefined;
	void size;
	void placeholder;
	void _onChange;
	void _value;
	void _triState;

	const handleChange = () => {
		if (!props.triState) {
			props.onChange(!props.value);
			return;
		}

		if (props.value === undefined) {
			props.onChange(true);
			return;
		}

		if (props.value === true) {
			props.onChange(false);
			return;
		}

		if (props.value === false) {
			props.onChange(undefined);
		}
	};

	const isChecked = typeof props.value === "boolean" ? props.value : false;
	const showAutoState = props.triState && typeof props.value !== "boolean";
	const ariaLabel = buttonProps["aria-label"] ?? (!label ? "Переключатель" : undefined);

	return (
		<div className={cn(uiStyles.uiElement, disabled && uiStyles.disabled)} aria-disabled={disabled || undefined}>
			{label && (
				<div id={labelId} className={uiStyles.uiLabel}>
					{label}:
				</div>
			)}
			{description && (
				<p id={descriptionId} className={uiStyles.uiDescription}>
					{description}
				</p>
			)}
			<button
				{...buttonProps}
				id={id}
				type={type ?? "button"}
				role="switch"
				disabled={disabled}
				aria-checked={isChecked}
				aria-describedby={descriptionId}
				aria-labelledby={labelId}
				aria-label={ariaLabel}
				aria-disabled={disabled}
				data-ui="switch"
				data-action="toggle-switch"
				onClick={handleChange}
				className={cn(uiStyles.uiInputControl, styles.switchWrapper, className)}>
				<div className={styles.switch} data-disabled={disabled || undefined}>
					{showAutoState ? (
						<div className={cn(styles.iconWrapper, styles.auto, styles.checked)}>Auto</div>
					) : (
						<>
							<div className={cn(styles.iconWrapper, !props.value && styles.checked)}>{uncheckedIcon}</div>
							<div className={cn(styles.iconWrapper, props.value && styles.checked)}>{checkedIcon}</div>
						</>
					)}
				</div>
			</button>
		</div>
	);
}
