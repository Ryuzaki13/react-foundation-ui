import { useCallback, useState } from "react";

import { UiBaseProps } from "../../types";
import { SearchConfig, useAdvancedSearchInitialSelected } from "../model";

import { AdvancedSearchModal } from "./AdvancedSearchModal";
import { AdvancedSearchSelectUI } from "./AdvancedSearchSelectUI";

type AdvancedSearchSelectProps<T extends Record<string, string>> = UiBaseProps<string[]> & {
	config: SearchConfig<T>;
};

export function AdvancedSearchSelect<T extends Record<string, string>>({
	value = [],
	onChange,
	config,
	...props
}: AdvancedSearchSelectProps<T>) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const { data: selectedItems } = useAdvancedSearchInitialSelected(config, value);

	const handleOpen = useCallback(() => setIsModalOpen(true), []);
	const handleClose = useCallback(() => setIsModalOpen(false), []);
	const handleRemove = useCallback(() => onChange([]), [onChange]);
	const handleSelect = useCallback(
		(items: T[]) => onChange(items.map((item) => String(item[config.leadingKey]))),
		[config.leadingKey, onChange]
	);
	const getDisplayText = useCallback(
		(items: T[] | undefined) => {
			if (!items?.length) return;
			if (items.length > 1) return `Выбрано ${items.length} элем.`;
			return `${(config.leadingText && items[0][config.leadingText]) || items[0][config.leadingKey]}`;
		},
		[config.leadingKey, config.leadingText]
	);

	return (
		<>
			<AdvancedSearchSelectUI {...props} token={getDisplayText(selectedItems)} onOpen={handleOpen} onClear={handleRemove} />

			{isModalOpen && (
				<AdvancedSearchModal
					config={config}
					onClose={handleClose}
					onItemsSelect={handleSelect}
					initialSelectedItems={selectedItems}
				/>
			)}
		</>
	);
}
