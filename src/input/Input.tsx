import React, { CSSProperties, InputHTMLAttributes, ReactNode, useEffect, useEffectEvent, useState } from "react";

import { XIcon } from "lucide-react";

import { toFiniteNumber } from "@ryuzaki13/react-foundation-lib/formatters";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { UiBaseProps, UiSize } from "../types";
import uiStyles from "../ui.module.scss";

import styles from "./Input.module.scss";
import { useInputFieldIds } from "./lib/useInputFieldIds";

export interface InputUIProps extends Omit<UiBaseProps<never>, "value" | "onChange"> {
	className?: string;
	error?: string;
	controlId?: string;
	labelId?: string;
	descriptionId?: string;
	errorId?: string;
	children: React.ReactNode;
}

export interface InputControlRenderProps {
	controlClassName?: string;
}

export interface InputControlProps {
	className?: string;
	endAdornment?: ReactNode;
	endAdornmentClassName?: string;
	endAdornmentWidth?: string;
	children: (props: InputControlRenderProps) => ReactNode;
}

export interface InputClearButtonProps {
	onClick?: () => void;
	disabled?: boolean;
	className?: string;
	ariaLabel?: string;
}

function InputLabel({ label, controlId, labelId }: { label: React.ReactNode; controlId?: string; labelId?: string }) {
	return (
		<label id={labelId} htmlFor={controlId} className={uiStyles.uiLabel}>
			{label}
		</label>
	);
}

export function InputUILoading({
	label,
	description,
	size,
	disabled,
	className
}: Pick<InputUIProps, "label" | "description" | "size" | "disabled" | "className">) {
	const { controlId, labelId, descriptionId } = useInputFieldIds({
		hasLabel: label !== undefined && label !== null,
		hasDescription: !!description
	});

	return (
		<div
			className={cn(uiStyles.uiElement, uiStyles.uiSizable, size && uiStyles[size as UiSize], uiStyles.disabled, className)}
			aria-disabled={disabled || undefined}>
			{label && <InputLabel label={label} controlId={controlId} labelId={labelId} />}
			{description && (
				<p id={descriptionId} className={uiStyles.uiDescription}>
					{description}
				</p>
			)}
			<div className={cn(uiStyles.uiInputControlFake, "skeletonLine")} />
		</div>
	);
}

/**
 * Низкоуровневая оболочка поля ввода с общими элементами оформления.
 */
export function InputUI({
	label,
	description,
	disabled,
	className,
	error,
	size,
	controlId,
	labelId,
	descriptionId,
	errorId,
	children
}: InputUIProps) {
	return (
		<div
			className={cn(
				uiStyles.uiElement,
				uiStyles.uiSizable,
				size && uiStyles[size as UiSize],
				disabled && uiStyles.disabled,
				className
			)}
			aria-disabled={disabled || undefined}>
			{label && <InputLabel label={label} controlId={controlId} labelId={labelId} />}
			{description && (
				<p id={descriptionId} className={uiStyles.uiDescription}>
					{description}
				</p>
			)}
			<div className={styles.controlLayout}>
				{children}

				{error && (
					<p id={errorId} className={styles.error} role="alert">
						{error}
					</p>
				)}
			</div>
		</div>
	);
}

export function InputControl({ className, endAdornment, endAdornmentClassName, endAdornmentWidth, children }: InputControlProps) {
	const hasEndAdornment = endAdornment !== undefined && endAdornment !== null;
	const style =
		hasEndAdornment && endAdornmentWidth ? ({ "--input-end-adornment-width": endAdornmentWidth } as CSSProperties) : undefined;

	return (
		<div className={cn(styles.controlLayout, className)} style={style}>
			{children({ controlClassName: hasEndAdornment ? styles.controlWithEndAdornment : undefined })}
			{hasEndAdornment && <div className={cn(styles.controlEndAdornment, endAdornmentClassName)}>{endAdornment}</div>}
		</div>
	);
}

