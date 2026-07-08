import { type CalendarPeriodSelectionMode, type CalendarWeekEndDay, type NullableDateRange } from "@ryuzaki13/react-foundation-lib/formatters";

export type DatePickerLevel = "day" | "month" | "year";
export type CalendarType = DatePickerLevel;
export type DateInputSelectionMode = CalendarPeriodSelectionMode;
export type DateInputWeekEndDay = CalendarWeekEndDay;

// Базовые свойства для всех компонентов с единым интерфейсом
interface BaseUiProps<T = unknown> {
	value: T | undefined;
	onChange: (value: T) => void;
}

// Опции для хука useDateInput
export interface BaseDateInputOptions<T = unknown> extends BaseUiProps<T> {
	datePreset?: string;
	/**
	 * @deprecated Используйте `datePreset`.
	 */
	dateFormat?: string;
	datePickerLevel?: DatePickerLevel;
	selectionMode?: DateInputSelectionMode;
	weekEndDay?: DateInputWeekEndDay;
}

export interface DateSingleInputOptions extends BaseDateInputOptions<Date | null> {
	selectsRange?: false;
}

export interface DateRangeInputOptions extends BaseDateInputOptions<NullableDateRange | null> {
	selectsRange: true;
}

export type DateInputOptions = DateSingleInputOptions | DateRangeInputOptions;

// Типы для календаря
interface CalendarBaseProps<T = unknown> extends BaseUiProps<T> {
	minDate?: Date;
	maxDate?: Date;
}

interface CalendarSingleProps extends CalendarBaseProps<Date | null> {
	selectsRange?: false;
}

interface CalendarRangeProps extends CalendarBaseProps<NullableDateRange> {
	selectsRange: true;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;
