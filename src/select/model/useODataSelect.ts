import { useMemo } from "react";

import { ODataCollectionModel, ODataSingleSelectProps } from "@ryuzaki13/react-foundation-api/odata";
import { CollectionItem } from "@ryuzaki13/react-foundation-lib/odata";

import { useODataSelectBase } from "./useODataSelectBase";

interface UseODataSelectOptions extends Omit<ODataSingleSelectProps, "model"> {
	model: Required<ODataCollectionModel>;
	onChange: (value: string | undefined) => void;
}

export function useODataSelect({ odata, segment, model, value, dependencies, onChange }: UseODataSelectOptions) {
	const odataModel = useODataSelectBase({
		odata,
		segment,
		model,
		value: value ? [value] : [],
		dependencies
	});

	const selectedItem = odataModel.selectedItems[0];
	const options = useMemo(() => {
		if (!selectedItem) {
			return odataModel.filteredItems;
		}

		return [selectedItem, ...odataModel.filteredItems];
	}, [odataModel.filteredItems, selectedItem]);

	const handleChange = (item: CollectionItem | undefined) => {
		onChange(item?.[odataModel.selectionKey]);
	};

	return {
		...odataModel,
		selectedItem,
		options,
		handleChange
	};
}
