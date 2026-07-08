import { TreeMultiSelectValue, TreeSelectValue } from "./types";

export function treeSelectValueToSelectedFilters(value: TreeSelectValue | undefined): TreeMultiSelectValue {
	if (!value) {
		return {};
	}

	return {
		[value.codeKey]: [value.value]
	};
}
