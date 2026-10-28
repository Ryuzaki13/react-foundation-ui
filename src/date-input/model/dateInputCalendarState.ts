import { type DateInputSelectionMode, type DatePickerLevel } from "../lib";

export type DateInputCalendarState = {
	readonly view: DatePickerLevel;
	readonly selectionMode: DateInputSelectionMode;
	readonly minDatePickerLevel: DatePickerLevel;
};
