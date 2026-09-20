import { type Ref } from "react";

import { type UiBaseProps } from "../../types";

import { MultiSelectCore } from "./MultiSelectCore";
import {
	type MultiSelectOptionDisableContext,
	type MultiSelectOptionGroup,
	type MultiSelectOptionKey,
	type MultiSelectRenderers
} from "./multiSelectTypes";

/**
 * Типобезопасный контракт множественного выбора. Опция остаётся в исходной
 * domain/view-model форме, а UI получает только необходимые selector-функции.
 */
export type MultiSelectProps<TOption> = MultiSelectRenderers<TOption> &
	Omit<UiBaseProps<TOption[], readonly TOption[]>, "onChange"> &
	Readonly<{
		ref?: Ref<HTMLInputElement>;
		options: readonly TOption[];
		onChange: (value: TOption[]) => void;
		getOptionKey: (option: TOption) => MultiSelectOptionKey;
		getOptionLabel: (option: TOption) => string;
		getOptionCode?: (option: TOption) => string | undefined;
		getOptionGroup?: (option: TOption) => MultiSelectOptionGroup | undefined;
		getOptionSearchText?: (option: TOption) => string | readonly string[];
		getOptionDisabled?: (option: TOption, context: MultiSelectOptionDisableContext<TOption>) => boolean;
		query?: string;
		defaultQuery?: string;
		highlightQuery?: string;
		onQuery?: (value: string) => void;
		defaultFilter?: boolean;
		onOpen?: () => void;
		onClose?: (value: TOption[]) => void;
		error?: string;
		/** Ошибка выбранного значения; error сообщает о сбое загрузки опций в popup. */
		fieldError?: string;
		required?: boolean;
		isLoading?: boolean;
	}>;

/** Множественный выбор для произвольной типизированной коллекции опций. */
export function MultiSelect<TOption>(props: MultiSelectProps<TOption>) {
	return <MultiSelectCore {...props} />;
}
