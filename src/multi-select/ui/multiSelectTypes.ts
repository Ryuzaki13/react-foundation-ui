import { type ReactNode } from "react";

import { type SelectOptionGroup, type SelectOptionKey } from "../../select/SelectOptionGroup";

/** Устойчивый строковый ключ опции, согласованный с identity-контрактом Select. */
export type MultiSelectOptionKey = SelectOptionKey;

/** Визуальная группа соседних опций; заголовок не участвует в keyboard navigation. */
export type MultiSelectOptionGroup = SelectOptionGroup;

export type MultiSelectOptionState = Readonly<{
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
export type MultiSelectOptionContent = Readonly<{
	text: string;
	code?: string;
}>;

export type MultiSelectRenderContext<TOption> = Readonly<{
	selectedOptions: readonly TOption[];
	committedSelectedOptions: readonly TOption[];
	availableOptions: readonly TOption[];
	query: string;
	open: boolean;
	clearSelection: () => void;
	selectAll: () => void;
	deselectAll: () => void;
}>;

export type MultiSelectOptionDisableContext<TOption> = Readonly<{
	selectedOptions: readonly TOption[];
	committedSelectedOptions: readonly TOption[];
	selectedKeys: ReadonlySet<MultiSelectOptionKey>;
	open: boolean;
}>;

type MultiSelectOptionalRenderer<TContext> = ((context: TContext) => ReactNode) | null | false;

export type MultiSelectRenderers<TOption> = Readonly<{
	renderToken?: MultiSelectOptionalRenderer<MultiSelectRenderContext<TOption>>;
	renderToolbar?: MultiSelectOptionalRenderer<MultiSelectRenderContext<TOption>>;
	renderOption?: (option: TOption, state: MultiSelectOptionState) => MultiSelectOptionContent;
}>;
