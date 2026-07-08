import { useCallback, useRef } from "react";

import {
	assertValidAccept,
	assertValidAllowedMime,
	readFile,
	ReadFileError,
	ReadFileResult,
	ReadMode
} from "@ryuzaki13/react-foundation-lib/file";
import { cn, handleKeyboardActivation } from "@ryuzaki13/react-foundation-lib/utils";

import { InputClearButton, InputControl, InputUI, useInputFieldIds } from "../input";
import { UiBaseProps } from "../types";
import uiStyles from "../ui.module.scss";

import styles from "./InputFile.module.scss";

interface InputFileCommonProps extends Omit<UiBaseProps<undefined>, "value" | "onChange"> {
	/** Callback очистки выбранного файла. Если передан — отображается кнопка «крестик» */
	onClear?: () => void;
	/** Callback ошибки чтения файла (невалидный MIME, превышение размера и т.д.) */
	onReadError?: (error: ReadFileError) => void;

	/** HTML-атрибут accept для нативного input[type="file"] (например `[".pdf", ".docx"]`) */
	accept?: readonly string[];
	/** Список допустимых MIME-типов — передаётся в readFile для валидации */
	allowedMime?: readonly string[];
	/** Максимальный размер файла в байтах — передаётся в readFile для валидации */
	maxBytes?: number;
	/** Режим чтения файла: "data-url" (по умолчанию) или "array-buffer" */
	readMode?: ReadMode;

	/** Текст ошибки под полем */
	error?: string;
	/** Callback сброса ошибки (вызывается при повторном выборе файла) */
	onClearError?: () => void;
	/** CSS-класс обёртки */
	className?: string;
}

type InputFileDataUrlResult = Extract<ReadFileResult, { mode: "data-url" }>;
type InputFileArrayBufferResult = Extract<ReadFileResult, { mode: "array-buffer" }>;

/**
 * Пропсы компонента InputFile.
 *
 * Компонент предназначен для выбора одного файла.
 * Внешний вид идентичен InputText — label, description, error, кнопка очистки.
 *
 * В onChange передаётся результат чтения файла через readFile:
 * - В режиме "data-url" — объект с dataUrl и метаданными
 * - В режиме "array-buffer" — объект с ArrayBuffer и метаданными
 */
export type InputFileProps =
	| (InputFileCommonProps & {
			value: ReadFileResult | undefined;
			onChange: (value: InputFileDataUrlResult) => void;
			readMode?: "data-url";
	  })
	| (InputFileCommonProps & {
			value: ReadFileResult | undefined;
			onChange: (value: InputFileArrayBufferResult) => void;
			readMode: "array-buffer";
	  });

/**
 * InputFile — компонент выбора одного файла.
 *
 * Визуально идентичен InputText: поле с label, description, placeholder,
 * кнопкой очистки (крестик) и блоком ошибки.
 *
 * При клике открывается нативный диалог выбора файла.
 * После выбора файл читается через readFile, результат передаётся в onChange.
 *
 * InputFile позволяет выбрать один файл и передаёт наружу типизированный результат чтения.
 * Если `readMode` не задан или равен `"data-url"`, в `onChange` приходит объект с `dataUrl`.
 * Если `readMode` равен `"array-buffer"`, в `onChange` приходит объект с `buffer`.
 */
export function InputFile(props: InputFileProps) {
	const {
		value,
		onClear,
		onReadError,
		accept,
		allowedMime,
		maxBytes,
		label,
		description,
		placeholder = "Выберите файл",
		disabled,
		size,
		error,
		onClearError,
		className
	} = props;

	assertValidAllowedMime(allowedMime);
	assertValidAccept(accept);

	/** Реф на скрытый нативный input[type="file"] */
	const inputRef = useRef<HTMLInputElement>(null);
	const { controlId, labelId, descriptionId, errorId, describedBy } = useInputFieldIds({
		hasLabel: label !== undefined && label !== null,
		hasDescription: !!description,
		hasError: !!error
	});

	/**
	 * Обработчик выбора файла из нативного диалога.
	 * Читает файл через readFile и передаёт результат в onChange.
	 * При ошибке чтения вызывает onReadError.
	 */
	const handleChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			// Сбрасываем значение input чтобы можно было выбрать тот же файл повторно
			e.target.value = "";

			// Сбрасываем ошибку при повторном выборе
			if (error && onClearError) onClearError();

			try {
				if (props.readMode === "array-buffer") {
					const result = await readFile(file, { allowedMime, maxBytes, mode: "array-buffer" });
					props.onChange(result);
					return;
				}

				const result = await readFile(file, { allowedMime, maxBytes });
				props.onChange(result);
			} catch (err) {
				if (err instanceof ReadFileError && onReadError) {
					onReadError(err);
				}
			}
		},
		[props, allowedMime, maxBytes, onReadError, error, onClearError]
	);

	/** Клик по видимому контролу открывает нативный диалог */
	const handleClick = useCallback(() => {
		inputRef.current?.click();
	}, []);

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
			<input
				ref={inputRef}
				id={controlId}
				type="file"
				accept={(accept ?? allowedMime)?.join(",")}
				disabled={disabled}
				className={styles.hiddenInput}
				onChange={handleChange}
				tabIndex={-1}
			/>

			<InputControl
				endAdornment={onClear ? <InputClearButton onClick={onClear} disabled={disabled} /> : undefined}
				endAdornmentWidth={onClear ? "var(--control-height)" : undefined}>
				{({ controlClassName }) => (
					<div
						role="button"
						tabIndex={disabled ? -1 : 0}
						onClick={handleClick}
						onKeyDown={(event) => handleKeyboardActivation(event, handleClick, { disabled })}
						className={cn(uiStyles.uiInputControl, styles.control, controlClassName, !!error && uiStyles.invalid)}
						data-disabled={disabled || undefined}
						aria-invalid={!!error || undefined}
						aria-disabled={disabled}
						aria-labelledby={labelId}
						aria-describedby={describedBy}>
						{value ? (
							<span className={styles.fileName}>{value.meta.name}</span>
						) : (
							<span className={uiStyles.uiPlaceholder}>{placeholder}</span>
						)}
					</div>
				)}
			</InputControl>
		</InputUI>
	);
}
