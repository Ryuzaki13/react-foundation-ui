import { type Ref } from "react";

import { type UiBaseProps } from "../../types";

import { OptionMultiSelectCore } from "./OptionMultiSelectCore";
import {
	type OptionMultiSelectOptionDisableContext,
	type OptionMultiSelectOptionGroup,
	type OptionMultiSelectOptionKey,
	type OptionMultiSelectRenderers
} from "./optionMultiSelectTypes";

/**
 * Типобезопасный контракт множественного выбора. Опция остаётся в исходной
 * domain/view-model форме, а UI получает только необходимые selector-функции.
 */
export type OptionMultiSelectProps<TOption> = OptionMultiSelectRenderers<TOption> &
	Omit<UiBaseProps<TOption[], readonly TOption[]>, "onChange"> &
	Readonly<{
		ref?: Ref<HTMLInputElement>;
		options: readonly TOption[];
		onChange: (value: TOption[]) => void;
		getOptionKey: (option: TOption) => OptionMultiSelectOptionKey;
		getOptionLabel: (option: TOption) => string;
		getOptionCode?: (option: TOption) => string | undefined;
		getOptionGroup?: (option: TOption) => OptionMultiSelectOptionGroup | undefined;
		getOptionSearchText?: (option: TOption) => string | readonly string[];
		getOptionDisabled?: (option: TOption, context: OptionMultiSelectOptionDisableContext<TOption>) => boolean;
		query?: string;
		defaultQuery?: string;
		highlightQuery?: string;
		onQuery?: (value: string) => void;
		defaultFilter?: boolean;
		onOpen?: () => void;
		onClose?: (value: TOption[]) => void;
		error?: string;
		isLoading?: boolean;
	}>;

/** Множественный выбор для произвольной типизированной коллекции опций. */
export function OptionMultiSelect<TOption>(props: OptionMultiSelectProps<TOption>) {
	return <OptionMultiSelectCore {...props} />;
}
