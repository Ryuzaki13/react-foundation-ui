import { type ReactNode } from "react";

import { extractPickerTextContent } from "./model/extractPickerTextContent";

type PickerPlaceholderParams = {
	placeholder?: string;
	label?: ReactNode;
	optionCount: number;
	showOptionCount?: boolean;
	fallback?: string;
};

/**
 * Формирует единый текст placeholder для picker-компонентов и всегда показывает
 * актуальное количество доступных вариантов.
 */
export function getPickerPlaceholder({
	placeholder,
	label,
	optionCount,
	showOptionCount = false,
	fallback = "Выберите значение"
}: PickerPlaceholderParams) {
	const labelText = extractPickerTextContent(label);
	const text = placeholder ?? labelText ?? fallback;

	return showOptionCount ? `${text} <${optionCount}>` : text;
}
