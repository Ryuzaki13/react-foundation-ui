import { describe, expect, it } from "vitest";

import { getTimeDialogInitialState } from "./getTimeDialogInitialState";
import { isSemanticDateTime } from "./isSemanticDateTime";

describe("календарные значения semantic dialog", () => {
	it.each([
		"2024-02-29",
		"2026-09-13",
		"09:30",
		"23:59:59",
		"2026-09-13T12:30",
		"2026-09-13T12:30:00+05:00",
		"09:00/18:00",
		"2026-01-01/2026-02-01"
	])("принимает %s", (value) => {
		expect(isSemanticDateTime(value)).toBe(true);
	});
	it.each([
		"",
		"2026-99-99",
		"2026-02-29",
		"2024-02-30",
		"2026-04-31",
		"25:00",
		"09:60",
		"2026-09-13T24:00",
		"2026-02-30T12:00:00Z",
		"2026-09-13T12:00:00+99:00",
		"09:00/",
		"/09:00",
		"09:00/10:00/11:00"
	])("отклоняет %s", (value) => {
		expect(isSemanticDateTime(value)).toBe(false);
	});
	it.each([
		["2026-09-13", "date", "2026-09-13", ""],
		["09:00/18:00", "range-time", "09:00", "18:00"],
		["2026-09-13T09:00/2026-09-14T18:00", "range-datetime", "2026-09-13T09:00", "2026-09-14T18:00"]
	])("восстанавливает режим %s", (value, mode, from, to) => {
		expect(getTimeDialogInitialState(value)).toEqual({ mode, from, to });
	});
});
