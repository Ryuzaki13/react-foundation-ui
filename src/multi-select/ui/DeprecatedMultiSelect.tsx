import { type ReactNode, type Ref, useMemo } from "react";

import { type CollectionItem } from "@ryuzaki13/react-foundation-lib/odata-service";

import { type UiBaseProps } from "../../types";
import { adaptLegacyMultiSelectOptionDisableContext, adaptLegacyMultiSelectRenderContext } from "../lib/adaptLegacyMultiSelectContext";
import { resolveLegacyMultiSelectTextKey } from "../lib/resolveLegacyMultiSelectTextKey";

import {
	type DeprecatedMultiSelectItemState,
	type DeprecatedMultiSelectOptionContent,
	type DeprecatedMultiSelectOptionDisableContext,
	type DeprecatedMultiSelectRenderContext
} from "./legacyMultiSelectTypes";
import { MultiSelectCore } from "./MultiSelectCore";

type MultiSelectOptionalRenderer<TContext> = ((context: TContext) => ReactNode) | null | false;

interface MultiSelectRenderers {
	renderToken?: MultiSelectOptionalRenderer<DeprecatedMultiSelectRenderContext>;
	renderToolbar?: MultiSelectOptionalRenderer<DeprecatedMultiSelectRenderContext>;
	renderItem?: (item: CollectionItem, state: DeprecatedMultiSelectItemState) => DeprecatedMultiSelectOptionContent;
}

/** Контракт устаревшего codeKey/textKey-компонента. */
export interface DeprecatedMultiSelectProps<TOption extends Record<string, string> = CollectionItem>
	extends MultiSelectRenderers, UiBaseProps<TOption[]> {
	ref?: Ref<HTMLInputElement>;
	codeKey: string;
	textKey?: string;
	hideCode?: boolean;
	query?: string;
	defaultQuery?: string;
	highlightQuery?: string;
	onQuery?: (value: string) => void;
	defaultFilter?: boolean;
	items: TOption[];
	getOptionDisabled?: (item: TOption, context: DeprecatedMultiSelectOptionDisableContext) => boolean;
	onOpen?: () => void;
	onClose?: (value: TOption[]) => void;
	error?: string;
	isLoading?: boolean;
}

/**
 * Устаревший адаптер OData-подобных `codeKey`/`textKey` коллекций. Компонент
 * сохраняет прежнюю OData-семантику, пока consumers переходят на selector API
 * канонического `MultiSelect`.
 *
 * @deprecated Используйте `MultiSelect` с selector-функциями.
 */
export function DeprecatedMultiSelect<TOption extends Record<string, string> = CollectionItem>({
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
}: DeprecatedMultiSelectProps<TOption>) {
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
		<MultiSelectCore
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

DeprecatedMultiSelect.displayName = "DeprecatedMultiSelect";

export {
	type DeprecatedMultiSelectItemState,
	type DeprecatedMultiSelectOptionContent,
	type DeprecatedMultiSelectOptionDisableContext,
	type DeprecatedMultiSelectRenderContext
} from "./legacyMultiSelectTypes";
