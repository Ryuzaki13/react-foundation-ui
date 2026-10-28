import { useMemo, useState } from "react";

import { isDateRangeTuple, type CalendarPeriodDateBounds, type NullableDateRange } from "@ryuzaki13/react-foundation-lib/formatters";

import {
	type DateInputValueOptions,
	areRangeDateValuesEqual,
	areSingleDateValuesEqual,
	formatDateInputValue,
	normalizeRangeDateValue,
	normalizeRangeEndDateValue,
	normalizeSingleDateValue,
	parseRangeDateValue,
	parseSingleDateValue,
	type DateInputOptions
} from "../lib";
import { isDateInputValueWithinDateBounds } from "../lib/isDateInputValueWithinDateBounds";

/**
 * Хук управляет текстовым представлением и выбранным значением поля даты.
 */
export const useDateInput = (options: DateInputOptions & CalendarPeriodDateBounds) => {
	const externalSelectedDate = useMemo(() => {
		const selectionOptions: DateInputValueOptions = {
			selectionMode: options.selectionMode,
			weekEndDay: options.weekEndDay
		};

		if (options.selectsRange) {
			return normalizeRangeDateValue(options.value ?? null, selectionOptions);
		}

		return normalizeSingleDateValue(options.value ?? null, selectionOptions);
	}, [options.selectsRange, options.selectionMode, options.value, options.weekEndDay]);

	const formatOptions = useMemo<DateInputValueOptions>(
		() => ({
			datePreset: options.datePreset,
			datePickerLevel: options.datePickerLevel,
			selectionMode: options.selectionMode,
			weekEndDay: options.weekEndDay
		}),
		[options.datePickerLevel, options.datePreset, options.selectionMode, options.weekEndDay]
	);

	const externalInputValue = formatDateInputValue(externalSelectedDate, formatOptions);
	const externalStateSignature = JSON.stringify([
		options.selectsRange,
		options.datePreset ?? null,
		options.datePickerLevel ?? null,
		options.selectionMode ?? null,
		options.weekEndDay ?? null,
		isDateRangeTuple(externalSelectedDate)
			? [externalSelectedDate[0]?.getTime() ?? null, externalSelectedDate[1]?.getTime() ?? null]
			: (externalSelectedDate?.getTime() ?? null)
	]);

	const [draftState, setDraftState] = useState(() => ({
		sourceSignature: externalStateSignature,
		selectedDate: externalSelectedDate,
		inputValue: externalInputValue
	}));

	const hasCurrentDraft = draftState.sourceSignature === externalStateSignature;

	// Ограниченная корректировка собственного draft по предыдущему external-снимку
	// сохраняет input DOM и фокус. Одного сравнения сигнатур недостаточно: цикл
	// A → B → A иначе воскрешает незавершённый текст от первого A.
	if (!hasCurrentDraft) {
		setDraftState({
			sourceSignature: externalStateSignature,
			selectedDate: externalSelectedDate,
			inputValue: externalInputValue
		});
	}

	const selectedDate = hasCurrentDraft ? draftState.selectedDate : externalSelectedDate;
	const inputValue = hasCurrentDraft ? draftState.inputValue : externalInputValue;

	/**
	 * Сохраняет пользовательский текст только относительно текущего controlled-снимка.
	 * При внешней смене value или формата отображение сразу выводится из новых props.
	 */
	const setInputValue = (nextInputValue: string) => {
		setDraftState((currentState) => {
			const currentSelectedDate =
				currentState.sourceSignature === externalStateSignature ? currentState.selectedDate : externalSelectedDate;

			return {
				sourceSignature: externalStateSignature,
				selectedDate: currentSelectedDate,
				inputValue: nextInputValue
			};
		});
	};

	/**
	 * Обновляет локальный незавершённый выбор, не зеркаля controlled value через effect.
	 */
	const setSelectedDate = (nextSelectedDate: Date | NullableDateRange | null) => {
		setDraftState((currentState) => {
			const currentInputValue =
				currentState.sourceSignature === externalStateSignature ? currentState.inputValue : externalInputValue;

			return {
				sourceSignature: externalStateSignature,
				selectedDate: nextSelectedDate,
				inputValue: currentInputValue
			};
		});
	};

	/**
	 * Форматирует значение поля даты согласно текущему пресету.
	 */
	const formatValue = (value: Date | NullableDateRange | null): string => formatDateInputValue(value, formatOptions);

	/**
	 * Парсит строковое значение поля в дату или диапазон дат.
	 */
	const parseDate = (dateString: string): Date | NullableDateRange | null => {
		const parseOptions: DateInputValueOptions = {
			...formatOptions,
			referenceDate: isDateRangeTuple(selectedDate) ? (selectedDate[0] ?? selectedDate[1] ?? undefined) : (selectedDate ?? undefined)
		};

		if (options.selectsRange) {
			return parseRangeDateValue(dateString, parseOptions);
		}

		return parseSingleDateValue(dateString, parseOptions);
	};

	/** Закрытие календаря отменяет только незавершённый draft, не публикуя старое значение повторно. */
	const restoreExternalValue = () => {
		setDraftState({
			sourceSignature: externalStateSignature,
			selectedDate: externalSelectedDate,
			inputValue: externalInputValue
		});
	};

	/** Сброс использует единственное пустое значение обоих публичных контролов — null. */
	const clearValue = () => {
		if (!options.clearable || options.disabled) {
			return;
		}

		setDraftState({ sourceSignature: externalStateSignature, selectedDate: null, inputValue: "" });

		if (selectedDate !== null || inputValue !== "") {
			options.onChange(null);
		}
	};

	/**
	 * Проверяет уже нормализованный текст до смены draft и публикации. При отказе
	 * восстанавливает внешний controlled-снимок целиком: отклонённый текст не
	 * должен оставаться видимым выбранным периодом без соответствующего onChange.
	 */
	const handleInputBlur = () => {
		if (!inputValue.trim()) {
			if (options.clearable) {
				clearValue();
			}

			return;
		}

		const parsedDate = parseDate(inputValue);
		if (!parsedDate) {
			return;
		}
		if (!isDateInputValueWithinDateBounds(parsedDate, formatOptions, options)) {
			setDraftState({
				sourceSignature: externalStateSignature,
				selectedDate: externalSelectedDate,
				inputValue: externalInputValue
			});
			return;
		}

		setInputValue(formatValue(parsedDate));
		if (options.selectsRange && isDateRangeTuple(parsedDate)) {
			const selectedRange = isDateRangeTuple(selectedDate) ? selectedDate : null;
			if (areRangeDateValuesEqual(parsedDate, selectedRange, formatOptions)) {
				return;
			}
			setSelectedDate(parsedDate);
			options.onChange(parsedDate);
		} else if (!options.selectsRange && parsedDate instanceof Date) {
			const selectedSingleDate = selectedDate instanceof Date ? selectedDate : null;
			if (areSingleDateValuesEqual(parsedDate, selectedSingleDate, formatOptions)) {
				return;
			}
			setSelectedDate(parsedDate);
			options.onChange(parsedDate);
		}
	};

	/**
	 * Обрабатывает выбор даты из календаря.
	 */
	const handleSelect = (date: Date | NullableDateRange) => {
		const [selectedStartDate, selectedEndDate] = date instanceof Date ? [date, null] : date;

		if (options.selectsRange) {
			const normalizedStartDate = normalizeSingleDateValue(selectedStartDate, formatOptions);
			const normalizedEndDate = normalizeRangeEndDateValue(selectedEndDate, formatOptions);

			if (normalizedStartDate && normalizedEndDate) {
				if (normalizedEndDate < normalizedStartDate) {
					const swappedRange: NullableDateRange = [
						normalizeSingleDateValue(selectedEndDate, formatOptions),
						normalizeRangeEndDateValue(selectedStartDate, formatOptions)
					];
					setDraftState({
						sourceSignature: externalStateSignature,
						selectedDate: swappedRange,
						inputValue: formatValue(swappedRange)
					});
					options.onChange(swappedRange);
				} else {
					const nextRange: NullableDateRange = [normalizedStartDate, normalizedEndDate];
					setDraftState({
						sourceSignature: externalStateSignature,
						selectedDate: nextRange,
						inputValue: formatValue(nextRange)
					});
					options.onChange(nextRange);
				}

				return true;
			}

			const nextRange: NullableDateRange = [normalizedStartDate, null];
			setDraftState({
				sourceSignature: externalStateSignature,
				selectedDate: nextRange,
				inputValue: formatValue(nextRange)
			});
			return false;
		}

		const normalizedDate = normalizeSingleDateValue(selectedStartDate, formatOptions);
		setDraftState({
			sourceSignature: externalStateSignature,
			selectedDate: normalizedDate,
			inputValue: formatValue(normalizedDate)
		});
		options.onChange(normalizedDate);

		return true;
	};

	return {
		inputValue,
		setInputValue,
		selectedDate,
		setSelectedDate,
		handleSelect,
		handleInputBlur,
		formatDate: formatValue,
		parseDate,
		clearValue,
		restoreExternalValue
	};
};
