import { type MultiSelectOptionKey } from "../ui/multiSelectTypes";

/** Сравнивает наборы выбора по identity опций, не связывая их с object reference. */
export function areMultiSelectSelectionsEqual<TOption>(
	left: readonly TOption[],
	right: readonly TOption[],
	getOptionKey: (option: TOption) => MultiSelectOptionKey
): boolean {
	if (left.length !== right.length) {
		return false;
	}

	const rightKeys = new Set(right.map(getOptionKey));

	return left.every((option) => rightKeys.has(getOptionKey(option)));
}
