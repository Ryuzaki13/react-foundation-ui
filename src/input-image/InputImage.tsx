import { useCallback, useMemo, useRef } from "react";

import { ImageMime, ReadImageError, readImageFile, ReadImageResult, ReadMode } from "@ryuzaki13/react-foundation-lib/file";
import { cn, handleKeyboardActivation } from "@ryuzaki13/react-foundation-lib/utils";

import { InputClearButton, InputControl, InputUI, useInputFieldIds } from "../input";
import { UiBaseProps } from "../types";
import uiStyles from "../ui.module.scss";

import styles from "./InputImage.module.scss";

/**
 * Пропсы компонента InputImage.
 *
 * Компонент предназначен для выбора одного изображения.
 * Внешний вид идентичен InputText.
 *
 * Под капотом использует readImageFile, который:
 * - Проверяет что файл является изображением (image/*)
 * - Валидирует MIME-тип по списку allowedMime
 * - В режиме "data-url" автоматически извлекает размеры изображения (dimensions)
 */
export interface InputImageProps extends UiBaseProps<ReadImageResult, ReadImageResult | undefined> {
	/** Callback очистки выбранного изображения. Если передан — отображается кнопка «крестик» */
	onClear?: () => void;
	/** Callback ошибки чтения (невалидный формат, не изображение, превышение размера и т.д.) */
	onReadError?: (error: ReadImageError) => void;

	/** Допустимые MIME-типы изображений — передаётся в readImageFile */
	allowedMime?: readonly ImageMime[];
	/** Максимальный размер файла в байтах — передаётся в readImageFile */
	maxBytes?: number;
	/** Режим чтения: "data-url" (по умолчанию, с извлечением dimensions) или "array-buffer" */
	readMode?: ReadMode;

	/** Текст ошибки под полем */
	error?: string;
	/** Callback сброса ошибки (вызывается при повторном выборе изображения) */
	onClearError?: () => void;
	/** CSS-класс обёртки */
	className?: string;
}

/**
 * InputImage — компонент выбора одного изображения.
 *
 * Визуально идентичен InputText. Под капотом использует readImageFile,
 * который валидирует что файл — изображение и извлекает его размеры.
 *
 * HTML-атрибут accept формируется автоматически из allowedMime
 * или по умолчанию равен "image/*".
 */
export function InputImage({
	value,
	onChange,
	onClear,
	onReadError,
	allowedMime,
	maxBytes,
	readMode,
	label,
	description,
	placeholder = "Выберите изображение",
	disabled,
	size,
	error,
	onClearError,
	className
}: InputImageProps) {
	/** Реф на скрытый нативный input[type="file"] */
	const inputRef = useRef<HTMLInputElement>(null);
	const { controlId, labelId, descriptionId, errorId, describedBy } = useInputFieldIds({
		hasLabel: label !== undefined && label !== null,
		hasDescription: !!description,
		hasError: !!error
	});

	const readSelectedImage = useCallback(
		(file: File) => {
			if (readMode === "array-buffer") {
				return readImageFile(file, { allowedMime, maxBytes, mode: "array-buffer" });
			}

			return readImageFile(file, { allowedMime, maxBytes });
		},
		[allowedMime, maxBytes, readMode]
	);

	/**
	 * Формируем HTML-атрибут accept из allowedMime.
	 * Если allowedMime не указан — принимаем любые изображения (image/*).
	 */
	const accept = useMemo(() => {
		if (allowedMime && allowedMime.length > 0) {
			return allowedMime.join(",");
		}
		return "image/*";
	}, [allowedMime]);

	/**
	 * Обработчик выбора файла из нативного диалога.
	 * Читает файл через readImageFile и передаёт результат в onChange.
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
				const result = await readSelectedImage(file);
				onChange(result);
			} catch (err) {
				if (err instanceof ReadImageError && onReadError) {
					onReadError(err);
				}
			}
		},
		[readSelectedImage, onChange, onReadError, error, onClearError]
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
				accept={accept}
				disabled={disabled}
				className={styles.hiddenInput}
				onChange={handleChange}
				tabIndex={-1}
			/>

			{/* Видимый контрол, стилизованный под InputText */}
			<InputControl
				endAdornment={onClear ? <InputClearButton onClick={onClear} disabled={disabled} /> : undefined}
				endAdornmentWidth={onClear ? "var(--control-height)" : undefined}>
				{({ controlClassName }) => (
					<div
						role="button"
						tabIndex={disabled ? -1 : 0}
						onClick={handleClick}
						onKeyDown={(event) => handleKeyboardActivation(event, handleClick, { disabled })}
						className={cn(uiStyles.uiInputControl, styles.control, controlClassName, !!error && "invalid")}
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
