import { describe, expect, it } from "vitest";

import {
	DEFAULT_DATE_RANGE_PRESET_OPTIONS,
	normalizeDateRangePresetIds,
	resolveDateRangePresetIdByRange,
	resolveDateRangePresetOptionsByIds,
	resolveDateRangePresetPayload
} from "./dateRangePresets";

describe("dateRangePresets", () => {
	it("Возвращает payload по идентификатору пресета", () => {
		const payload = resolveDateRangePresetPayload("today", new Date(2026, 2, 10, 12, 30, 0));

		expect(payload).toEqual({
			id: "today",
			label: "За сегодня",
			range: [new Date(2026, 2, 10, 0, 0, 0), new Date(2026, 2, 10, 23, 59, 59)]
		});
	});

	it("Находит идентификатор пресета по диапазону", () => {
		const presetId = resolveDateRangePresetIdByRange(
			[new Date(2026, 2, 9, 0, 0, 0), new Date(2026, 2, 9, 23, 59, 59)],
			new Date(2026, 2, 10, 12, 30, 0)
		);

		expect(presetId).toBe("yesterday");
	});

	it("Возвращает null для диапазона без совпадающего пресета", () => {
		const presetId = resolveDateRangePresetIdByRange(
			[new Date(2026, 2, 8, 0, 0, 0), new Date(2026, 2, 9, 23, 59, 59)],
			new Date(2026, 2, 10, 12, 30, 0)
		);

		expect(presetId).toBeNull();
	});

	it("по умолчанию не включает пресет месяц назад", () => {
		expect(DEFAULT_DATE_RANGE_PRESET_OPTIONS.map((option) => option.id)).toEqual([
			"monthStartToYesterday",
			"monthStartToToday",
			"today",
			"yesterday"
		]);
	});

	it("формирует список пресетов по сохраненным id и сохраняет порядок", () => {
		const options = resolveDateRangePresetOptionsByIds(["monthAgo", "today", "monthAgo", "unknown"]);

		expect(options.map((option) => option.id)).toEqual(["monthAgo", "today"]);
	});

	it("нормализует сохраненные id пресетов", () => {
		expect(normalizeDateRangePresetIds(["today", "unknown", "today", "monthAgo"])).toEqual(["today", "monthAgo"]);
		expect(normalizeDateRangePresetIds(undefined, ["yesterday"])).toEqual(["yesterday"]);
		expect(normalizeDateRangePresetIds([], ["yesterday"])).toEqual([]);
	});
});
