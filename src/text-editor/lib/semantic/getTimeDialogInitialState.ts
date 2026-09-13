import { type TimeDialogInitialState, type TimeMode } from "../../model/timeDialogState";

/** Восстанавливает поля существующего time без переписывания сохранённого значения. */
export function getTimeDialogInitialState(value: string | undefined): TimeDialogInitialState {
	if (!value) return {};
	const [from, to] = value.split("/");
	const single = from.includes("T") ? "datetime" : from.includes(":") ? "time" : "date";
	const mode: TimeMode = to ? `range-${single}` : single;
	return { mode, from, to: to ?? "" };
}
