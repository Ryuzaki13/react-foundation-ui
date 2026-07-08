import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";

import { NullableDateRange } from "@ryuzaki13/react-foundation-lib/formatters";

import { RangeDateInput, type DateRangeInputProps } from "../../date-input";
import {
	DateRangePresetOption,
	DateRangePresetSelect,
	DEFAULT_DATE_RANGE_PRESET_IDS,
	normalizeDateRangePresetIds,
	resolveDateRangePresetIdByRange,
	resolveDateRangePresetOptionsByIds,
	resolveDateRangePresetPayload
} from "../../date-range-preset-select";
import { FlexContainer } from "../../flex";

export interface PresetRangeDateInputProps extends Omit<DateRangeInputProps, "selectsRange"> {
	presetId?: DateRangePresetOption["id"] | null;
	onPresetIdChange?: (presetId: DateRangePresetOption["id"] | null) => void;
	referenceDate?: Date;
	presetIds?: readonly DateRangePresetOption["id"][];
	presetOptions?: readonly DateRangePresetOption[];
	presetLabel?: ReactNode;
	presetDescription?: string;
	presetPlaceholder?: string;
	presetDisabled?: boolean;
}

/**
 * Строит сигнатуру пресета для защиты от повторной синхронизации.
 */
function getPresetSignature(presetId: DateRangePresetOption["id"] | null): string {
	return presetId ?? "__empty__";
}

/**
 * Составной компонент выбора диапазона дат через пресет или ручной ввод.
 */
export function PresetRangeDateInput({
	value,
	onChange,
	presetId,
	onPresetIdChange,
	referenceDate,
	presetIds,
	presetOptions,
	presetLabel,
	presetDescription,
	presetPlaceholder = "Выберите пресет диапазона",
	presetDisabled,
	...rangeDateInputProps
}: PresetRangeDateInputProps) {
	const [defaultReferenceDate] = useState(() => new Date());
	const resolvedReferenceDate = referenceDate ?? defaultReferenceDate;
	const resolvedPresetOptions = useMemo(
		() => presetOptions ?? resolveDateRangePresetOptionsByIds(normalizeDateRangePresetIds(presetIds, DEFAULT_DATE_RANGE_PRESET_IDS)),
		[presetIds, presetOptions]
	);
	const controlledValue = value ?? null;
	const matchedPresetId = useMemo(
		() => resolveDateRangePresetIdByRange(controlledValue, resolvedReferenceDate, resolvedPresetOptions),
		[controlledValue, resolvedPresetOptions, resolvedReferenceDate]
	);
	const selectedPresetId = presetId ?? matchedPresetId ?? undefined;
	const lastPresetSignatureRef = useRef<string>("");

	/**
	 * Сообщает наружу только реальное изменение `presetId`.
	 */
	const emitPresetIdChange = useCallback(
		(nextPresetId: DateRangePresetOption["id"] | null) => {
			if (!onPresetIdChange) return;

			const nextSignature = getPresetSignature(nextPresetId);
			if (nextSignature === lastPresetSignatureRef.current) return;

			lastPresetSignatureRef.current = nextSignature;
			onPresetIdChange(nextPresetId);
		},
		[onPresetIdChange]
	);

	/**
	 * Обрабатывает выбор пресета и переводит его в диапазон дат.
	 */
	const handlePresetChange = (nextPresetId: DateRangePresetOption["id"] | undefined) => {
		const nextPayload = resolveDateRangePresetPayload(nextPresetId, resolvedReferenceDate, resolvedPresetOptions);
		if (!nextPayload) {
			emitPresetIdChange(null);
			return;
		}

		emitPresetIdChange(nextPayload.id);
		onChange(nextPayload.range);
	};

	/**
	 * Обрабатывает ручное изменение диапазона и подбирает подходящий пресет.
	 */
	const handleRangeChange = (nextRange: NullableDateRange | null) => {
		onChange(nextRange);
		emitPresetIdChange(resolveDateRangePresetIdByRange(nextRange, resolvedReferenceDate, resolvedPresetOptions));
	};

	return (
		<FlexContainer gap="sm" align="end">
			<DateRangePresetSelect
				size="md"
				label={presetLabel}
				description={presetDescription}
				placeholder={presetPlaceholder}
				disabled={presetDisabled ?? rangeDateInputProps.disabled}
				value={selectedPresetId}
				onChange={handlePresetChange}
				options={resolvedPresetOptions}
				referenceDate={resolvedReferenceDate}
			/>

			<RangeDateInput {...rangeDateInputProps} size="md" value={controlledValue} onChange={handleRangeChange} />
		</FlexContainer>
	);
}
