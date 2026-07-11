import { ReactNode } from "react";

import { InputType } from "@ryuzaki13/react-foundation-lib/types";

import { extractPickerTextContent } from "../../picker";
import { type SelectOptionGroup } from "../SelectOptionGroup";

export function getOptionSearchText<T extends InputType>({
	option,
	getOptionLabel,
	getOptionCode,
	getOptionGroup
}: {
	option: T;
	getOptionLabel: (option: T) => ReactNode;
	getOptionCode?: (option: T) => ReactNode;
	getOptionGroup?: (option: T) => SelectOptionGroup | undefined;
}) {
	return [
		extractPickerTextContent(getOptionLabel(option)),
		extractPickerTextContent(getOptionCode?.(option)),
		extractPickerTextContent(getOptionGroup?.(option)?.label)
	]
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
