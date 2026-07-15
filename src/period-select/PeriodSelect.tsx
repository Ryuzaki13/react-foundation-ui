import { useEffect, useEffectEvent, useMemo, useRef } from "react";

import { PresetSelect } from "../preset-select";

import {
	createPeriodSelectOptions,
	isPeriodSelectOptionDisabled,
	normalizePeriodSelectPresetIds,
	resolvePeriodSelectAvailableValue,
	resolvePeriodSelectOptionsByIds,
	type PeriodSelectOption,
	type PeriodSelectPresetId
} from "./lib";

import type { UiBaseProps } from "../types";
import type { DateRangeInput } from "@ryuzaki13/react-foundation-lib/formatters";

export interface PeriodSelectProps extends UiBaseProps<PeriodSelectOption["id"] | undefined> {
	options?: readonly PeriodSelectOption[];
	/**
	 * Разрешенные встроенные варианты периода. Значение нормализуется в канонический
	 * порядок, а пустой либо невалидный список безопасно заменяется полным набором.
	 * Не применяется, когда передан собственный `options`.
	 */
	presetIds?: readonly PeriodSelectPresetId[];
	dateRange?: DateRangeInput;
	maxDayRangeDays?: number;
	maxWeekRangeWeeks?: number;
}

/**
 * Select периода детализации, который может ограничивать доступные варианты по диапазону дат.
 */
export function PeriodSelect({
	value,
	onChange,
	options,
	presetIds,
	dateRange,
	maxDayRangeDays,
	maxWeekRangeWeeks,
	...props
}: PeriodSelectProps) {
	const resolvedOptions = useMemo(
		() =>
			options ??
			resolvePeriodSelectOptionsByIds(
				normalizePeriodSelectPresetIds(presetIds),
				createPeriodSelectOptions({ maxDayRangeDays, maxWeekRangeWeeks })
			),
		[maxDayRangeDays, maxWeekRangeWeeks, options, presetIds]
	);
	const availableValue = useMemo(
		() => resolvePeriodSelectAvailableValue(value, resolvedOptions, dateRange),
		[dateRange, resolvedOptions, value]
	);
	const lastEmittedTransitionRef = useRef<{
		value: PeriodSelectOption["id"] | undefined;
		availableValue: PeriodSelectOption["id"] | undefined;
	} | null>(null);

	const emitAvailableValue = useEffectEvent(() => {
		if (availableValue === undefined || availableValue === value) {
			// После принятия controlled-значения либо временной блокировки всех опций
			// такой же переход должен снова стать допустимым при следующем изменении условий.
			lastEmittedTransitionRef.current = null;
			return;
		}

		const lastTransition = lastEmittedTransitionRef.current;
		if (lastTransition && lastTransition.value === value && lastTransition.availableValue === availableValue) {
			return;
		}

		lastEmittedTransitionRef.current = { value, availableValue };

		// Сигнатура перехода защищает reconciliation от повтора в React StrictMode.
		// При временной блокировке всех опций внешний controlled-id сохраняется,
		// поэтому выбор восстановится без потери runtime-параметра после смены диапазона.
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
