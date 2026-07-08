import {
	DEFAULT_DATE_PRESET_NAMES,
	formatDate,
	formatDateRange,
	getCalendarPeriod,
	getDatePreset,
	isDateRangeTuple,
	parseDateByFormat,
	resolveDateFormatName,
	resolveDateFormatPreset,
	type CalendarPeriodOptions,
	type DateFormatPrecision,
	type DateFormatPreset,
	type DateRangeInput,
	type NullableDateRange
} from "@ryuzaki13/react-foundation-lib/formatters";

/**
 * Пресет даты по умолчанию для текстового поля.
 */
export const DEFAULT_DATE_INPUT_PRESET = DEFAULT_DATE_PRESET_NAMES.date;

/**
 * @deprecated Используйте `DEFAULT_DATE_INPUT_PRESET`.
 */
export const DEFAULT_DATE_INPUT_FORMAT = "dd.MM.yyyy";

const RANGE_SEPARATOR = " - ";
const DATE_INPUT_FORMAT_OPTIONS = Object.freeze({
	defaultFormat: DEFAULT_DATE_INPUT_PRESET,
	patternPresetName: "__date_input__"
});

export type DateInputValueOptions = {
	/**
	 * Имя пресета форматирования даты.
	 */
	datePreset?: string;
	/**
	 * @deprecated Используйте `datePreset`.
	 */
	dateFormat?: string;
	/**
	 * Точность календарного значения.
	 */
	datePickerLevel?: DateFormatPrecision;
	/**
	 * Размер периода, который выбирается и нормализуется полем.
	 */
	selectionMode?: CalendarPeriodOptions["selectionMode"];
	/**
	 * Последний включённый день недели для режима выбора недели.
	 */
	weekEndDay?: CalendarPeriodOptions["weekEndDay"];
	/**
	 * Опорная дата для пресетов без года, например `month-long`.
	 */
	referenceDate?: Date;
};

export type DateInputValueOptionsInput = string | DateInputValueOptions | undefined;

/**
 * Возвращает точность форматирования поля даты.
 */
function resolveDateInputPrecision(options: DateInputValueOptions): DateFormatPrecision {
	if (options.selectionMode === "day" || options.selectionMode === "week") {
		return "day";
	}

	if (options.selectionMode === "month" || options.selectionMode === "year") {
		return options.selectionMode;
	}

	return options.datePickerLevel ?? "day";
}

function resolveCalendarPeriodOptions(options?: DateInputValueOptions): CalendarPeriodOptions {
	return {
		selectionMode: options?.selectionMode,
		weekEndDay: options?.weekEndDay
	};
}

/**
 * Нормализует объектные опции и позиционный вызов с именем пресета.
 */
function normalizeDateInputValueOptions(
	optionsOrPreset?: DateInputValueOptionsInput,
	datePickerLevel?: DateFormatPrecision
): DateInputValueOptions {
	if (typeof optionsOrPreset === "string" || optionsOrPreset === undefined) {
		return {
			datePreset: optionsOrPreset,
			datePickerLevel
		};
	}

	if (datePickerLevel && optionsOrPreset.datePickerLevel === undefined) {
		return {
			...optionsOrPreset,
			datePickerLevel
		};
	}

	return optionsOrPreset;
}

/**
 * Проверяет новый `datePreset` и возвращает только зарегистрированное имя пресета.
 */
function resolveDateInputPresetName(datePreset?: string): string {
	const resolvedPresetName = resolveDateFormatName(datePreset, DEFAULT_DATE_INPUT_PRESET);
	return getDatePreset(resolvedPresetName) ? resolvedPresetName : DEFAULT_DATE_INPUT_PRESET;
}

/**
 * Возвращает имя пресета или deprecated-формат для парсинга.
 */
function resolveDateInputFormatName(options: DateInputValueOptions): string | undefined {
	if (options.datePreset !== undefined) {
		return resolveDateInputPresetName(options.datePreset);
	}

	return options.dateFormat;
}

/**
 * Возвращает зарегистрированный пресет или deprecated-объектный шаблон.
 */
function resolveDateInputFormatPreset(options: DateInputValueOptions): string | DateFormatPreset {
	if (options.datePreset !== undefined) {
		return resolveDateInputPresetName(options.datePreset);
	}

	return resolveDateFormatPreset(options.dateFormat, DATE_INPUT_FORMAT_OPTIONS);
}

/**
 * Приводит результат универсального парсинга к календарной дате.
 */
function parseDateTimeValue(value: string, options: DateInputValueOptions): Date | null {
	return (
		parseDateByFormat(value, resolveDateInputFormatName(options), {
			defaultFormat: DEFAULT_DATE_INPUT_PRESET,
			precision: resolveDateInputPrecision(options),
			referenceDate: options.referenceDate
		})?.date ?? null
	);
}

/**
 * Приводит одиночную дату к началу выбранного календарного периода.
 */
export function normalizeSingleDateValue(date: Date | null, options?: DateInputValueOptions): Date | null {
	return getCalendarPeriod(date, resolveCalendarPeriodOptions(options))?.start ?? null;
}

