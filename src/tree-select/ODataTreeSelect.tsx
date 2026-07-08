import { ODataDependentBaseProps } from "@ryuzaki13/react-foundation-api/odata";

import { UiBaseProps } from "../types";

import { useODataTreeData } from "./model/useODataTreeData";
import { TreeSelect } from "./TreeSelect";
import { TreeSelectValue } from "./types";

export interface ODataTreeSelectProps
	extends
		Omit<ODataDependentBaseProps, "model" | "value" | "dependencies">,
		Omit<UiBaseProps<TreeSelectValue | undefined>, "placeholder"> {
	model?: ODataDependentBaseProps["model"];
	placeholder?: string;
	query?: string;
	defaultQuery?: string;
	onQuery?: (value: string) => void;
	clearable?: boolean;
}

export function ODataTreeSelect({
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
	model,
	clearable
}: ODataTreeSelectProps) {
	const treeData = useODataTreeData({
		odata,
		segments,
		model
	});

	return (
		<TreeSelect
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
			clearable={clearable}
		/>
	);
}
