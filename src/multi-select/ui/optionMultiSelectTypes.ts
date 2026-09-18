import { type ReactNode } from "react";

import { type SelectOptionGroup, type SelectOptionKey } from "../../select/SelectOptionGroup";

/** Устойчивый строковый ключ опции, согласованный с identity-контрактом Select. */
export type OptionMultiSelectOptionKey = SelectOptionKey;

/** Визуальная группа соседних опций; заголовок не участвует в keyboard navigation. */
export type OptionMultiSelectOptionGroup = SelectOptionGroup;

export type OptionMultiSelectOptionState = Readonly<{
	selected: boolean;
	active: boolean;
	disabled: boolean;
	query: string;
	highlightQuery: string;
}>;

/**
 * Структурированное содержимое опции. Компонент сохраняет общую интерактивную
 * оболочку и accessibility-контракт, а consumer управляет только текстом и кодом.
 */
export type OptionMultiSelectOptionContent = Readonly<{
	text: string;
	code?: string;
}>;

export type OptionMultiSelectRenderContext<TOption> = Readonly<{
	selectedOptions: readonly TOption[];
	committedSelectedOptions: readonly TOption[];
	availableOptions: readonly TOption[];
	query: string;
	open: boolean;
	clearSelection: () => void;
	selectAll: () => void;
	deselectAll: () => void;
}>;

export type OptionMultiSelectOptionDisableContext<TOption> = Readonly<{
	selectedOptions: readonly TOption[];
	committedSelectedOptions: readonly TOption[];
	selectedKeys: ReadonlySet<OptionMultiSelectOptionKey>;
	open: boolean;
}>;

type OptionMultiSelectOptionalRenderer<TContext> = ((context: TContext) => ReactNode) | null | false;

export type OptionMultiSelectRenderers<TOption> = Readonly<{
	renderToken?: OptionMultiSelectOptionalRenderer<OptionMultiSelectRenderContext<TOption>>;
	renderToolbar?: OptionMultiSelectOptionalRenderer<OptionMultiSelectRenderContext<TOption>>;
	renderOption?: (option: TOption, state: OptionMultiSelectOptionState) => OptionMultiSelectOptionContent;
}>;
