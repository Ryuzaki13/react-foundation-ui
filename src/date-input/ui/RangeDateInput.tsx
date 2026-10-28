import { type DateRangeInputProps } from "../lib/dateInputProps";

import { DateInputControl } from "./DateInputControl";

type RangeDateInputProps = Omit<DateRangeInputProps, "selectsRange">;

/** Диапазон использует тот же ввод; незавершённый календарный выбор хранится внутри поля. */
export function RangeDateInput(props: RangeDateInputProps) {
	return <DateInputControl {...props} selectsRange />;
}
