import { type ComponentProps } from "react";

import {
	DEFAULT_STRING_TOGGLE_CHECKED_VALUE,
	DEFAULT_STRING_TOGGLE_UNCHECKED_VALUE,
	resolveStringToggleStateValue
} from "./stringToggleState";
import { Toggle } from "./Toggle";

/**
 * Публичный контракт Toggle, который принимает и возвращает два настраиваемых
 * строковых значения вместо boolean.
 */
export type StringToggleProps = Omit<ComponentProps<typeof Toggle>, "value" | "onChange"> & {
	checkedValue?: string;
	uncheckedValue?: string;
	value: string;
	onChange: (value: string) => void;
};

/**
 * Адаптирует boolean-состояние Toggle к паре настраиваемых строковых значений.
 */
export function StringToggle({
	value,
	onChange,
	checkedValue: configuredCheckedValue,
	uncheckedValue: configuredUncheckedValue,
	defaultChecked: _defaultChecked,
	...props
}: StringToggleProps) {
	/*
	 * StringToggle является controlled-компонентом: визуальное состояние всегда
	 * определяется `value`, поэтому native defaultChecked не передаётся в input.
	 */
	void _defaultChecked;

	const checkedValue = resolveStringToggleStateValue(configuredCheckedValue, DEFAULT_STRING_TOGGLE_CHECKED_VALUE);
	const uncheckedValue = resolveStringToggleStateValue(configuredUncheckedValue, DEFAULT_STRING_TOGGLE_UNCHECKED_VALUE);
	const isChecked = value === checkedValue;

	return <Toggle {...props} value={isChecked} onChange={(checked) => onChange(checked ? checkedValue : uncheckedValue)} />;
}
