import {
	type TIME_DIALOG_MODE_DATE,
	type TIME_DIALOG_MODE_DATETIME,
	type TIME_DIALOG_MODE_TIME,
	type TIME_DIALOG_MODE_RANGE_TIME,
	type TIME_DIALOG_MODE_RANGE_DATE,
	type TIME_DIALOG_MODE_RANGE_DATETIME
} from "./timeDialogModeConstants";
/** Поддерживаемые режимы действующего time-диалога; формат сохранения не меняется. */
export type TimeMode =
	| typeof TIME_DIALOG_MODE_DATE
	| typeof TIME_DIALOG_MODE_DATETIME
	| typeof TIME_DIALOG_MODE_TIME
	| typeof TIME_DIALOG_MODE_RANGE_TIME
	| typeof TIME_DIALOG_MODE_RANGE_DATE
	| typeof TIME_DIALOG_MODE_RANGE_DATETIME;

export type TimeDialogInitialState = { mode?: TimeMode; from?: string; to?: string };
