import React from "react";

import { ODataSelectBaseProps, useODataCollectionModel } from "@ryuzaki13/react-foundation-api/odata";

import { UiBaseProps } from "../../types";
import { useODataMultiSelect } from "../model/useODataMultiSelect";

import { MultiSelect } from "./MultiSelect";

type ODataMultiSelectProps = ODataSelectBaseProps & Omit<UiBaseProps<string[]>, "placeholder"> & {};

export const ODataMultiSelect: React.FC<ODataMultiSelectProps> = ({
	odata,
	segment,
	model: initialModel,
	label,
	description,
	disabled,
	value,
	dependencies,
	onChange,
	size
}) => {
	const model = useODataCollectionModel(initialModel);
	const odataModel = useODataMultiSelect({
		odata,
		segment,
		model,
		value,
		dependencies,
		onChange
	});

	return (
		<MultiSelect
			label={label}
			description={description}
			size={size}
			codeKey={odataModel.codeKey}
			textKey={odataModel.textKey}
			hideCode={segment.hideCode ?? odata.hideCode}
			items={odataModel.filteredItems}
			value={odataModel.selectedItems}
			onChange={odataModel.handleChange}
			onQuery={odataModel.setQuery}
			query={odataModel.query}
			defaultFilter={false}
			highlightQuery={odataModel.debouncedQuery}
			disabled={disabled || odataModel.isLoading}
			placeholder={odataModel.placeholder}
			error={odataModel.isError ? "Ошибка загрузки" : undefined}
		/>
	);
};
