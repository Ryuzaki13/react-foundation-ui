/** Поддерживаемые режимы действующего time-диалога; формат сохранения не меняется. */
export type TimeMode = "date" | "datetime" | "time" | "range-time" | "range-date" | "range-datetime";

export type TimeDialogInitialState = { mode?: TimeMode; from?: string; to?: string };
