import { ODataSelectBaseProps, useODataCollectionModel } from "@ryuzaki13/react-foundation-api/odata";

import { UiBaseProps } from "../../types";
import { useODataMultiSelect } from "../model/useODataMultiSelect";

import { DeprecatedMultiSelect } from "./DeprecatedMultiSelect";

type ODataMultiSelectProps = ODataSelectBaseProps &
	Omit<UiBaseProps<string[]>, "placeholder"> & { required?: boolean; fieldError?: string };

export function ODataMultiSelect({
	odata,
	segment,
	model: initialModel,
	label,
	description,
	disabled,
	required,
	fieldError,
	value,
	dependencies,
	onChange,
	size
}: ODataMultiSelectProps) {
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
		<DeprecatedMultiSelect
			label={label}
			description={description}
			required={required}
			fieldError={fieldError}
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
			isLoading={odataModel.isLoading}
			disabled={disabled}
			placeholder={odataModel.placeholder}
			error={odataModel.isError ? "Ошибка загрузки" : undefined}
		/>
	);
}
