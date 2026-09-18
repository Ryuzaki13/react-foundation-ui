import { type MultiSelectOptionGroup } from "../ui/multiSelectTypes";

export type MultiSelectOptionEntry<TOption> = Readonly<{
	option: TOption;
	index: number;
}>;

export type MultiSelectOptionSection<TOption> = Readonly<{
	group: MultiSelectOptionGroup | undefined;
	entries: readonly MultiSelectOptionEntry<TOption>[];
}>;

/**
 * Группирует только соседние опции и сохраняет их глобальные индексы. Благодаря
 * этому визуальные заголовки не попадают в active-index клавиатурной навигации.
 */
export function createMultiSelectOptionSections<TOption>(
	entries: readonly MultiSelectOptionEntry<TOption>[],
	getOptionGroup: (option: TOption) => MultiSelectOptionGroup | undefined
): readonly MultiSelectOptionSection<TOption>[] {
	const sections: Array<{
		group: MultiSelectOptionGroup | undefined;
		entries: MultiSelectOptionEntry<TOption>[];
	}> = [];

	for (const entry of entries) {
		const group = getOptionGroup(entry.option);
		const currentSection = sections.at(-1);
		const belongsToCurrentSection = currentSection?.group?.key === group?.key;

		if (currentSection && belongsToCurrentSection) {
			currentSection.entries.push(entry);
			continue;
		}

		sections.push({ group, entries: [entry] });
	}

	return sections;
}
