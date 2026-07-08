import React, { Children, forwardRef } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { FloatingPopover } from "../popover";
import uiStyles from "../ui.module.scss";
import { getUiAppearanceClassName, getUiToneClassName, resolveUiScheme } from "../uiClasses";

import styles from "./Button.module.scss";

import type { UiAppearance, UiTone, UiVariant } from "../types";

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
	variant?: UiVariant;
	tone?: UiTone;
	appearance?: UiAppearance;
	icon?: React.ReactNode;
	iconEnd?: boolean;

	/**
	 * По умолчанию делаем безопасное поведение в формах.
	 */
	type?: "button" | "submit" | "reset";
}

/**
 * Базовая кнопка дизайн-системы для пользовательских действий.
 * Поддерживает состояния, tone + appearance, иконки и безопасный `type="button"` по умолчанию.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ children, disabled, className, icon, iconEnd, title, variant, tone, appearance, type = "button", "aria-label": ariaLabel, ...props },
	ref
) {
	const hasChildren = Children.count(children) > 0;
	const iconOnly = !!icon && !hasChildren;
	const fallbackAppearance = tone && tone !== "neutral" ? "solid" : "outline";
	const scheme = resolveUiScheme({ variant, tone, appearance, fallbackAppearance });

	// Если кнопка только с иконкой, нужен aria-label или title.
	const computedAriaLabel = iconOnly ? (ariaLabel ?? title) : ariaLabel;

	const button = (
		<button
			{...props}
			ref={ref}
			type={type}
			disabled={disabled}
			aria-label={computedAriaLabel}
			className={cn(
				uiStyles.uiElement,
				uiStyles.uiInputControl,
				styles.button,
				getUiToneClassName(scheme.tone),
				getUiAppearanceClassName(scheme.appearance),
				iconOnly ? styles.iconOnly : "",
				"textNoWrap",
				className ?? ""
			)}>
			<span className={styles.buttonInner}>
				{icon && !iconEnd && (
					<span aria-hidden="true" className={styles.buttonIcon}>
						{icon}
					</span>
				)}

				{hasChildren && <span className="flexEllipsis">{children}</span>}

				{icon && iconEnd && (
					<span aria-hidden="true" className={styles.buttonIcon}>
						{icon}
					</span>
				)}
			</span>
		</button>
	);

	if (!title) return button;

	return (
		<FloatingPopover placement="bottom" tooltip content={<>{title}</>}>
			{button}
		</FloatingPopover>
	);
});
