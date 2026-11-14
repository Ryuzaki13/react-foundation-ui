import React, { useId } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { UiBaseProps } from "../types";
import uiStyles from "../ui.module.scss";

import styles from "./Toggle.module.scss";

const TOGGLE_LABEL_BEFORE = "before";
const TOGGLE_LABEL_AFTER = "after";

type ToggleLabelPosition = typeof TOGGLE_LABEL_BEFORE | typeof TOGGLE_LABEL_AFTER;

export interface ToggleProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "checked" | "value" | "onChange" | "type">, UiBaseProps<boolean> {
	checkedText?: string;
	uncheckedText?: string;
	labelPosition?: ToggleLabelPosition;
}

/**
 * Переключаемая кнопка с сохранением активного состояния. Используется для локального выбора режима, фильтра или форматирования.
 */
export function Toggle({
	label,
	description,
	placeholder,
	disabled,
	size,
	className,
	onChange,
	value,
	id: externalId,
	checkedText = "ВКЛ",
	uncheckedText = "ВЫКЛ",
	labelPosition = TOGGLE_LABEL_BEFORE,
	...props
}: ToggleProps) {
	const autoId = useId();
	const id = externalId ?? autoId;
	const descriptionId = description ? `${id}-description` : undefined;
	const text = label ?? placeholder;
	const isChecked = Boolean(value);
	const fallbackAriaLabel = !text && !props["aria-label"] ? `${uncheckedText} / ${checkedText}` : undefined;

	const labelElement = text ? (
		<label htmlFor={id} className={uiStyles.uiLabel}>
			{text}
		</label>
	) : null;

	return (
		<div
			className={cn(uiStyles.uiElement, disabled && uiStyles.disabled, size && uiStyles.uiSizable, size && uiStyles[size], className)}
			aria-disabled={disabled || undefined}>
			<div className={styles.row}>
				{labelPosition === TOGGLE_LABEL_BEFORE && labelElement}
				<div className={styles.wrapper}>
					<input
						{...props}
						id={id}
						type="checkbox"
						role="switch"
						checked={isChecked}
						disabled={disabled}
						aria-checked={isChecked}
						aria-describedby={descriptionId}
						aria-label={fallbackAriaLabel}
						className={cn(uiStyles.uiInputControl, styles.input)}
						onChange={(event) => onChange?.(event.currentTarget.checked)}
					/>
					<div className={styles.track} data-disabled={disabled || undefined} aria-hidden="true">
						<div className={styles.thumb} />
						<div className={cn(styles.option, styles.unchecked)}>{uncheckedText}</div>
						<div className={cn(styles.option, styles.checked)}>{checkedText}</div>
					</div>
				</div>
				{labelPosition === TOGGLE_LABEL_AFTER && labelElement}
			</div>
			{description && (
				<p id={descriptionId} className={uiStyles.uiDescription}>
					{description}
				</p>
			)}
		</div>
	);
}
