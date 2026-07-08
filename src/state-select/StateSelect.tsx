import { CSSProperties, ReactNode, useMemo } from "react";

import { DEFAULT_VALUE_STATES, VALUE_STATE_COLOR_TOKENS } from "@ryuzaki13/react-foundation-lib/formatters";
import { State } from "@ryuzaki13/react-foundation-lib/types";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { Select, SelectProps } from "../select";
import { UiBaseProps } from "../types";

import styles from "./StateSelect.module.scss";

export type StateMeta = {
	label?: ReactNode;
	icon?: ReactNode;
};

export interface StateSelectProps extends Omit<UiBaseProps<State | undefined>, "placeholder"> {
	placeholder?: string;
	options?: readonly State[];
	stateMeta?: Partial<Record<State, StateMeta>>;
	className?: string;
	clearable?: boolean;
}

interface StateSwatchProps {
	state: State;
	className?: string;
}

function StateSwatch({ state, className }: StateSwatchProps) {
	return (
		<span
			className={cn(styles.swatch, className)}
			data-empty={state === "none" ? "" : undefined}
			style={{ "--state-color": VALUE_STATE_COLOR_TOKENS[state] } as CSSProperties}
		/>
	);
}

function hasStateMeta(meta: StateMeta | undefined): boolean {
	return Boolean(meta?.icon || meta?.label);
}

function resolveStateAriaLabel(state: State, meta: StateMeta | undefined): string {
	if (typeof meta?.label === "string" && meta.label.trim()) {
		return meta.label;
	}

	return state || "empty";
}

function renderStateMeta(meta: StateMeta | undefined) {
	if (!hasStateMeta(meta)) {
		return null;
	}

	return (
		<span className={styles.optionMeta}>
			{meta?.icon ? <span className={styles.optionMetaIcon}>{meta.icon}</span> : null}
			{meta?.label ? <span className={styles.optionMetaLabel}>{meta.label}</span> : null}
		</span>
	);
}

function renderStateValue(state: State, meta: StateMeta | undefined) {
	return (
		<div className={styles.valueContainer}>
			<StateSwatch state={state} />
			{renderStateMeta(meta)}
		</div>
	);
}

/**
 * Специализированный селект для выбора цветового или статусного состояния. Используется там, где значению соответствует визуальный swatch.
 */
export function StateSelect({
	label,
	description,
	disabled,
	placeholder,
	size,
	value,
	onChange,
	options = DEFAULT_VALUE_STATES,
	stateMeta,
	className,
	clearable
}: StateSelectProps) {
	const stateOptions = useMemo(() => Array.from(new Set(options)), [options]);
	const hasDetailedOptions = stateOptions.some((stateOption) => hasStateMeta(stateMeta?.[stateOption]));

	const sharedSelectProps: Pick<
		SelectProps<State, State | undefined>,
		| "getOptionKey"
		| "getOptionLabel"
		| "getOptionAriaLabel"
		| "renderValue"
		| "renderOption"
		| "buttonClassName"
		| "optionsContentClassName"
		| "getOptionClassName"
	> = {
		getOptionKey: (stateOption) => stateOption || "__empty_state__",
		getOptionLabel: (stateOption) => stateMeta?.[stateOption]?.label ?? stateOption,
		getOptionAriaLabel: (stateOption) => resolveStateAriaLabel(stateOption, stateMeta?.[stateOption]),
		renderValue: (stateOption) => renderStateValue(stateOption, stateMeta?.[stateOption]),
		renderOption: (stateOption) => (
			<>
				<StateSwatch state={stateOption} />
				{hasDetailedOptions ? renderStateMeta(stateMeta?.[stateOption]) : null}
			</>
		),
		buttonClassName: styles.button,
		optionsContentClassName: cn(/*styles.options,*/ hasDetailedOptions ? styles.optionsDetailed : styles.optionsPalette),
		getOptionClassName: () => cn(styles.option, hasDetailedOptions ? styles.optionDetailed : styles.optionPalette)
	};

	return (
		<Select<State, State | undefined>
			label={label}
			description={description}
			disabled={disabled}
			placeholder={placeholder}
			size={size}
			value={value}
			onChange={onChange}
			options={stateOptions}
			className={className}
			clearable={clearable}
			{...sharedSelectProps}
		/>
	);
}
