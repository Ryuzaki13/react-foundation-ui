import { formatRussianPlural, type RussianPluralForms } from "@ryuzaki13/react-foundation-lib/formatters";
import { CollectionItem } from "@ryuzaki13/react-foundation-lib/odata";

import { type MultiSelectItemState, type MultiSelectRenderContext } from "./MultiSelect";
import { MultiSelectOption } from "./MultiSelectOption";

interface MultiSelectRendererConfig {
	codeKey: string;
	textKey?: string;
	hideCode?: boolean;
}

const ELEMENT_FORMS: RussianPluralForms = {
	one: "элемент",
	few: "элемента",
	many: "элементов"
};

export function formatOptionCount(count: number) {
	return formatRussianPlural(count, ELEMENT_FORMS);
}

export function resolveMultiSelectTextKey(items: CollectionItem[], codeKey: string, textKey?: string) {
	if (textKey) {
		return textKey;
	}

	const sampleItem = items[0];

	if (!sampleItem) {
		return codeKey;
	}

	return Object.keys(sampleItem).find((key) => key !== codeKey) ?? codeKey;
}

export function getDefaultMultiSelectTokenValue(items: CollectionItem[], codeKey: string, textKey?: string) {
	if (items.length === 0) {
		return undefined;
	}

	if (items.length > 1) {
		return formatOptionCount(items.length);
	}

	const resolvedTextKey = resolveMultiSelectTextKey(items, codeKey, textKey);
	return items[0]?.[resolvedTextKey] ?? items[0]?.[codeKey];
}

export function createDefaultMultiSelectTokenRenderer(config: MultiSelectRendererConfig) {
	return function renderDefaultToken(context: MultiSelectRenderContext) {
		return getDefaultMultiSelectTokenValue(context.selectedItems, config.codeKey, config.textKey);
	};
}

export function createDefaultMultiSelectItemRenderer(config: MultiSelectRendererConfig) {
	return function renderDefaultItem(item: CollectionItem, state: MultiSelectItemState) {
		return (
			<MultiSelectOption
				item={item}
				selected={state.selected}
				highlight={state.highlightQuery}
				textKey={resolveMultiSelectTextKey([item], config.codeKey, config.textKey)}
				codeKey={config.hideCode ? undefined : config.codeKey}
			/>
		);
	};
}
