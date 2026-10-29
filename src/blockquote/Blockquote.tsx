import { type ComponentPropsWithRef } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { type UiTone } from "../types";
import { getUiToneClassName } from "../uiClasses";

import styles from "./Blockquote.module.scss";

export type BlockquoteProps = ComponentPropsWithRef<"blockquote"> & {
	/** Семантический цвет цитаты; без тона сохраняется нейтральное оформление HTML-тега. */
	readonly tone?: UiTone;
};

const NEUTRAL_TONE = "neutral" satisfies UiTone;

/**
 * Цитата со статусным оформлением и нативными cite, ref и ARIA-атрибутами.
 * Тон меняет только оформление: озвучивание динамического сообщения задаёт потребитель через role/aria-live.
 */
export function Blockquote({ tone = NEUTRAL_TONE, className, ...htmlProps }: BlockquoteProps) {
	return (
		<blockquote
			{...htmlProps}
			className={cn(styles.blockquote, getUiToneClassName(tone), tone === NEUTRAL_TONE && styles.neutral, className)}
		/>
	);
}
