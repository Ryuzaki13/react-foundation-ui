import { CollectionItem } from "@ryuzaki13/react-foundation-lib/odata";

import { MultiSelectOption } from "./MultiSelectOption";
import { MultiSelectOptionsToolbar } from "./MultiSelectOptionsToolbar";
import { MultiSelectToken } from "./MultiSelectToken";

import type { MultiSelectItemState, MultiSelectRenderContext } from "./MultiSelect";

interface MultiSelectRendererConfig {
	codeKey: string;
	textKey?: string;
	hideCode?: boolean;
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
		return `${items.length} элемент${items.length > 5 ? "ов" : "а"})`;
	}

	const resolvedTextKey = resolveMultiSelectTextKey(items, codeKey, textKey);
	return items[0]?.[resolvedTextKey] ?? items[0]?.[codeKey];
}

export function createDefaultMultiSelectTokenRenderer(config: MultiSelectRendererConfig) {
	return function renderDefaultToken(context: MultiSelectRenderContext) {
		return <MultiSelectToken value={getDefaultMultiSelectTokenValue(context.selectedItems, config.codeKey, config.textKey)} />;
	};
}

export function renderDefaultMultiSelectToolbar(context: MultiSelectRenderContext) {
	return <MultiSelectOptionsToolbar onSelectAll={context.selectAll} onDeselectAll={context.deselectAll} />;
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
