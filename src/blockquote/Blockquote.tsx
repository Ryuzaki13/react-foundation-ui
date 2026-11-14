import { type ComponentPropsWithRef } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { type UiTone } from "../types";
import { getUiToneClassName, resolveUiTone } from "../uiClasses";
import { UI_TONE_NEUTRAL } from "../uiSchemeConstants";

import styles from "./Blockquote.module.scss";

export type BlockquoteProps = ComponentPropsWithRef<"blockquote"> & {
	/** Семантический цвет цитаты; без тона сохраняется нейтральное оформление HTML-тега. */
	readonly tone?: UiTone;
};

/**
 * Цитата со статусным оформлением и нативными cite, ref и ARIA-атрибутами.
 * Тон меняет только оформление: озвучивание динамического сообщения задаёт потребитель через role/aria-live.
 */
export function Blockquote({ tone, className, ...htmlProps }: BlockquoteProps) {
	const resolvedTone = resolveUiTone(tone);

	return (
		<blockquote
			{...htmlProps}
			className={cn(
				styles.blockquote,
				getUiToneClassName(resolvedTone),
				resolvedTone === UI_TONE_NEUTRAL && styles.neutral,
				className
			)}
		/>
	);
}
