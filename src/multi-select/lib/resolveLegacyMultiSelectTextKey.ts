import { type CollectionItem } from "@ryuzaki13/react-foundation-lib/odata-service";

/** Сохраняет исходное правило вывода textKey для legacy code/text API. */
export function resolveLegacyMultiSelectTextKey(items: readonly CollectionItem[], codeKey: string, textKey?: string) {
	if (textKey) {
		return textKey;
	}

	const sampleItem = items[0];

	if (!sampleItem) {
		return codeKey;
	}

	return Object.keys(sampleItem).find((key) => key !== codeKey) ?? codeKey;
}
