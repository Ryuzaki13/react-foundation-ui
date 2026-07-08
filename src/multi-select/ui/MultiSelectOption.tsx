import { CollectionItem } from "@ryuzaki13/react-foundation-lib/odata";

import { SelectOptionContent } from "../../select/SelectOptionContent";

interface MultiSelectOptionProps {
	item: CollectionItem;
	textKey: string;
	codeKey?: string;
	highlight?: string;
	selected: boolean;
}

/**
 * Отдельная опция внутри `MultiSelect`. Отрисовывает состояние выбора и подсветку текста для найденных совпадений.
 */
export function MultiSelectOption({ item, textKey, codeKey, highlight }: MultiSelectOptionProps) {
	return <SelectOptionContent label={item[textKey]} code={codeKey && item[codeKey]} highlight={highlight} />;
}
