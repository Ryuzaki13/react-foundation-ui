import { ReactNode } from "react";

import { getPresetOption, type PresetOption } from "@ryuzaki13/react-foundation-lib/presets";

import { Select, type SelectOptionState } from "../select";

import type { UiBaseProps } from "../types";

export interface PresetSelectProps<TOption extends PresetOption> extends UiBaseProps<TOption["id"] | undefined> {
	options: readonly TOption[];
	getOptionDisabled?: (option: TOption) => boolean;
	getOptionCode?: (option: TOption) => ReactNode;
	getOptionAriaLabel?: (option: TOption) => string;
	renderOption?: (option: TOption, state: SelectOptionState) => ReactNode;
	renderValue?: (option: TOption) => ReactNode;
	className?: string;
	buttonClassName?: string;
	optionsClassName?: string;
	clearable?: boolean;
}

/**
 * Базовый Select для пресетов с контрактом `id/label`.
 */
export function PresetSelect<TOption extends PresetOption>({
	options,
	value,
	onChange,
	getOptionDisabled,
	getOptionCode,
	getOptionAriaLabel,
	renderOption,
	renderValue,
	className,
	buttonClassName,
	optionsClassName,
	clearable,
	...props
}: PresetSelectProps<TOption>) {
	const selectedOption = getPresetOption(value, options) ?? undefined;

	return (
		<Select<TOption, TOption | undefined>
			{...props}
			options={options}
			value={selectedOption}
			onChange={(option) => onChange(option?.id)}
			getOptionKey={(option) => option.id}
			getOptionLabel={(option) => option.label}
			getOptionCode={getOptionCode}
			getOptionDisabled={getOptionDisabled}
			getOptionAriaLabel={getOptionAriaLabel}
			renderOption={renderOption}
			renderValue={renderValue}
			className={className}
			buttonClassName={buttonClassName}
			optionsClassName={optionsClassName}
			clearable={clearable}
		/>
	);
}
