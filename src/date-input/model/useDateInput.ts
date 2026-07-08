import { useEffect, useEffectEvent, useMemo, useState } from "react";

import { isDateRangeTuple, type NullableDateRange } from "@ryuzaki13/react-foundation-lib/formatters";

import {
	DateInputValueOptions,
	formatDateInputValue,
	normalizeRangeDateValue,
	normalizeRangeEndDateValue,
	normalizeSingleDateValue,
	parseRangeDateValue,
	parseSingleDateValue,
	type DateInputOptions
} from "../lib";

function resolveReferenceDate(value: Date | NullableDateRange | null): Date | undefined {
	if (isDateRangeTuple(value)) {
		return value[0] ?? value[1] ?? undefined;
	}

	return value ?? undefined;
}

/**
 * Хук управляет текстовым представлением и выбранным значением поля даты.
 */
export const useDateInput = (options: DateInputOptions) => {
	const initialSelectedDate = useMemo(() => {
		const selectionOptions: DateInputValueOptions = {
			selectionMode: options.selectionMode,
			weekEndDay: options.weekEndDay
		};

		if (options.selectsRange) {
			return normalizeRangeDateValue(options.value as NullableDateRange | null, selectionOptions);
		}

		return normalizeSingleDateValue(options.value as Date | null, selectionOptions);
	}, [options.selectsRange, options.selectionMode, options.value, options.weekEndDay]);

	const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
	const formatOptions = useMemo<DateInputValueOptions>(
		() => ({
			datePreset: options.datePreset,
			dateFormat: options.dateFormat,
			datePickerLevel: options.datePickerLevel,
			selectionMode: options.selectionMode,
			weekEndDay: options.weekEndDay
		}),
		[options.dateFormat, options.datePickerLevel, options.datePreset, options.selectionMode, options.weekEndDay]
	);
	const [inputValue, setInputValue] = useState<string>(() => formatDateInputValue(initialSelectedDate, formatOptions));
	const valueSignature = useMemo(() => {
		if (options.selectsRange) {
			const normalizedRange = normalizeRangeDateValue(options.value as NullableDateRange | null, formatOptions);
			return `${normalizedRange?.[0]?.getTime() ?? "null"}:${normalizedRange?.[1]?.getTime() ?? "null"}`;
		}

		const normalizedDate = normalizeSingleDateValue(options.value as Date | null, formatOptions);
		return String(normalizedDate?.getTime() ?? "null");
	}, [formatOptions, options.selectsRange, options.value]);

	/**
	 * Форматирует значение поля даты согласно текущему шаблону.
	 */
	const formatValue = (value: Date | NullableDateRange | null): string => formatDateInputValue(value, formatOptions);

	/**
	 * Синхронизирует внутреннее состояние с внешними пропсами.
	 */
	const syncStateFromProps = useEffectEvent((nextValue: DateInputOptions["value"]) => {
		if (options.selectsRange) {
			const normalizedRange = normalizeRangeDateValue(nextValue as NullableDateRange | null, formatOptions);
			const nextInputValue = formatValue(normalizedRange);

			setSelectedDate((prevValue) => {
				const previousRangeValue = prevValue as NullableDateRange | null;
				const hasSameRange =
					(previousRangeValue?.[0]?.getTime() ?? null) === (normalizedRange?.[0]?.getTime() ?? null) &&
					(previousRangeValue?.[1]?.getTime() ?? null) === (normalizedRange?.[1]?.getTime() ?? null);

				return hasSameRange ? prevValue : normalizedRange;
			});
			setInputValue((prevValue) => (prevValue === nextInputValue ? prevValue : nextInputValue));
			return;
		}

		const normalizedDate = normalizeSingleDateValue(nextValue as Date | null, formatOptions);
		const nextInputValue = formatValue(normalizedDate);

		setSelectedDate((prevValue) =>
			((prevValue as Date | null)?.getTime() ?? null) === (normalizedDate?.getTime() ?? null) ? prevValue : normalizedDate
		);
		setInputValue((prevValue) => (prevValue === nextInputValue ? prevValue : nextInputValue));
	});

	useEffect(() => {
		syncStateFromProps(options.value);
	}, [
		options.dateFormat,
		options.datePickerLevel,
		options.datePreset,
		options.selectsRange,
		options.selectionMode,
		options.value,
		options.weekEndDay,
		valueSignature
	]);

	/**
	 * Парсит строковое значение поля в дату или диапазон дат.
	 */
	const parseDate = (dateString: string): Date | NullableDateRange | null => {
		const parseOptions: DateInputValueOptions = {
			...formatOptions,
			referenceDate: resolveReferenceDate(selectedDate)
		};

		if (options.selectsRange) {
			return parseRangeDateValue(dateString, parseOptions);
		}

		return parseSingleDateValue(dateString, parseOptions);
	};

	/**
	 * Обрабатывает выбор даты из календаря.
	 */
	const handleSelect = (date: Date | NullableDateRange) => {
		const [selectedStartDate, selectedEndDate] = (Array.isArray(date) ? date : [date, null]) as NullableDateRange;

		if (options.selectsRange) {
			const normalizedStartDate = normalizeSingleDateValue(selectedStartDate, formatOptions);
			const normalizedEndDate = normalizeRangeEndDateValue(selectedEndDate, formatOptions);

			if (normalizedStartDate && normalizedEndDate) {
				if (normalizedEndDate < normalizedStartDate) {
					const swappedRange: NullableDateRange = [
						normalizeSingleDateValue(selectedEndDate, formatOptions),
						normalizeRangeEndDateValue(selectedStartDate, formatOptions)
					];
					setSelectedDate(swappedRange);
					setInputValue(formatValue(swappedRange));
					options.onChange(swappedRange);
				} else {
					const nextRange: NullableDateRange = [normalizedStartDate, normalizedEndDate];
					setSelectedDate(nextRange);
					setInputValue(formatValue(nextRange));
					options.onChange(nextRange);
				}

				return true;
			}

			const nextRange: NullableDateRange = [normalizedStartDate, null];
			setSelectedDate(nextRange);
			setInputValue(formatValue(nextRange));
			return false;
		}

		const normalizedDate = normalizeSingleDateValue(selectedStartDate, formatOptions);
		setSelectedDate(normalizedDate);
		setInputValue(formatValue(normalizedDate));
		options.onChange(normalizedDate);

		return true;
	};

	return {
		inputValue,
		setInputValue,
		selectedDate,
		setSelectedDate,
		handleSelect,
		formatDate: formatValue,
		parseDate
	};
};
