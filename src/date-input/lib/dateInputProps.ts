import { type NullableDateRange } from "@ryuzaki13/react-foundation-lib/formatters";

import { type UiBaseProps } from "../../types";

import {
	type DateInputSelectionMode,
	type DateInputSelectionModeDatePresets,
	type DateInputWeekEndDay,
	type DatePickerLevel
} from "./types";

interface BaseDateInputProps {
	/** Разрешает сброс одной даты или диапазона в null через встроенную очистку. */
	clearable?: boolean;

	error?: string;
	onClearError?: () => void;

	minDate?: Date;
	maxDate?: Date;

	datePreset?: string;

	/**
	 * Минимальный уровень календарной навигации. Размер выбранного периода задаёт `selectionMode`.
	 */
	datePickerLevel?: DatePickerLevel;

	/**
	 * Размер периода, который выбирает поле: день, неделя, месяц или год.
	 */
	selectionMode?: DateInputSelectionMode;

	/**
	 * Последний включённый день недели для `selectionMode="week"`.
	 */
	weekEndDay?: DateInputWeekEndDay;

	/**
	 * Показывает переключатель `selectionMode` под календарём.
	 */
	allowSelectionModeChange?: boolean;

	/**
	 * Ограничивает набор режимов в runtime-переключателе.
	 */
	selectionModeOptions?: readonly DateInputSelectionMode[];

	/**
	 * Задаёт отдельный пресет форматирования для каждого runtime-режима выбора.
	 * Общий `datePreset` используется как fallback для отсутствующих значений.
	 */
	selectionModeDatePresets?: DateInputSelectionModeDatePresets;

	/**
	 * Сообщает наружу о runtime-смене режима выбора.
	 */
	onSelectionModeChange?: (selectionMode: DateInputSelectionMode) => void;
}

export interface DateSingleInputProps extends BaseDateInputProps, UiBaseProps<Date | null> {
	selectsRange?: false;
}

export interface DateRangeInputProps extends BaseDateInputProps, UiBaseProps<NullableDateRange | null> {
	selectsRange: true;
}

export type DateInputControlProps = DateSingleInputProps | DateRangeInputProps;
