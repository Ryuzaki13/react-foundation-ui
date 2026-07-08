import { useState } from "react";

import { flattenODataDependentServices, ODataDependentBaseProps } from "@ryuzaki13/react-foundation-api/odata";

import { ODataDependentSegmentMultiSelect } from "./ODataDependentSegmentMultiSelect";

interface ODataDependentMultiSelectProps extends ODataDependentBaseProps {
	/**
	 * Выбранные значения (управляемый компонент)
	 */
	values?: Record<string, string[]>;

	/**
	 * Обработчик изменения выбранных значений
	 */
	onChange?: (selected: Record<string, string[]>) => void;

	/**
	 * Ширина одного элемента в `em` единицах.
	 *
	 * @default 15
	 */
	width?: number;
}

export const ODataDependentMultiSelect: React.FC<ODataDependentMultiSelectProps> = ({
	width = 15,
	odata,
	segments,
	model,
	values,
	onChange
}) => {
	const [internalSelectedValues, setInternalSelectedValues] = useState<Record<string, string[]>>({});
	const selectedValues = values ?? internalSelectedValues;
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
			values={selectedValues}
			onChange={(nextSelectedValues) => {
				if (!values) {
					setInternalSelectedValues(nextSelectedValues);
				}

				onChange?.(nextSelectedValues);
			}}
			width={width}
		/>
	));
};
