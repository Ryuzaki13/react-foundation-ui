import { useCallback } from "react";

import { useODataDependentSelection } from "../odata-dependent";

import { ODataSelect } from "./ODataSelect";

import type { ODataDependentSegmentControlProps } from "../odata-dependent";

export type ODataDependentSegmentSelectProps = ODataDependentSegmentControlProps & {
	/** Показывает действие очистки выбранного значения. */
	clearable?: boolean;
};

/**
 * Адаптирует один развёрнутый зависимый OData-сегмент к single-select UI.
 * Общий снимок остаётся массивным, поэтому совместим с `dependencies` и
 * может совместно использоваться с segment-level MultiSelect-контролами.
 */
export function ODataDependentSegmentSelect(props: ODataDependentSegmentSelectProps) {
	const { item, disabled, label, description, size, width = 15, clearable } = props;
	const selection = useODataDependentSelection(props);
	const { updateSegment } = selection;
	const widthStyle = `calc(${width}em + var(--width-add))`;

	const handleSelectionChange = useCallback(
		(value: string | undefined) => {
			updateSegment(item.id, value === undefined ? [] : [value]);
		},
		[item.id, updateSegment]
	);

	return (
		<div style={{ maxWidth: widthStyle, minWidth: widthStyle }}>
			<ODataSelect
				odata={item.odata}
				segment={item.segment}
				model={item.model}
				dependencies={selection.values}
				value={selection.values[item.id]?.[0]}
				onChange={handleSelectionChange}
				disabled={disabled || selection.isSegmentDisabled(item.id)}
				label={label}
				description={description}
				size={size}
				clearable={clearable}
			/>
		</div>
	);
}
