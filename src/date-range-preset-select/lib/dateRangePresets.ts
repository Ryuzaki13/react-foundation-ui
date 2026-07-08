import {
	type DateRangeReferenceContext,
	type NullableDateRange,
	resolveMonthAgoRange,
	resolveMonthStartToTodayRange,
	resolveMonthStartToYesterdayRange,
	resolveTodayRange,
	resolveYesterdayRange
} from "@ryuzaki13/react-foundation-lib/formatters";
import { getPresetOption, normalizePresetIds, type PresetOption, resolvePresetOptionsByIds } from "@ryuzaki13/react-foundation-lib/presets";

/**
 * Идентификаторы встроенных пресетов диапазона дат.
 */
export type DateRangePresetId = "monthStartToYesterday" | "monthStartToToday" | "today" | "yesterday" | "monthAgo";

/**
 * Описание одного пресета диапазона дат.
 */
export interface DateRangePresetOption extends PresetOption<DateRangePresetId | (string & {})> {
	resolveRange: (context: DateRangeReferenceContext) => NullableDateRange;
}

type BuiltInDateRangePresetOption = DateRangePresetOption & {
	id: DateRangePresetId;
};

/**
 * Полезная нагрузка события с вычисленным диапазоном.
 */
export interface DateRangePresetChangePayload {
	id: DateRangePresetOption["id"];
	label: string;
	range: NullableDateRange;
}

/**
 * Полный встроенный список пресетов диапазона дат.
 */
export const DATE_RANGE_PRESET_OPTIONS: readonly BuiltInDateRangePresetOption[] = Object.freeze([
	{
		id: "monthStartToYesterday",
		label: "С начала месяца по вчера",
		resolveRange: resolveMonthStartToYesterdayRange
	},
	{
		id: "monthStartToToday",
		label: "С начала месяца по сегодня",
		resolveRange: resolveMonthStartToTodayRange
	},
	{
		id: "today",
		label: "За сегодня",
		resolveRange: resolveTodayRange
	},
	{
		id: "yesterday",
		label: "За вчера",
		resolveRange: resolveYesterdayRange
	},
	{
		id: "monthAgo",
		label: "Месяц назад",
		resolveRange: resolveMonthAgoRange
	}
]);

/**
 * Идентификаторы пресетов, которые включены в контрол по умолчанию.
 */
export const DEFAULT_DATE_RANGE_PRESET_IDS = Object.freeze([
	"monthStartToYesterday",
	"monthStartToToday",
	"today",
	"yesterday"
] as const satisfies readonly DateRangePresetId[]);

const DATE_RANGE_PRESET_ID_SET: ReadonlySet<string> = new Set(DATE_RANGE_PRESET_OPTIONS.map((option) => option.id));

/**
 * Проверяет, что значение является идентификатором встроенного пресета.
 */
export function isDateRangePresetId(value: unknown): value is DateRangePresetId {
	return typeof value === "string" && DATE_RANGE_PRESET_ID_SET.has(value);
}

/**
 * Нормализует сохраненный список идентификаторов пресетов.
 */
export function normalizeDateRangePresetIds(value: unknown, fallbackIds: readonly DateRangePresetId[] = []): DateRangePresetId[] {
	return normalizePresetIds(value, isDateRangePresetId, fallbackIds);
}

/**
 * Формирует список пресетов по сохраненным идентификаторам, сохраняя порядок.
 */
export function resolveDateRangePresetOptionsByIds(
	presetIds: readonly DateRangePresetOption["id"][],
	options: readonly DateRangePresetOption[] = DATE_RANGE_PRESET_OPTIONS
): DateRangePresetOption[] {
	return resolvePresetOptionsByIds(presetIds, options);
}

/**
 * Встроенный список пресетов диапазона дат, включенный по умолчанию.
 */
export const DEFAULT_DATE_RANGE_PRESET_OPTIONS: readonly DateRangePresetOption[] = Object.freeze(
	resolveDateRangePresetOptionsByIds(DEFAULT_DATE_RANGE_PRESET_IDS)
);

/**
 * Ищет пресет по идентификатору.
 */
export function getDateRangePresetOption(
	id: DateRangePresetOption["id"] | undefined,
	options: readonly DateRangePresetOption[] = DEFAULT_DATE_RANGE_PRESET_OPTIONS
): DateRangePresetOption | null {
	return getPresetOption(id, options);
}

/**
 * Вычисляет диапазон по идентификатору пресета.
 */
export function resolveDateRangePresetPayload(
	id: DateRangePresetOption["id"] | undefined,
	referenceDate = new Date(),
	options: readonly DateRangePresetOption[] = DEFAULT_DATE_RANGE_PRESET_OPTIONS
): DateRangePresetChangePayload | null {
	const option = getDateRangePresetOption(id, options);
	if (!option) return null;

	return {
		id: option.id,
		label: option.label,
		range: option.resolveRange({ referenceDate })
	};
}

/**
 * Ищет идентификатор пресета, который полностью совпадает с переданным диапазоном.
 */
export function resolveDateRangePresetIdByRange(
	range: NullableDateRange | null | undefined,
	referenceDate = new Date(),
	options: readonly DateRangePresetOption[] = DEFAULT_DATE_RANGE_PRESET_OPTIONS
): DateRangePresetOption["id"] | null {
	if (!Array.isArray(range)) return null;

	const [rangeStartDate, rangeEndDate] = range;
	if (!(rangeStartDate instanceof Date) || !(rangeEndDate instanceof Date)) return null;

	const rangeStartTime = rangeStartDate.getTime();
	const rangeEndTime = rangeEndDate.getTime();

	for (const option of options) {
		const [presetStartDate, presetEndDate] = option.resolveRange({ referenceDate });
		if (!(presetStartDate instanceof Date) || !(presetEndDate instanceof Date)) {
			continue;
		}

		if (presetStartDate.getTime() === rangeStartTime && presetEndDate.getTime() === rangeEndTime) {
			return option.id;
		}
	}

	return null;
}