export function InputClearButton({ onClick, disabled, className, ariaLabel = "Очистить значение" }: InputClearButtonProps) {
	return (
		<button
			type="button"
			disabled={disabled || !onClick}
			className={cn(styles.clearButton, "flexCenter radiusSm", className)}
			onClick={onClick}
			aria-label={ariaLabel}>
			<XIcon />
		</button>
	);
}

function resolveEndAdornmentWidth(hasAdornment: boolean, hasClearAction: boolean, explicitWidth?: string) {
	if (explicitWidth) {
		return explicitWidth;
	}

	if (hasAdornment && hasClearAction) {
		return "calc((var(--control-height) * 2) + var(--space-xs))";
	}

	if (hasAdornment || hasClearAction) {
		return "var(--control-height)";
	}

	return undefined;
}

function createEndAdornment({ endAdornment, onClear, disabled }: { endAdornment?: ReactNode; onClear?: () => void; disabled?: boolean }) {
	if ((endAdornment === undefined || endAdornment === null) && !onClear) {
		return undefined;
	}

	return (
		<div className={styles.endAdornmentGroup}>
			{endAdornment}
			{onClear && <InputClearButton onClick={onClear} disabled={disabled} />}
		</div>
	);
}

export interface BaseInputProps<T extends number | string, V = T>
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "type" | "defaultValue" | "onChange">, UiBaseProps<T, V> {
	onClear?: () => void;
	error?: string;
	onClearError?: () => void;
	defaultValue?: T;
	endAdornment?: ReactNode;
	endAdornmentClassName?: string;
	endAdornmentWidth?: string;
}

export interface InputTextProps extends BaseInputProps<string> {
	type?: "email" | "password" | "search" | "tel" | "text" | "url";

	/**
	 * Регулярное выражение для валидации всего введённого значения.
	 * При несоответствии поле подсвечивается как невалидное, но текст не удаляется.
	 * Пример: `/^\d*$/`
	 */
	allowedPattern?: RegExp;
}

/**
 * Базовое текстовое поле ввода для строковых значений.
 */
export function InputText({
	label,
	description,
	disabled,
	className,
	onClear,
	error,
	onClearError,
	onChange,
	value,
	size,
	allowedPattern,
	endAdornment,
	endAdornmentClassName,
	endAdornmentWidth,
	type = "text",
	...props
}: InputTextProps) {
	const [internalInvalid, setInternalInvalid] = useState(false);

	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;

		if (allowedPattern !== undefined) {
			setInternalInvalid(newValue !== "" && !allowedPattern.test(newValue));
		}

		onChange?.(newValue);
		if (error && onClearError) onClearError();
	};

	const hasValue = Boolean(value && value.length > 0);
	const visibleError = hasValue ? error : undefined;
	const { controlId, labelId, descriptionId, errorId, describedBy } = useInputFieldIds({
		id: props.id,
		hasLabel: label !== undefined && label !== null,
		hasDescription: !!description,
		hasError: !!visibleError
	});
	const isInvalid = hasValue && (!!error || internalInvalid);
	const resolvedEndAdornment = createEndAdornment({ endAdornment, onClear, disabled });
	const hasCustomAdornment = endAdornment !== undefined && endAdornment !== null;
	const resolvedEndAdornmentWidth = resolveEndAdornmentWidth(hasCustomAdornment, !!onClear, endAdornmentWidth);

	return (
		<InputUI
			label={label}
			description={description}
			disabled={disabled}
			className={className}
			size={size}
			error={visibleError}
			controlId={controlId}
			labelId={labelId}
			descriptionId={descriptionId}
			errorId={errorId}>
			<InputControl
				endAdornment={resolvedEndAdornment}
				endAdornmentClassName={endAdornmentClassName}
				endAdornmentWidth={resolvedEndAdornmentWidth}>
				{({ controlClassName }) => (
					<input
						{...props}
						id={controlId}
						type={type}
						disabled={disabled}
						value={value}
						aria-invalid={isInvalid || undefined}
						aria-labelledby={labelId}
						aria-describedby={describedBy}
						data-invalid={isInvalid ? "" : undefined}
						className={cn(uiStyles.uiInputControl, styles.input, controlClassName)}
						onChange={handleInput}
					/>
				)}
			</InputControl>
		</InputUI>
	);
}

