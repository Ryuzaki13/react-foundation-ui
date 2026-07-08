import { ReactNode } from "react";

import { InputType } from "@ryuzaki13/react-foundation-lib/types";

import { extractPickerTextContent } from "../../picker";

export function getOptionSearchText<T extends InputType>({
	option,
	getOptionLabel,
	getOptionCode
}: {
	option: T;
	getOptionLabel: (option: T) => ReactNode;
	getOptionCode?: (option: T) => ReactNode;
}) {
	return [extractPickerTextContent(getOptionLabel(option)), extractPickerTextContent(getOptionCode?.(option))]
		.filter((part): part is string => Boolean(part))
		.join(" ")
		.toLowerCase();
}

/** Находит selected option по value и возвращает fallback, если значение еще не нормализовано. */
export function resolveSelectedOption<TOption extends { value: string }>(
	options: readonly TOption[],
	value: string,
	fallback: TOption
): TOption {
	return options.find((option) => option.value === value) ?? fallback;
}
