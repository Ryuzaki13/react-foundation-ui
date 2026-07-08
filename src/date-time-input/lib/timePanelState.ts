import { getTimeRangeForDay } from "./dateTimeValue";

import type { DateTimeInputMode } from "./dateTimeValue";

/**
 * Состояние и доступные значения для панели выбора времени.
 */
export interface TimePanelState {
	disabled: boolean;
	selectedHour: number;
	selectedMinute: number;
	hours: number[];
	minutes: number[];
}

/**
 * Собирает состояние часов и минут для панели выбора времени.
 */
export function buildTimePanelState(value: Date, minDate?: Date, maxDate?: Date, mode: DateTimeInputMode = "date-time"): TimePanelState {
	const timeRange = getTimeRangeForDay(value, minDate, maxDate, mode);
	const selectedHour = value.getHours();
	const selectedMinute = value.getMinutes();
	const minuteMin = timeRange.minMinuteByHour(selectedHour);
	const minuteMax = timeRange.maxMinuteByHour(selectedHour);

	if (timeRange.disabled) {
		return {
			disabled: true,
			selectedHour,
			selectedMinute,
			hours: [],
			minutes: []
		};
	}

	return {
		disabled: false,
		selectedHour,
		selectedMinute,
		hours: Array.from({ length: timeRange.maxHour - timeRange.minHour + 1 }, (_, index) => timeRange.minHour + index),
		minutes: Array.from({ length: minuteMax - minuteMin + 1 }, (_, index) => minuteMin + index)
	};
}
