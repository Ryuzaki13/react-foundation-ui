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
 * Цветовой тон задаёт смысл цвета, а `UiAppearance` — визуальную иерархию действия.
 * `brand` предназначен для фирменных действий и не заменяет статусные тоны.
 */
export type UiTone = "neutral" | "brand" | "error" | "warning" | "success" | "info";

export type UiAppearance = "solid" | "outline" | "ghost" | "transparent";

export type UiVariant =
	| "transparent"
	| "ghost"
	| "neutral"
	| "brand"
	| "error"
	| "warning"
	| "success"
	| "info"
	| "neutralOutline"
	| "brandOutline"
	| "errorOutline"
	| "warningOutline"
	| "successOutline"
	| "infoOutline";
