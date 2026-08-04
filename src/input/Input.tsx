import React, { CSSProperties, InputHTMLAttributes, ReactNode, useLayoutEffect, useRef, useState } from "react";

import { toFiniteNumber } from "@ryuzaki13/react-foundation-lib/formatters";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { XIcon } from "lucide-react";

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
	required?: boolean;
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

export function InputLoadingFrame() {
	return <div className={cn(uiStyles.uiInputControlFake, "skeletonLine")} />;
}

export function InputUIFrame({
	label,
	description,
	size,
	disabled,
	isLoading,
	className
}: Pick<InputUIProps, "label" | "description" | "size" | "disabled" | "className"> & { isLoading?: boolean }) {
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
			<div className={cn(uiStyles.uiInputControlFake, isLoading && "skeletonLine")} />
		</div>
	);
}

export function InputUILoading(props: Pick<InputUIProps, "label" | "description" | "size" | "disabled" | "className">) {
	return <InputUIFrame {...props} isLoading />;
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
	required,
	children
}: InputUIProps) {
	return (
		<div
			className={cn(
				uiStyles.uiElement,
				uiStyles.uiSizable,
				size && uiStyles[size as UiSize],
				disabled && uiStyles.disabled,
				required && uiStyles.required,
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
			className={cn(styles.clearButton, className)}
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

export interface BaseInputProps<T extends number | string | undefined, V = T>
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

		onChange(newValue);
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
	const resolvedEndAdornment = createEndAdornment({ endAdornment, onClear, disabled: disabled || !hasValue });
	const hasCustomAdornment = endAdornment !== undefined && endAdornment !== null;
	const resolvedEndAdornmentWidth = resolveEndAdornmentWidth(hasCustomAdornment, !!onClear, endAdornmentWidth);

	return (
		<InputUI
			label={label}
			description={description}
			disabled={disabled}
			required={props.required}
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
}: BaseInputProps<number | undefined>) {
	const inputProps = props as InputHTMLAttributes<HTMLInputElement>;
	const { controlId, labelId, descriptionId, errorId, describedBy } = useInputFieldIds({
		id: props.id,
		hasLabel: label !== undefined && label !== null,
		hasDescription: !!description,
		hasError: !!error
	});

	const inputRef = useRef<HTMLInputElement | null>(null);
	const numberDraftRef = useRef<{ readonly value: number | undefined; readonly raw: string } | null>(null);
	const externalRawValue = value !== undefined && typeof value === "number" && !isNaN(value) ? String(value) : "";

	/**
	 * Числовой input хранит промежуточную строку в DOM, а controlled number остаётся
	 * источником истины. Layout-effect синхронизирует именно внешнюю DOM-систему,
	 * поэтому не создаёт каскадного React render и не ломает ввод неполных чисел.
	 */
	useLayoutEffect(() => {
		const numberDraft = numberDraftRef.current;
		if (numberDraft && Object.is(numberDraft.value, value)) {
			if (inputRef.current && inputRef.current.value !== numberDraft.raw) {
				inputRef.current.value = numberDraft.raw;
			}
			return;
		}

		numberDraftRef.current = null;
		if (inputRef.current && inputRef.current.value !== externalRawValue) {
			inputRef.current.value = externalRawValue;
		}
	}, [externalRawValue, value]);

	const handleClear = onClear
		? () => {
				onClear();
			}
		: undefined;

	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;

		const parsed = toFiniteNumber(raw); // ?? value ?? 0;
		numberDraftRef.current = { value: parsed, raw };

		onChange(parsed);
		if (error && onClearError) onClearError();
	};

	const resolvedEndAdornment = createEndAdornment({ endAdornment, onClear: handleClear, disabled });
	const hasCustomAdornment = endAdornment !== undefined && endAdornment !== null;
	const resolvedEndAdornmentWidth = resolveEndAdornmentWidth(hasCustomAdornment, !!handleClear, endAdornmentWidth);

	return (
		<InputUI
			label={label}
			description={description}
			disabled={disabled}
			required={props.required}
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
						ref={inputRef}
						id={controlId}
						type="number"
						inputMode="decimal"
						disabled={disabled}
						defaultValue={externalRawValue}
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
