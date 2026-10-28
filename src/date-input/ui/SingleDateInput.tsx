import { type DateSingleInputProps } from "../lib/dateInputProps";

import { DateInputControl } from "./DateInputControl";

type SingleDateInputProps = Omit<DateSingleInputProps, "selectsRange">;

/** Ввод одной даты с общей календарной навигацией и необязательной очисткой. */
export function SingleDateInput(props: SingleDateInputProps) {
	return <DateInputControl {...props} />;
}
