import { type SelectOptionGroup } from "../SelectOptionGroup";

export type SelectOptionSectionItem<TOption> = {
	readonly option: TOption;
	readonly index: number;
};

export type SelectOptionSection<TOption> = {
	readonly group: SelectOptionGroup | undefined;
	readonly items: readonly SelectOptionSectionItem<TOption>[];
};

/**
 * Собирает соседние опции с одинаковым group key в секции, сохраняя исходные индексы для клавиатурной навигации listbox.
 */
export function createSelectOptionSections<TOption>(
	options: readonly TOption[],
	getOptionGroup: ((option: TOption) => SelectOptionGroup | undefined) | undefined
): readonly SelectOptionSection<TOption>[] {
	const sections: Array<{ group: SelectOptionGroup | undefined; items: SelectOptionSectionItem<TOption>[] }> = [];

	options.forEach((option, index) => {
		const group = getOptionGroup?.(option);
		const currentSection = sections.at(-1);
		const belongsToCurrentSection = currentSection?.group?.key === group?.key;

		if (currentSection && belongsToCurrentSection) {
			currentSection.items.push({ option, index });
			return;
		}

		sections.push({
			group,
			items: [{ option, index }]
		});
	});

	return sections;
}
