import { type CollectionItem } from "@ryuzaki13/react-foundation-lib/odata-service";

import { type MultiSelectOptionDisableContext, type MultiSelectRenderContext } from "../ui/legacyMultiSelectTypes";
import { type OptionMultiSelectOptionDisableContext, type OptionMultiSelectRenderContext } from "../ui/optionMultiSelectTypes";

import { materializeMultiSelectOptions } from "./materializeMultiSelectOptions";

/** Преобразует generic render-context в опубликованный legacy-контракт. */
export function adaptLegacyMultiSelectRenderContext(context: OptionMultiSelectRenderContext<CollectionItem>): MultiSelectRenderContext {
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
	context: OptionMultiSelectOptionDisableContext<CollectionItem>
): MultiSelectOptionDisableContext {
	return {
		selectedItems: materializeMultiSelectOptions(context.selectedOptions, true),
		committedSelectedItems: materializeMultiSelectOptions(context.committedSelectedOptions, true),
		selectedKeys: context.selectedKeys,
		open: context.open
	};
}
