import { ReactNode } from "react";

import { InputType } from "@ryuzaki13/react-foundation-lib/types";

import { UiBaseProps } from "../types";

export interface PickerFieldProps<TValue extends InputType = InputType> extends Omit<UiBaseProps<TValue>, "value" | "onChange"> {
	id?: string;
	className?: string;
	error?: string;
	children: (context: PickerFieldContext) => ReactNode;
}

export interface PickerFieldContext {
	controlId: string;
	labelId?: string;
	descriptionId?: string;
	errorId?: string;
	describedBy?: string;
}
