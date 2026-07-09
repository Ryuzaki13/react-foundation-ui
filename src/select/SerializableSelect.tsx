import { Select } from "./Select";

import type { UiBaseProps } from "../types";
import type { SelectOptionKey } from "./Select";

type SerializableOptionRecord = Record<string, unknown>;

type SerializableOptionKeyField<TOption extends SerializableOptionRecord> = {
	[K in keyof TOption]: Extract<TOption[K], SelectOptionKey> extends never ? never : K;
}[keyof TOption];

type SerializableOptionValue<TOption extends SerializableOptionRecord, TOptionKey extends SerializableOptionKeyField<TOption>> = Extract<
	TOption[TOptionKey],
	SelectOptionKey
>;

export interface SerializableSelectProps<
	TOption extends SerializableOptionRecord,
	TOptionKey extends SerializableOptionKeyField<TOption>,
	TOptionLabel extends keyof TOption
> extends Omit<UiBaseProps<SerializableOptionValue<TOption, TOptionKey> | undefined>, "onChange"> {
	options: readonly TOption[];
	onChange: (value: SerializableOptionValue<TOption, TOptionKey> | undefined) => void;
	optionKey: TOptionKey;
	optionLabel: TOptionLabel;
	renderCode?: true;
	className?: string;
	clearable?: boolean;
}

function getSerializableOptionKey<TOption extends SerializableOptionRecord, TOptionKey extends SerializableOptionKeyField<TOption>>(
	option: TOption,
	optionKey: TOptionKey
): Extract<TOption[TOptionKey], SelectOptionKey> {
	return option[optionKey] as Extract<TOption[TOptionKey], SelectOptionKey>;
}

function getSerializableOptionLabel<
	TOption extends SerializableOptionRecord,
	TOptionKey extends SerializableOptionKeyField<TOption>,
	TOptionLabel extends keyof TOption
>(option: TOption, optionLabel: TOptionLabel, optionKey: TOptionKey): string | number {
	const label = option[optionLabel];

	if (typeof label === "string" || typeof label === "number") {
		return label;
	}

	const key = getSerializableOptionKey(option, optionKey);
	return typeof key === "string" || typeof key === "number" ? key : String(key);
}

export function SerializableSelect<
	TOption extends SerializableOptionRecord,
	TOptionKey extends SerializableOptionKeyField<TOption>,
	TOptionLabel extends keyof TOption
>({
	label,
	description,
	disabled,
	placeholder,
	size,
	options,
	value,
	onChange,
	optionKey,
	optionLabel,
	renderCode,
	className,
	clearable
}: SerializableSelectProps<TOption, TOptionKey, TOptionLabel>) {
	const selectedOption =
		value === undefined ? undefined : options.find((option) => getSerializableOptionKey(option, optionKey) === value);

	return (
		<Select
			label={label}
			description={description}
			disabled={disabled}
			placeholder={placeholder}
			size={size}
			options={options}
			value={selectedOption}
			onChange={(option: TOption | undefined) => onChange(option ? getSerializableOptionKey(option, optionKey) : undefined)}
			getOptionKey={(option: TOption) => getSerializableOptionKey(option, optionKey)}
			getOptionLabel={(option: TOption) => getSerializableOptionLabel(option, optionLabel, optionKey)}
			getOptionCode={renderCode ? (option: TOption) => getSerializableOptionKey(option, optionKey) : undefined}
			className={className}
			clearable={clearable}
		/>
	);
}