/**
 * Числовое поле ввода с нормализацией значения и защитой от промежуточного невалидного ввода.
 */
export function InputNumber({
	label,
	description,
	disabled,
	className,
	onClear,
	error,
	onClearError,
	onChange,
	value,
	size,
	endAdornment,
	endAdornmentClassName,
	endAdornmentWidth,
	...props
	}: BaseInputProps<number, number | undefined>) {
	const inputProps = props as InputHTMLAttributes<HTMLInputElement>;
	const { controlId, labelId, descriptionId, errorId, describedBy } = useInputFieldIds({
		id: props.id,
		hasLabel: label !== undefined && label !== null,
		hasDescription: !!description,
		hasError: !!error
	});

	const [rawValue, setRawValue] = useState<string>(() => String(value));
	// const [internalInvalid, setInternalInvalid] = useState(false);

	const syncRawValue = useEffectEvent((nextRaw: string) => {
		setRawValue(nextRaw);
		// setInternalInvalid(false);
	});

	useEffect(() => {
		const nextRaw = value !== undefined && typeof value === "number" && !isNaN(value) ? String(value) : "";
		syncRawValue(nextRaw);
	}, [value]);

	const handleClear = onClear
		? () => {
				setRawValue("");
				// setInternalInvalid(false);
				onClear();
			}
		: undefined;

	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		setRawValue(raw);

		const parsed = toFiniteNumber(raw) ?? value ?? 0;
		// const isEmpty = raw.trim() === "";

		// const minNum = min !== undefined ? Number(min) : undefined;
		// const maxNum = max !== undefined ? Number(max) : undefined;
		// const isValidNumber = !isEmpty && !isNaN(parsed);
		// const isInRange = isValidNumber && (minNum === undefined || parsed >= minNum) && (maxNum === undefined || parsed <= maxNum);

		// setInternalInvalid(!isEmpty && (!isValidNumber || !isInRange));

		onChange?.(parsed);
		if (error && onClearError) onClearError();
	};

	// const isInvalid = !!error || internalInvalid;
	const resolvedEndAdornment = createEndAdornment({ endAdornment, onClear: handleClear, disabled });
	const hasCustomAdornment = endAdornment !== undefined && endAdornment !== null;
	const resolvedEndAdornmentWidth = resolveEndAdornmentWidth(hasCustomAdornment, !!handleClear, endAdornmentWidth);

	return (
		<InputUI
			label={label}
			description={description}
			disabled={disabled}
			className={className}
			size={size}
			error={error}
			controlId={controlId}
			labelId={labelId}
			descriptionId={descriptionId}
			errorId={errorId}>
			<InputControl
				endAdornment={resolvedEndAdornment}
				endAdornmentClassName={endAdornmentClassName}
				endAdornmentWidth={resolvedEndAdornmentWidth}>
				{({ controlClassName }) => (
					<input
						{...inputProps}
						id={controlId}
						type="number"
						inputMode="decimal"
						disabled={disabled}
						value={rawValue}
						// aria-invalid={isInvalid || undefined}
						aria-labelledby={labelId}
						aria-describedby={describedBy}
						className={cn(uiStyles.uiInputControl, styles.input, styles.inputNumber, controlClassName)}
						onChange={handleInput}
					/>
				)}
			</InputControl>
		</InputUI>
	);
}

/**
 * Совместимый алиас для `InputText`.
 */
export const Input = InputText;
