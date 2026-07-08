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

export type UiTone = "neutral" | "error" | "warning" | "success" | "info";

export type UiAppearance = "solid" | "outline" | "ghost" | "transparent";

export type UiVariant =
	| "transparent"
	| "ghost"
	| "neutral"
	| "error"
	| "warning"
	| "success"
	| "info"
	| "neutralOutline"
	| "errorOutline"
	| "warningOutline"
	| "successOutline"
	| "infoOutline";
