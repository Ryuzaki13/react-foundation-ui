import {
	countCalendarDaysInDateRange,
	type DateRangeInput,
	normalizeText,
	toPositiveInteger
} from "@ryuzaki13/react-foundation-lib/formatters";
import { getPresetOption, normalizePresetIds, type PresetOption, resolvePresetOptionsByIds } from "@ryuzaki13/react-foundation-lib/presets";
import { isRecord } from "@ryuzaki13/react-foundation-lib/validators";

export type PeriodSelectPresetId = "day" | "week" | "month";
export type PeriodSelectId = PeriodSelectPresetId | (string & {});

export interface PeriodSelectOption extends PresetOption<PeriodSelectId> {
	maxRangeDays?: number;
}

type BuiltInPeriodSelectOption = PeriodSelectOption & {
	id: PeriodSelectPresetId;
};

export type PeriodSelectDateRangeConnectors = Readonly<{
	start: string;
	end: string;
}>;

export type PeriodSelectThresholds = {
	maxDayRangeDays?: number;
	maxWeekRangeWeeks?: number;
};

export const DEFAULT_PERIOD_SELECT_PRESET_ID = "day" satisfies PeriodSelectPresetId;
export const DEFAULT_PERIOD_SELECT_MAX_DAY_RANGE_DAYS = 31;
export const DEFAULT_PERIOD_SELECT_MAX_WEEK_RANGE_WEEKS = 26;

export const PERIOD_SELECT_OPTIONS: readonly BuiltInPeriodSelectOption[] = Object.freeze([
	{
		id: "day",
		label: "по дням"
	},
	{
		id: "week",
		label: "по неделям"
	},
	{
		id: "month",
		label: "по месяцам"
	}
]);

export const DEFAULT_PERIOD_SELECT_PRESET_IDS = Object.freeze(["day", "week", "month"] as const satisfies readonly PeriodSelectPresetId[]);

const PERIOD_SELECT_PRESET_ID_SET: ReadonlySet<string> = new Set(PERIOD_SELECT_OPTIONS.map((option) => option.id));

export function isPeriodSelectPresetId(value: unknown): value is PeriodSelectPresetId {
	return typeof value === "string" && PERIOD_SELECT_PRESET_ID_SET.has(value);
}

export function normalizePeriodSelectPresetIds(
	value: unknown,
	fallbackIds: readonly PeriodSelectPresetId[] = DEFAULT_PERIOD_SELECT_PRESET_IDS
): PeriodSelectPresetId[] {
	return normalizePresetIds(value, isPeriodSelectPresetId, fallbackIds);
}

export function resolvePeriodSelectOptionsByIds(
	presetIds: readonly PeriodSelectOption["id"][],
	options: readonly PeriodSelectOption[] = PERIOD_SELECT_OPTIONS
): PeriodSelectOption[] {
	return resolvePresetOptionsByIds(presetIds, options);
}

export function getPeriodSelectOption(
	id: PeriodSelectOption["id"] | undefined,
	options: readonly PeriodSelectOption[] = PERIOD_SELECT_OPTIONS
): PeriodSelectOption | null {
	return getPresetOption(id, options);
}

export function resolvePeriodSelectDefaultValue(value: unknown): PeriodSelectPresetId {
	return isPeriodSelectPresetId(value) ? value : DEFAULT_PERIOD_SELECT_PRESET_ID;
}

export function createPeriodSelectOptions({ maxDayRangeDays, maxWeekRangeWeeks }: PeriodSelectThresholds = {}): PeriodSelectOption[] {
	const dayLimit = toPositiveInteger(maxDayRangeDays);
	const weekLimit = toPositiveInteger(maxWeekRangeWeeks);

	return PERIOD_SELECT_OPTIONS.map((option) => {
		if (option.id === "day" && dayLimit !== undefined) {
			return {
				...option,
				maxRangeDays: dayLimit
			};
		}

		if (option.id === "week" && weekLimit !== undefined) {
			return {
				...option,
				maxRangeDays: weekLimit * 7
			};
		}

		return { ...option };
	});
}

export function isPeriodSelectOptionDisabled(option: PeriodSelectOption, dateRange: DateRangeInput | undefined): boolean {
	const maxRangeDays = toPositiveInteger(option.maxRangeDays);
	if (maxRangeDays === undefined || dateRange === undefined) {
		return false;
	}

	const rangeDays = countCalendarDaysInDateRange(dateRange);
	return rangeDays !== null && rangeDays > maxRangeDays;
}

export function resolvePeriodSelectAvailableValue(
	value: PeriodSelectOption["id"] | undefined,
	options: readonly PeriodSelectOption[],
	dateRange: DateRangeInput | undefined
): PeriodSelectOption["id"] | undefined {
	if (options.length === 0) {
		return undefined;
	}

	const selectedIndex = value === undefined ? -1 : options.findIndex((option) => option.id === value);
	const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

	if (selectedOption && !isPeriodSelectOptionDisabled(selectedOption, dateRange)) {
		return selectedOption.id;
	}

	const nextOptions = selectedIndex >= 0 ? options.slice(selectedIndex + 1) : options;
	const nextAvailableOption = nextOptions.find((option) => !isPeriodSelectOptionDisabled(option, dateRange));

	return nextAvailableOption?.id ?? options.find((option) => !isPeriodSelectOptionDisabled(option, dateRange))?.id;
}

export function normalizePeriodSelectDateRangeConnectors(value: unknown): PeriodSelectDateRangeConnectors | undefined {
	if (!isRecord(value)) {
		return undefined;
	}

	const startConnector = normalizeText(value.start);
	const endConnector = normalizeText(value.end);

	return startConnector && endConnector ? { start: startConnector, end: endConnector } : undefined;
}
