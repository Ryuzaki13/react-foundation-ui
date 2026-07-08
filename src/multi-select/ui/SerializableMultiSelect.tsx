import type { CollectionItem } from "@ryuzaki13/react-foundation-lib/odata";

import { MultiSelect } from "./MultiSelect";

import type { UiBaseProps } from "../../types";

type SerializableOptionRecord = Record<string, unknown>;

type SerializableOptionKeyField<TOption extends SerializableOptionRecord> = {
	[K in keyof TOption]: Extract<TOption[K], string> extends never ? never : K;
}[keyof TOption];

export interface SerializableMultiSelectProps<
	TOption extends SerializableOptionRecord,
	TOptionKey extends SerializableOptionKeyField<TOption>,
	TOptionLabel extends keyof TOption
> extends UiBaseProps<Extract<TOption[TOptionKey], string>[]> {
	options: readonly TOption[];
	optionKey: TOptionKey;
	optionLabel: TOptionLabel;
	renderCode?: true;
}

function getSerializableOptionKey<TOption extends SerializableOptionRecord, TOptionKey extends SerializableOptionKeyField<TOption>>(
	option: TOption,
	optionKey: TOptionKey
): Extract<TOption[TOptionKey], string> {
	return option[optionKey] as Extract<TOption[TOptionKey], string>;
}

function getSerializableOptionLabel<
	TOption extends SerializableOptionRecord,
	TOptionKey extends SerializableOptionKeyField<TOption>,
	TOptionLabel extends keyof TOption
>(option: TOption, optionLabel: TOptionLabel, optionKey: TOptionKey): string {
	const label = option[optionLabel];

	if (typeof label === "string") {
		return label;
	}

	const key = getSerializableOptionKey(option, optionKey);
	return typeof key === "string" ? key : String(key);
}

export function SerializableMultiSelect<
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
	renderCode
}: SerializableMultiSelectProps<TOption, TOptionKey, TOptionLabel>) {
	// Как будто можно не мемоизировать, нет смысла
	const items = options.map<CollectionItem>((option) => ({
		key: String(getSerializableOptionKey(option, optionKey)),
		text: getSerializableOptionLabel(option, optionLabel, optionKey)
	}));
	const selectedKeys = new Set((value ?? []).map((item) => String(item)));
	const selectedItems = items.filter((item) => selectedKeys.has(item.key));

	return (
		<MultiSelect
			label={label}
			description={description}
			disabled={disabled}
			placeholder={placeholder}
			size={size}
			items={items}
			codeKey="key"
			textKey="text"
			hideCode={renderCode ? undefined : true}
			value={selectedItems}
			onChange={(nextItems) => onChange(nextItems.map((item) => item.key) as Extract<TOption[TOptionKey], string>[])}
		/>
	);
}
