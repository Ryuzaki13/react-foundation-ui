import { type ReactNode, type Ref, useMemo } from "react";

import { type CollectionItem } from "@ryuzaki13/react-foundation-lib/odata-service";

import { type UiBaseProps } from "../../types";
import { adaptLegacyMultiSelectOptionDisableContext, adaptLegacyMultiSelectRenderContext } from "../lib/adaptLegacyMultiSelectContext";
import { resolveLegacyMultiSelectTextKey } from "../lib/resolveLegacyMultiSelectTextKey";

import {
	type MultiSelectItemState,
	type MultiSelectOptionContent,
	type MultiSelectOptionDisableContext,
	type MultiSelectRenderContext
} from "./legacyMultiSelectTypes";
import { OptionMultiSelectCore } from "./OptionMultiSelectCore";

type MultiSelectOptionalRenderer<TContext> = ((context: TContext) => ReactNode) | null | false;

interface MultiSelectRenderers {
	renderToken?: MultiSelectOptionalRenderer<MultiSelectRenderContext>;
	renderToolbar?: MultiSelectOptionalRenderer<MultiSelectRenderContext>;
	renderItem?: (item: CollectionItem, state: MultiSelectItemState) => MultiSelectOptionContent;
}

export interface MultiSelectProps<TOption extends Record<string, string> = CollectionItem>
	extends MultiSelectRenderers, UiBaseProps<TOption[]> {
	codeKey: string;
	textKey?: string;
	hideCode?: boolean;
	query?: string;
	defaultQuery?: string;
	highlightQuery?: string;
	onQuery?: (value: string) => void;
	defaultFilter?: boolean;
	items: TOption[];
	getOptionDisabled?: (item: TOption, context: MultiSelectOptionDisableContext) => boolean;
	onOpen?: () => void;
	onClose?: (value: TOption[]) => void;
	error?: string;
	isLoading?: boolean;
}

/**
 * Совместимый адаптер исходного codeKey/textKey API. Новым typed-consumers следует
 * использовать `OptionMultiSelect`, а OData-обёртки продолжают работать через
 * опубликованный контракт без изменения selection semantics.
 */
export function MultiSelect({
	ref,
	codeKey,
	textKey,
	hideCode,
	items,
	value,
	onChange,
	getOptionDisabled,
	onClose,
	renderToken,
	renderToolbar,
	renderItem,
	...props
}: MultiSelectProps & { ref?: Ref<HTMLInputElement> }) {
	const selectedItems = useMemo(() => value ?? [], [value]);
	const resolvedTextKey = useMemo(
		() => resolveLegacyMultiSelectTextKey([...selectedItems, ...items], codeKey, textKey),
		[codeKey, items, selectedItems, textKey]
	);
	const adaptedRenderToken =
		typeof renderToken === "function"
			? (context: Parameters<typeof adaptLegacyMultiSelectRenderContext>[0]) =>
					renderToken(adaptLegacyMultiSelectRenderContext(context))
			: renderToken;
	const adaptedRenderToolbar =
		typeof renderToolbar === "function"
			? (context: Parameters<typeof adaptLegacyMultiSelectRenderContext>[0]) =>
					renderToolbar(adaptLegacyMultiSelectRenderContext(context))
			: renderToolbar;

	return (
		<OptionMultiSelectCore
			{...props}
			ref={ref}
			preserveOptionArrayReference
			options={items}
			value={selectedItems}
			onChange={onChange}
			getOptionKey={(item) => item[codeKey]}
			getOptionLabel={(item) => item[resolvedTextKey] ?? item[codeKey] ?? ""}
			getOptionCode={hideCode ? undefined : (item) => item[codeKey] ?? ""}
			getOptionSearchText={(item) => Array.from(new Set([item[resolvedTextKey], item[codeKey], ...Object.values(item)]))}
			getOptionDisabled={
				getOptionDisabled
					? (item, context) => getOptionDisabled(item, adaptLegacyMultiSelectOptionDisableContext(context))
					: undefined
			}
			onClose={onClose}
			renderToken={adaptedRenderToken}
			renderToolbar={adaptedRenderToolbar}
			renderOption={
				renderItem
					? (item, state) => renderItem(item, state)
					: (item) => ({
							text: item[resolvedTextKey] ?? "",
							code: hideCode ? undefined : (item[codeKey] ?? "")
						})
			}
		/>
	);
}

MultiSelect.displayName = "MultiSelect";

export {
	type MultiSelectItemState,
	type MultiSelectOptionContent,
	type MultiSelectOptionDisableContext,
	type MultiSelectRenderContext
} from "./legacyMultiSelectTypes";
