import React, { useId } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { MinusIcon, SquareIcon } from "lucide-react";

import uiStyles from "../ui.module.scss";
import { getUiToneClassName } from "../uiClasses";

import styles from "./CheckBox.module.scss";

import type { UiBaseProps, UiTone } from "../types";

interface CheckBoxProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "checked" | "value" | "onChange" | "type">, UiBaseProps<boolean> {
	tone?: UiTone;
	noWrap?: boolean;
	/** Показывает частично выбранную группу и публикует `aria-checked="mixed"`. */
	indeterminate?: boolean;
}

/**
 * Компонент флажка для выбора булевого значения в формах и списках.
 * Поддерживает tone + appearance и использует общие selection utility-классы из ui.module.scss.
 */
export function CheckBox({
	label,
	description,
	placeholder,
	disabled,
	size,
	className,
	onChange,
	value,
	noWrap,
	id: externalId,
	tone = "neutral",
	indeterminate = false,
	...props
}: CheckBoxProps) {
	const autoId = useId();
	const id = externalId ?? autoId;
	const descriptionId = description ? `${id}-description` : undefined;
	const text = label ?? placeholder;
	const checked = value ?? false;
	const setInputNode = (node: HTMLInputElement | null) => {
		if (node) {
			node.indeterminate = indeterminate;
		}
	};

	return (
		<div
			className={cn(uiStyles.uiElement, size && uiStyles.uiSizable, size && uiStyles[size], disabled && uiStyles.disabled, className)}
			aria-disabled={disabled || undefined}>
			<div className={styles.row}>
				<div className={cn(styles.wrapper, getUiToneClassName(tone))}>
					<input
						{...props}
						ref={setInputNode}
						id={id}
						type="checkbox"
						checked={checked}
						disabled={disabled}
						aria-checked={indeterminate ? "mixed" : checked}
						aria-describedby={descriptionId}
						className={cn(uiStyles.uiSelectionControl, styles.input, indeterminate && styles.inputIndeterminate)}
						onChange={() => onChange?.(!checked)}
					/>
					<div className={cn(uiStyles.uiSelectionIcon, styles.icon)} aria-hidden="true">
						{indeterminate ? <MinusIcon /> : <SquareIcon />}
					</div>
				</div>
				{text && (
					<label htmlFor={id} className={cn(uiStyles.uiLabelBase, noWrap && "textNoWrap")}>
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
}
