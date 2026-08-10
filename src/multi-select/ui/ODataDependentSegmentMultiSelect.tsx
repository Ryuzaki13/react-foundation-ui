import { useCallback } from "react";

import { useODataDependentSelection } from "../../odata-dependent";

import { ODataMultiSelect } from "./ODataMultiSelect";

import type { ODataDependentSegmentControlProps } from "../../odata-dependent";

export type ODataDependentSegmentMultiSelectProps = ODataDependentSegmentControlProps;

export function ODataDependentSegmentMultiSelect(props: ODataDependentSegmentMultiSelectProps) {
	const { item, disabled, label, description, size, width = 15 } = props;
	const selection = useODataDependentSelection(props);
	const { updateSegment } = selection;
	const widthStyle = `calc(${width}em + var(--width-add))`;

	const handleSelectionChange = useCallback(
		(keys: string[]) => {
			updateSegment(item.id, keys);
		},
		[item.id, updateSegment]
	);

	return (
		<div style={{ maxWidth: widthStyle, minWidth: widthStyle }}>
			<ODataMultiSelect
				odata={item.odata}
				segment={item.segment}
				model={item.model}
				dependencies={selection.values}
				value={selection.values[item.id]}
				onChange={handleSelectionChange}
				disabled={disabled || selection.isSegmentDisabled(item.id)}
				label={label}
				description={description}
				size={size}
			/>
		</div>
	);
}
