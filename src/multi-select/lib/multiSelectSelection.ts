import { type OptionMultiSelectOptionKey } from "../ui/optionMultiSelectTypes";

/** Сравнивает наборы выбора по identity опций, не связывая их с object reference. */
export function areMultiSelectSelectionsEqual<TOption>(
	left: readonly TOption[],
	right: readonly TOption[],
	getOptionKey: (option: TOption) => OptionMultiSelectOptionKey
): boolean {
	if (left.length !== right.length) {
		return false;
	}

	const rightKeys = new Set(right.map(getOptionKey));

	return left.every((option) => rightKeys.has(getOptionKey(option)));
}
