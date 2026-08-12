import React, { useId } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { CheckIcon, MinusIcon } from "lucide-react";

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

export interface CheckBoxIndicatorProps {
	value: boolean;
	className?: string;
	tone?: UiTone;
	/** Показывает частично выбранную группу без добавления отдельного интерактивного элемента. */
	indeterminate?: boolean;
}

/**
 * Неинтерактивное представление checkbox для button/listbox-композиций. Состояние
 * и доступное имя принадлежат родительскому контролу, поэтому индикатор скрыт от
 * accessibility tree и не создаёт вложенный input внутри кнопки.
 */
export function CheckBoxIndicator({ value, className, tone = "neutral", indeterminate = false }: CheckBoxIndicatorProps) {
	const state = indeterminate ? "mixed" : value ? "checked" : "unchecked";

	return (
		<span
			className={cn(styles.wrapper, styles.indicatorWrapper, getUiToneClassName(tone), className)}
			data-ui="check-box-indicator"
			data-state={state}
			aria-hidden="true">
			<span
				className={cn(
					uiStyles.uiSelectionControl,
					styles.input,
					styles.indicator,
					value && styles.indicatorChecked,
					indeterminate && styles.inputIndeterminate
				)}
			/>
			<span className={cn(uiStyles.uiSelectionIcon, styles.icon)}>{indeterminate ? <MinusIcon /> : <CheckIcon />}</span>
		</span>
	);
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
						{indeterminate ? <MinusIcon /> : <CheckIcon />}
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
