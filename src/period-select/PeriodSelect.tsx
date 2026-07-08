import { useEffect, useEffectEvent, useMemo } from "react";

import { PresetSelect } from "../preset-select";

import { createPeriodSelectOptions, isPeriodSelectOptionDisabled, resolvePeriodSelectAvailableValue, type PeriodSelectOption } from "./lib";

import type { UiBaseProps } from "../types";
import type { DateRangeInput } from "@ryuzaki13/react-foundation-lib/formatters";

export interface PeriodSelectProps extends UiBaseProps<PeriodSelectOption["id"] | undefined> {
	options?: readonly PeriodSelectOption[];
	dateRange?: DateRangeInput;
	maxDayRangeDays?: number;
	maxWeekRangeWeeks?: number;
}

/**
 * Select периода детализации, который может ограничивать доступные варианты по диапазону дат.
 */
export function PeriodSelect({ value, onChange, options, dateRange, maxDayRangeDays, maxWeekRangeWeeks, ...props }: PeriodSelectProps) {
	const resolvedOptions = useMemo(
		() => options ?? createPeriodSelectOptions({ maxDayRangeDays, maxWeekRangeWeeks }),
		[maxDayRangeDays, maxWeekRangeWeeks, options]
	);
	const availableValue = useMemo(
		() => resolvePeriodSelectAvailableValue(value, resolvedOptions, dateRange),
		[dateRange, resolvedOptions, value]
	);

	const emitAvailableValue = useEffectEvent(() => {
		if (availableValue === undefined || availableValue === value) {
			return;
		}

		onChange(availableValue);
	});

	useEffect(() => {
		emitAvailableValue();
	}, [availableValue, value]);

	return (
		<PresetSelect
			{...props}
			options={resolvedOptions}
			value={availableValue}
			onChange={onChange}
			getOptionDisabled={(option) => isPeriodSelectOptionDisabled(option, dateRange)}
		/>
	);
}
