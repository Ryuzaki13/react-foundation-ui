import { useEffect, useEffectEvent, useRef, useState } from "react";

import { PresetSelect } from "../preset-select";

import {
	DEFAULT_DATE_RANGE_PRESET_OPTIONS,
	type DateRangePresetChangePayload,
	type DateRangePresetOption,
	resolveDateRangePresetPayload
} from "./lib/dateRangePresets";

import type { UiBaseProps } from "../types";

export interface DateRangePresetSelectProps extends UiBaseProps<DateRangePresetOption["id"] | undefined> {
	options?: readonly DateRangePresetOption[];
	referenceDate?: Date;
	onRangeChange?: (payload: DateRangePresetChangePayload | null) => void;
}

/**
 * Строит строковый ключ полезной нагрузки для защиты от повторного эмита одинакового диапазона.
 */
function getPayloadSignature(payload: DateRangePresetChangePayload | null): string {
	if (!payload) return "__empty__";

	const [startDate, endDate] = payload.range;
	return [payload.id, startDate?.getTime() ?? "null", endDate?.getTime() ?? "null"].join("|");
}

/**
 * Выбор пресета диапазона дат с вычислением диапазона без timezone-сдвига.
 */
export function DateRangePresetSelect({
	value,
	onChange,
	options = DEFAULT_DATE_RANGE_PRESET_OPTIONS,
	referenceDate,
	onRangeChange,
	...props
}: DateRangePresetSelectProps) {
	const [defaultReferenceDate] = useState(() => new Date());
	const referenceDateTimestamp = referenceDate?.getTime() ?? defaultReferenceDate.getTime();
	const hasRangeChangeHandler = Boolean(onRangeChange);
	const lastPayloadSignatureRef = useRef<string>("");

	/**
	 * Сообщает наружу только реально изменившийся диапазон.
	 */
	const emitRangeChange = useEffectEvent((nextValue: DateRangePresetOption["id"] | undefined) => {
		if (!onRangeChange) return;

		const nextPayload = resolveDateRangePresetPayload(nextValue, new Date(referenceDateTimestamp), options);
		const nextSignature = getPayloadSignature(nextPayload);
		if (nextSignature === lastPayloadSignatureRef.current) return;

		lastPayloadSignatureRef.current = nextSignature;
		onRangeChange(nextPayload);
	});

	useEffect(() => {
		emitRangeChange(value);
	}, [hasRangeChangeHandler, options, referenceDateTimestamp, value]);

	return <PresetSelect {...props} options={options} value={value} onChange={onChange} />;
}
