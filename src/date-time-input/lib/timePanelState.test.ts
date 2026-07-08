import { describe, expect, it } from "vitest";

import { createTimeOnlyBaseDate } from "./dateTimeValue";
import { buildTimePanelState } from "./timePanelState";

describe("buildTimePanelState", () => {
	it("возвращает полный набор часов и минут для обычного дня", () => {
		const state = buildTimePanelState(new Date(2026, 2, 10, 12, 30, 0, 0));

		expect(state.disabled).toBe(false);
		expect(state.hours[0]).toBe(0);
		expect(state.hours.at(-1)).toBe(23);
		expect(state.minutes[0]).toBe(0);
		expect(state.minutes.at(-1)).toBe(59);
	});

	it("сужает часы и минуты по minDate/maxDate на том же дне", () => {
		const state = buildTimePanelState(
			new Date(2026, 2, 10, 9, 30, 0, 0),
			new Date(2026, 2, 10, 9, 15, 0, 0),
			new Date(2026, 2, 10, 18, 30, 0, 0)
		);

		expect(state.hours[0]).toBe(9);
		expect(state.hours.at(-1)).toBe(18);
		expect(state.minutes[0]).toBe(15);
		expect(state.minutes.at(-1)).toBe(59);
	});

	it("помечает состояние недоступным, если в дне нет допустимого времени", () => {
		const state = buildTimePanelState(
			new Date(2026, 2, 10, 9, 30, 0, 0),
			new Date(2026, 2, 10, 9, 45, 0, 0),
			new Date(2026, 2, 10, 9, 15, 0, 0)
		);

		expect(state.disabled).toBe(true);
		expect(state.hours).toEqual([]);
	});

	it("учитывает ограничения только по времени суток в режиме time", () => {
		const state = buildTimePanelState(
			new Date(2035, 2, 10, 9, 30, 0, 0),
			new Date(2026, 2, 10, 9, 15, 45, 0),
			new Date(2026, 2, 10, 18, 30, 0, 0),
			"time"
		);

		expect(state.disabled).toBe(false);
		expect(state.selectedHour).toBe(9);
		expect(state.selectedMinute).toBe(30);
		expect(state.hours[0]).toBe(9);
		expect(state.hours.at(-1)).toBe(18);
	});

	it("сохраняет техническую дату при работе в режиме time", () => {
		const state = buildTimePanelState(createTimeOnlyBaseDate(12, 45), undefined, undefined, "time");

		expect(state.selectedHour).toBe(12);
		expect(state.selectedMinute).toBe(45);
	});
});
