import { ODataDependentBaseProps } from "@ryuzaki13/react-foundation-api/odata";

import { UiBaseProps } from "../types";

import { useODataTreeData } from "./model/useODataTreeData";
import { TreeMultiSelect } from "./TreeMultiSelect";
import { TreeMultiSelectValue } from "./types";

export interface ODataTreeMultiSelectProps
	extends Omit<ODataDependentBaseProps, "model" | "value" | "dependencies">, Omit<UiBaseProps<TreeMultiSelectValue>, "placeholder"> {
	model?: ODataDependentBaseProps["model"];
	placeholder?: string;
	query?: string;
	defaultQuery?: string;
	onQuery?: (value: string) => void;
}

export function ODataTreeMultiSelect({
	label,
	description,
	disabled,
	size,
	placeholder,
	query,
	defaultQuery,
	onQuery,
	value,
	onChange,
	odata,
	segments,
	model
}: ODataTreeMultiSelectProps) {
	const treeData = useODataTreeData({
		odata,
		segments,
		model
	});

	return (
		<TreeMultiSelect
			label={label}
			description={description}
			disabled={disabled || treeData.isLoading}
			size={size}
			placeholder={placeholder ?? treeData.placeholder}
			nodes={treeData.nodes}
			value={value}
			onChange={onChange}
			query={query}
			defaultQuery={defaultQuery}
			onQuery={onQuery}
			isLoading={treeData.isLoading}
			error={treeData.isError ? "Ошибка загрузки" : undefined}
		/>
	);
}
