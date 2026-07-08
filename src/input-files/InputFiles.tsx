import { useCallback, useRef } from "react";

import { assertValidAccept, assertValidAllowedMime, readFile, ReadFileError, ReadFileResult } from "@ryuzaki13/react-foundation-lib/file";
import { cn, handleKeyboardActivation } from "@ryuzaki13/react-foundation-lib/utils";

import { InputControl, InputUI, useInputFieldIds } from "../input";
import { UiBaseProps } from "../types";
import uiStyles from "../ui.module.scss";

import styles from "./InputFiles.module.scss";
import { InputFilesList } from "./InputFilesList";

interface InputFilesCommonProps extends Omit<UiBaseProps<undefined>, "value" | "onChange"> {
	/** Callback ошибки чтения файла */
	onReadError?: (error: ReadFileError) => void;

	/** HTML-атрибут accept для нативного input[type="file"] (например `[".pdf", ".docx"]`) */
	accept?: readonly string[];
	/** Список допустимых MIME-типов — передаётся в readFile */
	allowedMime?: readonly string[];
	/** Максимальный размер одного файла в байтах */
	maxBytes?: number;
	/** Максимальное количество файлов. При достижении лимита input блокируется */
	maxFiles?: number;

	/** Текст ошибки под полем */
	error?: string;
	/** Callback сброса ошибки */
	onClearError?: () => void;
	/** CSS-класс обёртки */
	className?: string;
}

type InputFilesDataUrlResult = Extract<ReadFileResult, { mode: "data-url" }>;
type InputFilesArrayBufferResult = Extract<ReadFileResult, { mode: "array-buffer" }>;

/**
 * Пропсы компонента InputFiles.
 *
 * Компонент предназначен для выбора нескольких файлов.
 * Выбранные файлы отображаются списком под полем ввода,
 * каждый с кнопкой удаления (крестик).
 *
 * В onChange передаётся обновлённый массив результатов readFile.
 */
export type InputFilesProps =
	| (InputFilesCommonProps & {
			value: InputFilesDataUrlResult[];
			onChange: (value: InputFilesDataUrlResult[]) => void;
			/** Режим чтения: "data-url" по умолчанию */
			readMode?: "data-url";
	  })
	| (InputFilesCommonProps & {
			value: InputFilesArrayBufferResult[];
			onChange: (value: InputFilesArrayBufferResult[]) => void;
			/** Режим чтения файла как ArrayBuffer */
			readMode: "array-buffer";
	  });

/**
 * InputFiles — компонент выбора нескольких файлов.
 *
 * Поле стилизовано как InputText. При клике открывается нативный
 * диалог с multiple. Каждый выбранный файл читается через readFile
 * и добавляется в массив value.
 *
 * Список выбранных файлов отображается под полем.
 * Каждый файл можно удалить кнопкой «крестик».
 *
 * InputFiles типизирует массив по `readMode`.
 * Если `readMode` не задан или равен `"data-url"`, в `value` и `onChange`
 * используется массив объектов с `dataUrl`. Если `readMode` равен
 * `"array-buffer"`, используется массив объектов с `buffer`.
 */
export function InputFiles(props: InputFilesProps) {
	const {
		value,
		onReadError,
		accept,
		allowedMime,
		maxBytes,
		maxFiles,
		label,
		description,
		placeholder = "Выберите файлы",
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

	/** Достигнут ли лимит файлов */
	const isLimitReached = typeof maxFiles === "number" && value.length >= maxFiles;

	/**
	 * Обработчик выбора файлов из нативного диалога.
	 * Каждый файл читается через readFile.
	 * Успешно прочитанные файлы добавляются к текущему массиву value.
	 */
	const handleChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files;
			if (!files || files.length === 0) return;

			const selectedFiles = Array.from(files);

			// Сбрасываем значение input чтобы можно было выбрать те же файлы повторно
			e.target.value = "";

			// Сбрасываем ошибку при выборе новых файлов
			if (error && onClearError) onClearError();

			// Определяем сколько файлов можно ещё добавить
			const remaining = typeof maxFiles === "number" ? maxFiles - value.length : selectedFiles.length;
			const filesToProcess = selectedFiles.slice(0, remaining);

			if (props.readMode === "array-buffer") {
				// Читаем файлы как ArrayBuffer и сохраняем точный тип массива для потребителя.
				const results: InputFilesArrayBufferResult[] = [];

				for (const file of filesToProcess) {
					try {
						const result = await readFile(file, { allowedMime, maxBytes, mode: "array-buffer" });
						results.push(result);
					} catch (err) {
						if (err instanceof ReadFileError && onReadError) {
							onReadError(err);
						}
					}
				}

				if (results.length > 0) {
					props.onChange([...props.value, ...results]);
				}

				return;
			}

			// Читаем файлы как Data URL и сохраняем точный тип массива для потребителя.
			const results: InputFilesDataUrlResult[] = [];
			for (const file of filesToProcess) {
				try {
					const result = await readFile(file, { allowedMime, maxBytes });
					results.push(result);
				} catch (err) {
					if (err instanceof ReadFileError && onReadError) {
						onReadError(err);
					}
				}
			}
			if (results.length > 0) {
				props.onChange([...props.value, ...results]);
			}
		},
		[props, maxFiles, value.length, allowedMime, maxBytes, onReadError, error, onClearError]
	);

	/** Клик по видимому контролу открывает нативный диалог */
	const handleClick = useCallback(() => {
		inputRef.current?.click();
	}, []);

	const filesList =
		props.readMode === "array-buffer" ? (
			<InputFilesList files={props.value} onChange={props.onChange} />
		) : (
			<InputFilesList files={props.value} onChange={props.onChange} />
		);

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
				multiple
				disabled={disabled || isLimitReached}
				className={styles.hiddenInput}
				onChange={handleChange}
				tabIndex={-1}
			/>

			<InputControl>
				{() => (
					<div
						role="button"
						tabIndex={disabled || isLimitReached ? -1 : 0}
						onClick={handleClick}
						onKeyDown={(event) => handleKeyboardActivation(event, handleClick, { disabled: disabled || isLimitReached })}
						className={cn(uiStyles.uiInputControl, styles.control, !!error && "invalid")}
						data-disabled={disabled || undefined}
						aria-invalid={!!error || undefined}
						aria-disabled={disabled || isLimitReached}
						aria-labelledby={labelId}
						aria-describedby={describedBy}>
						<span className={uiStyles.uiPlaceholder}>{isLimitReached ? `Максимум ${maxFiles} файлов` : placeholder}</span>
					</div>
				)}
			</InputControl>

			{/* Список выбранных файлов */}
			{filesList}
		</InputUI>
	);
}
