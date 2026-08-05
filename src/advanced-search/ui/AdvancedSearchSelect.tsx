import { useCallback, useState } from "react";

import { UiBaseProps } from "../../types";
import { SearchConfig, useAdvancedSearchInitialSelected } from "../model";

import { AdvancedSearchModal, type AdvancedSearchInitialSelection } from "./AdvancedSearchModal";
import { AdvancedSearchSelectUI } from "./AdvancedSearchSelectUI";

type AdvancedSearchSelectProps<T extends Record<string, string>> = UiBaseProps<string[]> & {
	title?: string;
	config: SearchConfig<T>;
};

const EMPTY_INITIAL_SELECTION: readonly never[] = [];

export function AdvancedSearchSelect<T extends Record<string, string>>({
	value = [],
	onChange,
	title,
	config,
	...props
}: AdvancedSearchSelectProps<T>) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const initialSelectionQuery = useAdvancedSearchInitialSelected(config, value);
	const selectedItems = initialSelectionQuery.data;
	const initialSelection: AdvancedSearchInitialSelection<T> =
		value.length === 0
			? { status: "ready", items: EMPTY_INITIAL_SELECTION }
			: selectedItems !== undefined
				? { status: "ready", items: selectedItems }
				: initialSelectionQuery.isError
					? { status: "error" }
					: { status: "loading" };

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
					title={title}
					config={config}
					onClose={handleClose}
					onItemsSelect={handleSelect}
					initialSelection={initialSelection}
				/>
			)}
		</>
	);
}
