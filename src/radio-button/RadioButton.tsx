import React, { useId } from "react";

import { CircleIcon } from "lucide-react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import baseStyles from "../check-box/CheckBox.module.scss";
import uiStyles from "../ui.module.scss";
import { getUiToneClassName } from "../uiClasses";

import styles from "./RadioButton.module.scss";

import type { UiBaseProps, UiTone } from "../types";

export interface RadioButtonProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "checked" | "value" | "onChange" | "type">, UiBaseProps<boolean> {
	tone?: UiTone;
}

/**
 * Компонент радиокнопки для выбора одного варианта.
 * Поддерживает tone + appearance и использует общие selection utility-классы из ui.module.scss.
 */
export const RadioButton: React.FC<RadioButtonProps> = ({
	label,
	description,
	placeholder,
	disabled,
	size,
	className,
	onChange,
	value,
	id: externalId,
	tone = "neutral",
	...props
}) => {
	const autoId = useId();
	const id = externalId ?? autoId;
	const descriptionId = description ? `${id}-description` : undefined;
	const text = label ?? placeholder;
	const checked = value ?? false;

	return (
		<div
			className={cn(
				uiStyles.uiElement,
				size && uiStyles.uiSizable,
				size && uiStyles[size],
				disabled && uiStyles.disabled,
				className
			)}>
			<div className={baseStyles.row}>
				<div className={cn(baseStyles.wrapper, getUiToneClassName(tone))}>
					<input
						{...props}
						id={id}
						type="checkbox"
						role="radio"
						checked={checked}
						disabled={disabled}
						aria-disabled={disabled}
						aria-checked={checked}
						aria-describedby={descriptionId}
						className={cn(uiStyles.uiSelectionControl, baseStyles.input, styles.radioInput)}
						onChange={() => onChange?.(!checked)}
					/>
					<div className={cn(uiStyles.uiSelectionIcon, baseStyles.icon)} aria-hidden="true">
						<CircleIcon />
					</div>
				</div>
				{text && (
					<label htmlFor={id} className={uiStyles.uiLabel}>
						{text}
					</label>
				)}
			</div>
			{description && (
				<p id={descriptionId} className={uiStyles.uiDescription}>
					{description}
				</p>
			)}
		</div>
	);
};
