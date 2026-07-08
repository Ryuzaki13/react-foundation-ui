import { TextareaHTMLAttributes } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { InputUI, useInputFieldIds } from "../input";
import { UiBaseProps } from "../types";
import uiStyles from "../ui.module.scss";

import styles from "./Textarea.module.scss";

export interface TextareaProps
	extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "children" | "onChange" | "size" | "value">, UiBaseProps<string> {
	error?: string;
	onClearError?: () => void;
}

/**
 * Многострочное текстовое поле для ввода свободного текста. Поддерживает подпись, описание, ошибки и единый визуальный стиль формы.
 */
export function Textarea({
	label,
	description,
	className,
	disabled,
	size,
	value,
	onChange,
	error,
	onClearError,
	id: externalId,
	...props
}: TextareaProps) {
	const { controlId, labelId, descriptionId, errorId, describedBy } = useInputFieldIds({
		id: externalId,
		hasLabel: label !== undefined && label !== null,
		hasDescription: !!description,
		hasError: !!error
	});

	return (
		<InputUI
			label={label}
			description={description}
			disabled={disabled}
			size={size}
			error={error}
			controlId={controlId}
			labelId={labelId}
			descriptionId={descriptionId}
			errorId={errorId}>
			<textarea
				{...props}
				id={controlId}
				disabled={disabled}
				value={value}
				aria-invalid={!!error || undefined}
				aria-labelledby={labelId}
				aria-describedby={describedBy}
				data-invalid={error ? "" : undefined}
				className={cn(uiStyles.uiControl, styles.textarea, "scrollable", className)}
				onChange={(event) => {
					onChange?.(event.target.value);
					if (error && onClearError) {
						onClearError();
					}
				}}
			/>
		</InputUI>
	);
}
