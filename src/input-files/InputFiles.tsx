import { useCallback, useRef } from "react";

import { assertValidAccept, assertValidAllowedMime } from "@ryuzaki13/react-foundation-lib/file";
import { cn, handleKeyboardActivation } from "@ryuzaki13/react-foundation-lib/utils";

import { InputControl, InputUI, useInputFieldIds } from "../input";
import uiStyles from "../ui.module.scss";

import styles from "./InputFiles.module.scss";
import { InputFilesList } from "./InputFilesList";
import { type InputFilesProps } from "./InputFilesProps";
import { useInputFilesReading } from "./model/useInputFilesReading";

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
		accept,
		allowedMime,
		maxFiles,
		label,
		description,
		placeholder = "Выберите файлы",
		disabled,
		size,
		error,
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

	const reading = useInputFilesReading(props);
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(event.currentTarget.files ?? []);
			event.currentTarget.value = "";
			void reading.read(files);
		},
		[reading]
	);

	/** Клик по видимому контролу открывает нативный диалог */
	const handleClick = useCallback(() => {
		if (!disabled && !isLimitReached) inputRef.current?.click();
	}, [disabled, isLimitReached]);

	const filesList =
		props.readMode === "array-buffer" ? (
			<InputFilesList
				files={props.value}
				disabled={disabled}
				onChange={(files) => {
					reading.cancel();
					props.onChange(files);
				}}
			/>
		) : (
			<InputFilesList
				files={props.value}
				disabled={disabled}
				onChange={(files) => {
					reading.cancel();
					props.onChange(files);
				}}
			/>
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
						className={cn(uiStyles.uiInputControl, styles.control, !!error && uiStyles.invalid)}
						data-disabled={disabled || isLimitReached || undefined}
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

export { type InputFilesProps } from "./InputFilesProps";
