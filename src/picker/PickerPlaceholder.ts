import { type ReactNode } from "react";

import { extractPickerTextContent } from "./model/extractPickerTextContent";

type PickerPlaceholderParams = {
	placeholder?: string;
	label?: ReactNode;
	optionCount: number;
	fallback?: string;
};

/**
 * Формирует единый текст placeholder для picker-компонентов и всегда показывает
 * актуальное количество доступных вариантов.
 */
export function getPickerPlaceholder({ placeholder, label, optionCount, fallback = "Выберите значение" }: PickerPlaceholderParams) {
	const labelText = extractPickerTextContent(label);
	const text = placeholder ?? labelText ?? fallback;

	return `${text} <${optionCount}>`;
}