/**
 * Приводит диапазон дат к границам выбранных календарных периодов.
 */
export function normalizeRangeDateValue(range: NullableDateRange | null, options?: DateInputValueOptions): NullableDateRange | null {
	if (!isDateRangeTuple(range)) return null;

	const [startDate, endDate] = range;
	return [normalizeSingleDateValue(startDate, options), normalizeRangeEndDateValue(endDate, options)];
}

/**
 * Приводит конечную дату диапазона к концу выбранного календарного периода.
 */
export function normalizeRangeEndDateValue(date: Date | null, options?: DateInputValueOptions): Date | null {
	return getCalendarPeriod(date, resolveCalendarPeriodOptions(options))?.end ?? null;
}

function getDateTime(date: Date | null): number | null {
	return date?.getTime() ?? null;
}

/**
 * Сравнивает одиночные даты после нормализации к точности поля ввода.
 */
export function areSingleDateValuesEqual(left: Date | null, right: Date | null, options?: DateInputValueOptions): boolean {
	return getDateTime(normalizeSingleDateValue(left, options)) === getDateTime(normalizeSingleDateValue(right, options));
}

/**
 * Сравнивает диапазоны дат после нормализации к границам выбранных периодов.
 */
export function areRangeDateValuesEqual(
	left: NullableDateRange | null,
	right: NullableDateRange | null,
	options?: DateInputValueOptions
): boolean {
	const normalizedLeft = normalizeRangeDateValue(left, options);
	const normalizedRight = normalizeRangeDateValue(right, options);

	return (
		getDateTime(normalizedLeft?.[0] ?? null) === getDateTime(normalizedRight?.[0] ?? null) &&
		getDateTime(normalizedLeft?.[1] ?? null) === getDateTime(normalizedRight?.[1] ?? null)
	);
}

/**
 * Форматирует одиночную дату для текстового поля.
 */
export function formatSingleDateValue(
	date: Date | null,
	optionsOrPreset?: DateInputValueOptionsInput,
	datePickerLevel?: DateFormatPrecision
): string {
	if (!date) return "";

	const options = normalizeDateInputValueOptions(optionsOrPreset, datePickerLevel);
	return formatDate(date, resolveDateInputFormatPreset(options), {
		precision: resolveDateInputPrecision(options)
	});
}

/**
 * Форматирует диапазон дат для текстового поля.
 */
export function formatRangeDateValue(
	range: NullableDateRange | null,
	optionsOrPreset?: DateInputValueOptionsInput,
	datePickerLevel?: DateFormatPrecision
): string {
	if (!isDateRangeTuple(range)) return "";

	const options = normalizeDateInputValueOptions(optionsOrPreset, datePickerLevel);
	const [startDate, endDate] = range;
	if (startDate && endDate) {
		return formatDateRange(startDate, endDate, resolveDateInputFormatPreset(options), {
			precision: resolveDateInputPrecision(options)
		});
	}

	if (startDate) {
		return `${formatSingleDateValue(startDate, options)}${RANGE_SEPARATOR}`;
	}

	return "";
}

/**
 * Унифицирует форматирование значения поля даты.
 */
export function formatDateInputValue(
	value: DateRangeInput,
	optionsOrPreset?: DateInputValueOptionsInput,
	datePickerLevel?: DateFormatPrecision
): string {
	if (isDateRangeTuple(value)) {
		return formatRangeDateValue(value, optionsOrPreset, datePickerLevel);
	}

	return formatSingleDateValue(value, optionsOrPreset, datePickerLevel);
}

/**
 * Парсит строку одиночной даты по заданному шаблону или пресету.
 */
export function parseSingleDateValue(
	value: string,
	optionsOrPreset?: DateInputValueOptionsInput,
	datePickerLevel?: DateFormatPrecision
): Date | null {
	const options = normalizeDateInputValueOptions(optionsOrPreset, datePickerLevel);
	return normalizeSingleDateValue(parseDateTimeValue(value, options), options);
}

/**
 * Парсит строку диапазона дат по заданному шаблону или пресету.
 */
export function parseRangeDateValue(
	value: string,
	optionsOrPreset?: DateInputValueOptionsInput,
	datePickerLevel?: DateFormatPrecision
): NullableDateRange {
	const options = normalizeDateInputValueOptions(optionsOrPreset, datePickerLevel);
	const [startPart = "", endPart = ""] = value.split(RANGE_SEPARATOR);

	return [parseSingleDateValue(startPart, options), parseRangeEndDateValue(endPart, options)];
}

/**
 * Парсит конечную дату диапазона и нормализует её к концу суток.
 */
export function parseRangeEndDateValue(
	value: string,
	optionsOrPreset?: DateInputValueOptionsInput,
	datePickerLevel?: DateFormatPrecision
): Date | null {
	const options = normalizeDateInputValueOptions(optionsOrPreset, datePickerLevel);
	return normalizeRangeEndDateValue(parseDateTimeValue(value, options), options);
}
