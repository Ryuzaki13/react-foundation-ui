import { flattenODataDependentServices, type ODataDependentBaseProps } from "@ryuzaki13/react-foundation-api/odata";

import { useODataDependentSelection } from "../../odata-dependent";
import { ODATA_SELECTION_SEQUENTIAL } from "../../odata-dependent/model/odataDependentSelectionModes";
import { DEFAULT_ODATA_DEPENDENT_SELECT_WIDTH_EM } from "../../select/lib/odataDependentSelectDimensions";

import { ODataDependentSegmentMultiSelect } from "./ODataDependentSegmentMultiSelect";

import type { UseODataDependentSelectionOptions } from "../../odata-dependent";

export type ODataDependentMultiSelectProps = Omit<ODataDependentBaseProps, "dependencies" | "value"> &
	UseODataDependentSelectionOptions & {
		/**
		 * Ширина одного элемента в `em` единицах.
		 *
		 * @default 15
		 */
		width?: number;
	};

export function ODataDependentMultiSelect(props: ODataDependentMultiSelectProps) {
	const {
		width = DEFAULT_ODATA_DEPENDENT_SELECT_WIDTH_EM,
		odata,
		segments,
		model,
		values,
		defaultValues,
		onChange,
		selectionMode,
		segmentOrder
	} = props;
	const selection = useODataDependentSelection({ values, defaultValues, onChange });
	const segmentSelectionProps: UseODataDependentSelectionOptions =
		selectionMode === ODATA_SELECTION_SEQUENTIAL
			? { selectionMode: ODATA_SELECTION_SEQUENTIAL, segmentOrder }
			: { selectionMode, segmentOrder };
	const items = flattenODataDependentServices([
		{
			odata,
			segments,
			model
		}
	]);

	return items.map((item) => (
		<ODataDependentSegmentMultiSelect
			key={item.id}
			item={item}
			values={selection.values}
			onChange={selection.updateValues}
			{...segmentSelectionProps}
			width={width}
		/>
	));
}
