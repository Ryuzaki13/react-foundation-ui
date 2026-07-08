import { ODataCollectionModel, ODataSelectBaseProps } from "@ryuzaki13/react-foundation-api/odata";
import { CollectionItem } from "@ryuzaki13/react-foundation-lib/odata";

import { mapSelectedItemsToValues, useODataSelectBase } from "../../select/model/useODataSelectBase";

interface UseODataMultiSelectOptions extends Omit<ODataSelectBaseProps, "model"> {
	model: Required<ODataCollectionModel>;
	onChange: (keys: string[]) => void;
}

export function useODataMultiSelect({ odata, segment, model, value, dependencies, onChange }: UseODataMultiSelectOptions) {
	const odataModel = useODataSelectBase({
		odata,
		segment,
		model,
		value,
		dependencies
	});

	const handleChange = (items: CollectionItem[]) => {
		onChange(mapSelectedItemsToValues(items, odataModel.selectionKey));
	};

	return {
		...odataModel,
		handleChange
	};
}
