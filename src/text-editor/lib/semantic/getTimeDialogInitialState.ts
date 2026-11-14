import { TIME_DIALOG_MODE_DATETIME, TIME_DIALOG_MODE_TIME, TIME_DIALOG_MODE_DATE } from "../../model/timeDialogModeConstants";
import { type TimeDialogInitialState, type TimeMode } from "../../model/timeDialogState";

/** Восстанавливает поля существующего time без переписывания сохранённого значения. */
export function getTimeDialogInitialState(value: string | undefined): TimeDialogInitialState {
	if (!value) return {};
	const [from, to] = value.split("/");
	const single = from.includes("T") ? TIME_DIALOG_MODE_DATETIME : from.includes(":") ? TIME_DIALOG_MODE_TIME : TIME_DIALOG_MODE_DATE;
	const mode: TimeMode = to ? `range-${single}` : single;
	return { mode, from, to: to ?? "" };
}
