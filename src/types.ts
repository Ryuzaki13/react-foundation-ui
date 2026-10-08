import type { ReactNode } from "react";

export type UiSize = "xs" | "sm" | "md" | "lg" | "xl";

export type ChangeHandler<T> = (value: T) => void;

export type UiBaseProps<C, V = C> = {
	label?: ReactNode;
	description?: string;
	placeholder?: string;
	disabled?: boolean;

	size?: UiSize;

	/**
	 * Если начальное состояние может быть `null | undefined`
	 * значит `onChange` тоже должен ументь сбрасывать.
	 * Поэтому такой контрол явно должен передавать `UiBaseProps<AnyType | undefined>`
	 */
	value: V;
	onChange: ChangeHandler<C>;
};

/**
 * Цветовой тон задаёт смысл цвета, а `UiAppearance` — способ оформления поверхности.
 * `accent` задаёт выразительное оформление без семантики выбора; статусные тоны обозначают смысл сообщения или действия.
 */
export type UiTone = "accent" | "neutral" | "error" | "warning" | "success" | "info";

export type UiAppearance = "solid" | "outline" | "ghost";

export type UiPanelTone = "surface" | "elevated" | "sunken";
