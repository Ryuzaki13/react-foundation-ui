import { type CollectionItem } from "@ryuzaki13/react-foundation-lib/odata-service";

import { type DeprecatedMultiSelectOptionDisableContext, type DeprecatedMultiSelectRenderContext } from "../ui/legacyMultiSelectTypes";
import {
	type MultiSelectOptionDisableContext,
	type MultiSelectRenderContext as GenericMultiSelectRenderContext
} from "../ui/multiSelectTypes";

import { materializeMultiSelectOptions } from "./materializeMultiSelectOptions";

/** Преобразует generic render-context в опубликованный legacy-контракт. */
export function adaptLegacyMultiSelectRenderContext(
	context: GenericMultiSelectRenderContext<CollectionItem>
): DeprecatedMultiSelectRenderContext {
	return {
		selectedItems: materializeMultiSelectOptions(context.selectedOptions, true),
		committedSelectedItems: materializeMultiSelectOptions(context.committedSelectedOptions, true),
		availableItems: materializeMultiSelectOptions(context.availableOptions, true),
		query: context.query,
		open: context.open,
		clearSelection: context.clearSelection,
		selectAll: context.selectAll,
		deselectAll: context.deselectAll
	};
}

/** Преобразует generic disable-context без изменения identity выбранных элементов. */
export function adaptLegacyMultiSelectOptionDisableContext(
	context: MultiSelectOptionDisableContext<CollectionItem>
): DeprecatedMultiSelectOptionDisableContext {
	return {
		selectedItems: materializeMultiSelectOptions(context.selectedOptions, true),
		committedSelectedItems: materializeMultiSelectOptions(context.committedSelectedOptions, true),
		selectedKeys: context.selectedKeys,
		open: context.open
	};
}
