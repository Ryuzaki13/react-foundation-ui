import type { ReactNode } from "react";

import {
	type UI_APPEARANCE_GHOST,
	type UI_APPEARANCE_OUTLINE,
	type UI_APPEARANCE_SOLID,
	type UI_PANEL_TONE_ELEVATED,
	type UI_PANEL_TONE_SUNKEN,
	type UI_PANEL_TONE_SURFACE,
	type UI_TONE_ACCENT,
	type UI_TONE_ERROR,
	type UI_TONE_INFO,
	type UI_TONE_NEUTRAL,
	type UI_TONE_SUCCESS,
	type UI_TONE_WARNING
} from "./uiSchemeConstants";

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
export type UiTone =
	| typeof UI_TONE_ACCENT
	| typeof UI_TONE_NEUTRAL
	| typeof UI_TONE_ERROR
	| typeof UI_TONE_WARNING
	| typeof UI_TONE_SUCCESS
	| typeof UI_TONE_INFO;

/**
 * `ghost` окрашивает содержимое по `tone`, оставляя фон и рамку прозрачными
 * в обычном состоянии; нейтральный вариант использует вторичный текст темы.
 */
export type UiAppearance = typeof UI_APPEARANCE_SOLID | typeof UI_APPEARANCE_OUTLINE | typeof UI_APPEARANCE_GHOST;

export type UiPanelTone = typeof UI_PANEL_TONE_SURFACE | typeof UI_PANEL_TONE_ELEVATED | typeof UI_PANEL_TONE_SUNKEN;
