import { formatRussianPlural, type RussianPluralForms } from "@ryuzaki13/react-foundation-lib/formatters";

const MULTI_SELECT_OPTION_FORMS: RussianPluralForms = {
	one: "элемент",
	few: "элемента",
	many: "элементов"
};

/** Форматирует компактный token для множественного выбора. */
export function formatMultiSelectOptionCount(count: number): string {
	return formatRussianPlural(count, MULTI_SELECT_OPTION_FORMS);
}
