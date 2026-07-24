import React, { createContext, KeyboardEvent, ReactNode, useCallback, useContext, useId, useLayoutEffect, useMemo, useState } from "react";

import { cn, getRovingFocusTargetIndex, handleKeyboardActivation } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../ui.module.scss";

import styles from "./RadioGroup.module.scss";

interface RadioGroupContextValue {
	value?: unknown;
	onChange?: (value: unknown) => void;
	disabled?: boolean;
	orientation: "vertical" | "horizontal";
	groupId: string;
	labelId?: string;
	descriptionId?: string;
	firstOptionId?: string;
	registerOption: (optionId: string) => () => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

interface RadioGroupProps<T> {
	value?: T;
	onChange?: (value: T) => void;
	label?: string;
	description?: string;
	disabled?: boolean;
	className?: string;
	noWrap?: true;
	orientation?: "vertical" | "horizontal";
	"aria-label"?: string;
	children: React.ReactNode;
}

/**
 * Группа радиокнопок с общим состоянием выбранного значения. Обеспечивает единый API выбора и контекст для дочерних опций.
 */
export function RadioGroup<T>({
	value,
	onChange,
	label,
	description,
	disabled,
	className,
	noWrap,
	orientation = "horizontal",
	"aria-label": ariaLabel,
	children
}: RadioGroupProps<T>) {
	const groupId = useId();
	const labelId = label ? `${groupId}-label` : undefined;
	const descriptionId = description ? `${groupId}-description` : undefined;
	const [registeredOptionIds, setRegisteredOptionIds] = useState<string[]>([]);
	const handleChange = useCallback((nextValue: unknown) => onChange?.(nextValue as T), [onChange]);

	/**
	 * Хранит порядок опций внутри группы, чтобы при отсутствии выбранного значения
	 * оставлять ровно один tab stop на первой доступной радиокнопке.
	 */
	const registerOption = useCallback((optionId: string) => {
		setRegisteredOptionIds((currentIds) => (currentIds.includes(optionId) ? currentIds : [...currentIds, optionId]));

		return () => {
			setRegisteredOptionIds((currentIds) => currentIds.filter((currentId) => currentId !== optionId));
		};
	}, []);

	const contextValue = useMemo(
		() => ({
			value,
			onChange: handleChange,
			disabled,
			orientation,
			groupId,
			labelId,
			descriptionId,
			firstOptionId: registeredOptionIds[0],
			registerOption
		}),
		[descriptionId, disabled, groupId, handleChange, labelId, orientation, registerOption, registeredOptionIds, value]
	);

	return (
		<div className={cn(uiStyles.uiElement, disabled && uiStyles.disabled, className)}>
			{label && (
				<div id={labelId} className={uiStyles.uiLabel}>
					{label}
				</div>
			)}
			{description && (
				<div id={descriptionId} className={uiStyles.uiDescription}>
					{description}
				</div>
			)}

			<RadioGroupContext.Provider value={contextValue}>
				<div
					role="radiogroup"
					aria-labelledby={labelId}
					aria-label={labelId ? undefined : ariaLabel}
					aria-describedby={descriptionId}
					aria-disabled={disabled || undefined}
					data-disabled={disabled || undefined}
					className={cn(uiStyles.uiInputControl, styles.radioGroup, noWrap && styles.noWrap, styles[orientation])}>
					{children}
				</div>
			</RadioGroupContext.Provider>
		</div>
	);
}

interface OptionProps<T> {
	value: T;
	label: ReactNode;
	description?: ReactNode;
	className?: string;
}

/**
 * Опция внутри `RadioGroup`, представляющая одно выбираемое значение. Отрисовывает подпись, описание и состояние выбора.
 */
export function Option<T>({ value, label, description, className }: OptionProps<T>) {
	const context = useContext(RadioGroupContext);
	const optionId = useId();
	const registerOption = context?.registerOption;

	useLayoutEffect(() => {
		if (!registerOption) {
			return;
		}

		return registerOption(optionId);
	}, [registerOption, optionId]);

	if (!context) {
		return (
			<div className={cn(styles.radioItem, className)}>
				<p className="textNoWrap">{label}</p>
				{description && <div className="fontSizeSm content2">{description}</div>}
			</div>
		);
	}

	const isChecked = Object.is(context.value, value);
	const isDisabled = context.disabled === true;
	const isFallbackTabStop = context.value === undefined && context.firstOptionId === optionId;

	const handleChange = () => {
		if (isDisabled || isChecked) {
			return;
		}

		context.onChange?.(value);
	};

	// TODO: логика переиспользуемая, надо вынести в хук
	const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		if (isDisabled) {
			return;
		}

		if (handleKeyboardActivation(event, handleChange)) {
			return;
		}

		const currentTarget = event.currentTarget;
		const groupElement = currentTarget.closest<HTMLElement>('[role="radiogroup"]');
		const radioItems = Array.from(groupElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([disabled])') ?? []);

		if (!radioItems.length) {
			return;
		}

		const currentIndex = radioItems.indexOf(currentTarget);
		if (currentIndex === -1) {
			return;
		}

		const nextIndex = getRovingFocusTargetIndex({
			currentIndex,
			itemCount: radioItems.length,
			key: event.key,
			orientation: context.orientation
		});

		if (nextIndex === null) {
			return;
		}

		event.preventDefault();
		radioItems[nextIndex]?.focus();
		radioItems[nextIndex]?.click();
	};

	return (
		<button
			id={`${context.groupId}-option-${optionId}`}
			type="button"
			role="radio"
			aria-checked={isChecked}
			disabled={isDisabled}
			tabIndex={isChecked || isFallbackTabStop ? 0 : -1}
			className={cn(styles.radioItem, isChecked && styles.checked, className)}
			data-ui="radio-option"
			data-action="select-radio-option"
			onClick={handleChange}
			onKeyDown={handleKeyDown}>
			<p className="textNoWrap">{label}</p>
			{description && <div className="fontSizeSm">{description}</div>}
		</button>
	);
}

RadioGroup.Option = Option;
