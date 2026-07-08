import React from "react";

import { ODataSingleSelectProps, useODataCollectionModel } from "@ryuzaki13/react-foundation-api/odata";
import { CollectionItem } from "@ryuzaki13/react-foundation-lib/odata";

import { InputUILoading } from "../input";
import { UiBaseProps } from "../types";

import { useODataSelect } from "./model/useODataSelect";
import { Select } from "./Select";
import { SelectOptionContent } from "./SelectOptionContent";

type ODataSelectProps = Omit<ODataSingleSelectProps, "value"> & UiBaseProps<string | undefined> & { clearable?: boolean };

function getODataOptionTextKey(item: CollectionItem | undefined, textKey: string, codeKey: string) {
	if (!item) {
		return textKey || codeKey;
	}

	return textKey || Object.keys(item).find((key) => key !== codeKey) || codeKey;
}

export const ODataSelect: React.FC<ODataSelectProps> = ({
	odata,
	segment,
	model: initialModel,
	size,
	label,
	description,
	disabled,
	value,
	dependencies,
	onChange,
	clearable
}) => {
	const model = useODataCollectionModel(initialModel);
	const odataModel = useODataSelect({
		odata,
		segment,
		model,
		value,
		dependencies,
		onChange
	});

	if (odataModel.isLoading) {
		return <InputUILoading size={size} label={label} description={description} />;
	}

	const hideCode = segment.hideCode ?? odata.hideCode;
	const resolvedTextKey = getODataOptionTextKey(odataModel.selectedItem ?? odataModel.options[0], odataModel.textKey, odataModel.codeKey);

	return (
		<Select<CollectionItem, CollectionItem | undefined>
			size={size}
			label={label}
			description={description}
			options={odataModel.options}
			value={odataModel.selectedItem}
			onChange={odataModel.handleChange}
			getOptionKey={(item) => item[odataModel.codeKey]}
			getOptionLabel={(item) => item[resolvedTextKey]}
			getOptionCode={hideCode ? undefined : (item) => item[odataModel.codeKey]}
			getOptionAriaLabel={(item) =>
				hideCode || item[resolvedTextKey] === item[odataModel.codeKey]
					? String(item[resolvedTextKey])
					: `${item[resolvedTextKey]} ${item[odataModel.codeKey]}`
			}
			renderValue={(item) => (
				<SelectOptionContent label={item[resolvedTextKey]} code={hideCode ? undefined : item[odataModel.codeKey]} />
			)}
			renderOption={(item) => (
				<SelectOptionContent
					label={item[resolvedTextKey]}
					code={hideCode ? undefined : item[odataModel.codeKey]}
					highlight={odataModel.debouncedQuery}
				/>
			)}
			searchable
			query={odataModel.query}
			onQuery={odataModel.setQuery}
			defaultFilter={false}
			disabled={disabled || odataModel.isLoading}
			placeholder={odataModel.placeholder}
			loadingState="Загрузка..."
			errorState={odataModel.isError ? "Ошибка загрузки" : undefined}
			emptyState={!odataModel.isLoading && !odataModel.isError ? "Нет данных" : undefined}
			clearable={clearable}
		/>
	);
};
