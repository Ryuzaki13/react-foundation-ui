import { useCallback, useState } from "react";

import { ODataMultiSelect } from "./ODataMultiSelect";

import type { ODataDependentSegmentItem } from "@ryuzaki13/react-foundation-api/odata";

interface ODataDependentSegmentMultiSelectProps {
	item: ODataDependentSegmentItem;
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

export const ODataDependentSegmentMultiSelect: React.FC<ODataDependentSegmentMultiSelectProps> = ({
	item,
	values,
	onChange,
	width = 15
}) => {
	const [internalSelectedValues, setInternalSelectedValues] = useState<Record<string, string[]>>({});
	const selectedValues = values ?? internalSelectedValues;
	const widthStyle = `calc(${width}em + var(--width-add))`;

	const handleSelectionChange = useCallback(
		(keys: string[]) => {
			const nextSelectedValues = {
				...selectedValues,
				[item.id]: keys
			};

			if (!values) {
				setInternalSelectedValues(nextSelectedValues);
			}

			onChange?.(nextSelectedValues);
		},
		[item.id, onChange, selectedValues, values]
	);

	return (
		<div style={{ maxWidth: widthStyle, minWidth: widthStyle }}>
			<ODataMultiSelect
				odata={item.odata}
				segment={item.segment}
				model={item.model}
				dependencies={selectedValues}
				value={selectedValues[item.id]}
				onChange={handleSelectionChange}
			/>
		</div>
	);
};
