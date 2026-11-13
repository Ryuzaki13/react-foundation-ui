import React, { Children, type Ref } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { FloatingPopover } from "../popover";
import uiStyles from "../ui.module.scss";
import { getUiAppearanceClassName, getUiToneClassName, resolveUiScheme } from "../uiClasses";

import styles from "./Button.module.scss";

import type { UiAppearance, UiTone } from "../types";

export type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
	tone?: UiTone;
	appearance?: UiAppearance;
	icon?: React.ReactNode;
	iconEnd?: boolean;

	/**
	 * По умолчанию делаем безопасное поведение в формах.
	 */
	type?: "button" | "submit" | "reset";
};

/**
 * Базовая кнопка дизайн-системы для пользовательских действий.
 * Поддерживает состояния, tone + appearance, иконки и безопасный `type="button"` по умолчанию.
 */
export function Button({
	ref,
	children,
	disabled,
	className,
	icon,
	iconEnd,
	title,
	tone,
	appearance,
	type = "button",
	"aria-label": ariaLabel,
	...props
}: ButtonProps & { ref?: Ref<HTMLButtonElement> }) {
	const hasChildren = Children.count(children) > 0;
	const hasIcon = !!icon;
	const iconOnly = hasIcon && !hasChildren;
	const scheme = resolveUiScheme({ tone, appearance });

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
				uiStyles.uiControl,
				styles.button,
				getUiToneClassName(scheme.tone),
				getUiAppearanceClassName(scheme.appearance),
				iconOnly && styles.iconOnly,
				className
			)}>
			<span className={cn(styles.buttonInner, hasIcon && styles.hasIcon)}>
				{icon && !iconEnd && (
					<span aria-hidden="true" className={styles.buttonIcon}>
						{icon}
					</span>
				)}

				{hasChildren && <>{children}</>}

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
		<FloatingPopover asChild placement="bottom" tooltip content={<>{title}</>}>
			{button}
		</FloatingPopover>
	);
}
