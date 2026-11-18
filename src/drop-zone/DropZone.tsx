import { type ChangeEvent, type ReactNode, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import {
	assertValidAccept,
	assertValidAllowedMime,
	type ReadFileError,
	type ReadFileResult,
	type ReadMode
} from "@ryuzaki13/react-foundation-lib/file";
import { cn, handleKeyboardActivation } from "@ryuzaki13/react-foundation-lib/utils";
import { UploadIcon } from "lucide-react";

import { InputUI, useInputFieldIds } from "../input";
import { READ_FILE_MODE_ARRAY_BUFFER, READ_FILE_MODE_DATA_URL } from "../input-file/readFileModeConstants";
import { InputFilesList } from "../input-files";
import { useInputFilesReading } from "../input-files/model/useInputFilesReading";

import styles from "./DropZone.module.scss";

/**
 * Пропсы компонента DropZone.
 *
 * Компонент представляет собой визуальную зону для выбора файлов.
 * Поддерживает перетаскивание и выбор по клику, а результаты передаёт в onChange.
 */
export interface DropZoneProps {
	value: ReadFileResult[];
	/** Получает новый список файлов после чтения или удаления. */
	onChange: (results: ReadFileResult[]) => void;
	/** Callback ошибки чтения одного из файлов */
	onChangeError?: (error: ReadFileError) => void;
	/** Чтение группы; false приходит также при отмене, блокировке и размонтировании. */
	onReadingChange?: (isReading: boolean) => void;
	/** Сообщение о предыдущей ошибке, которое очищается при новом выборе. */
	error?: string;
	onClearError?: () => void;
	label?: ReactNode;
	description?: string;
	/** Добавляет успешно прочитанные файлы к value. По умолчанию новый выбор заменяет список. */
	append?: boolean;

	/** HTML-атрибут accept для нативного input[type="file"] (например `[".pdf", ".docx"]`) */
	accept?: readonly string[];
	/** Список допустимых MIME-типов — передаётся в readFile (например `["application/pdf", "image/png"]`) */
	allowedMime?: readonly string[];
	/** Максимальный размер одного файла в байтах */
	maxBytes?: number;
	/** Режим чтения: "data-url" (по умолчанию) или "array-buffer" */
	readMode?: ReadMode;
	/** Разрешить сброс нескольких файлов (по умолчанию true) */
	multiple?: boolean;

	/** Блокировка компонента */
	disabled?: boolean;
	/** CSS-класс обёртки */
	className?: string;
	/**
	 * Кастомный контент внутри зоны.
	 * По умолчанию отображается иконка загрузки и текст "Перетащите файлы сюда".
	 */
	children?: ReactNode;
}

/**
 * DropZone — зона для перетаскивания файлов и выбора по клику.
 *
 * При наведении файла зона подсвечивается (пунктирная рамка меняет цвет).
 * Нативный выбор и перетаскивание используют один отменяемый reader.
 *
 * Поддерживает кастомный контент через children.
 * Если children не указан — отображается иконка загрузки и подсказка.
 */
export function DropZone({
	value,
	onChange,
	onChangeError,
	onReadingChange,
	error,
	onClearError,
	label,
	description,
	append = false,
	accept,
	allowedMime,
	maxBytes,
	readMode,
	multiple = true,
	disabled,
	className,
	children
}: DropZoneProps) {
	assertValidAllowedMime(allowedMime);
	assertValidAccept(accept);

	/** Счётчик вложенности drag-событий для корректной обработки dragLeave */
	const dragCounter = useRef(0);
	/** Скрытый input для выбора файлов по клику */
	const inputRef = useRef<HTMLInputElement>(null);
	/** Состояние: файл перетаскивается над зоной */
	const [isDragOver, setIsDragOver] = useState(false);
	const { controlId, labelId, descriptionId, errorId, describedBy } = useInputFieldIds({
		hasLabel: label !== undefined && label !== null,
		hasDescription: !!description,
		hasError: !!error
	});

	/**
	 * Формируем HTML-атрибут accept из accept или allowedMime.
	 */
	const acceptAttr = useMemo(() => {
		if (accept && accept.length > 0) {
			return accept.join(",");
		}
		if (allowedMime && allowedMime.length > 0) {
			return allowedMime.join(",");
		}
		return "*";
	}, [allowedMime, accept]);

	// Добавление использует последний подтверждённый список, в том числе после внешнего сброса во время чтения.
	const latestValue = useRef(value);
	useLayoutEffect(() => {
		latestValue.current = value;
	}, [value]);

	const readerOptions = {
		disabled,
		allowedMime,
		maxBytes,
		error,
		onClearError,
		onReadingChange,
		onReadError: onChangeError,
		value: [],
		onChange: (files: ReadFileResult[]) => onChange(append ? [...latestValue.current, ...files] : files)
	};
	const reading = useInputFilesReading(
		readMode === READ_FILE_MODE_ARRAY_BUFFER ? { ...readerOptions, readMode } : { ...readerOptions, readMode: READ_FILE_MODE_DATA_URL }
	);

	const processFiles = (files: File[]) => reading.read(multiple ? files : files.slice(0, 1));

	const openFileDialog = useCallback(() => {
		if (disabled) return;

		inputRef.current?.click();
	}, [disabled]);

	/**
	 * Обработка dragEnter — увеличиваем счётчик и включаем подсветку.
	 * Счётчик нужен потому что dragEnter/dragLeave срабатывают
	 * на каждом дочернем элементе внутри зоны.
	 */
	const handleDragEnter = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (disabled) return;

			dragCounter.current += 1;
			if (dragCounter.current === 1) {
				setIsDragOver(true);
			}
		},
		[disabled]
	);

	/**
	 * Обработка dragOver — предотвращаем дефолтное поведение браузера
	 * (иначе drop-событие не сработает).
	 */
	const handleDragOver = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (disabled) return;

			e.dataTransfer.dropEffect = "copy";
		},
		[disabled]
	);

	/**
	 * Обработка dragLeave — уменьшаем счётчик, выключаем подсветку при 0.
	 */
	const handleDragLeave = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (disabled) return;

			dragCounter.current -= 1;
			if (dragCounter.current === 0) {
				setIsDragOver(false);
			}
		},
		[disabled]
	);

	/**
	 * Обработка drop — читаем сброшенные файлы через общую логику.
	 */
	const handleDrop = (event: React.DragEvent) => {
		event.preventDefault();
		event.stopPropagation();
		dragCounter.current = 0;
		setIsDragOver(false);

		void processFiles(Array.from(event.dataTransfer.files));
	};

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.currentTarget.files ?? []);
		event.currentTarget.value = "";
		void processFiles(files);
	};

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			handleKeyboardActivation(e, openFileDialog, { disabled });
		},
		[disabled, openFileDialog]
	);

	return (
		<InputUI
			label={label}
			description={description}
			disabled={disabled}
			error={error}
			controlId={controlId}
			labelId={labelId}
			descriptionId={descriptionId}
			errorId={errorId}>
			<input
				ref={inputRef}
				id={controlId}
				type="file"
				hidden
				disabled={disabled}
				multiple={multiple}
				accept={acceptAttr}
				onChange={handleInputChange}
			/>
			<div
				className={cn(styles.zone, isDragOver && styles.dragOver, disabled && styles.disabled, className)}
				onClick={openFileDialog}
				onKeyDown={handleKeyDown}
				onDragEnter={handleDragEnter}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				role="button"
				tabIndex={disabled ? -1 : 0}
				aria-disabled={disabled}
				aria-invalid={!!error || undefined}
				aria-labelledby={labelId}
				aria-describedby={describedBy}>
				{children ?? (
					<>
						{/* Иконка загрузки по умолчанию */}
						<UploadIcon className={styles.icon} />
						{/* Текст подсказки */}
						<span className={styles.hint}>
							{multiple ? "Перетащите файлы сюда или нажмите для выбора" : "Перетащите файл сюда или нажмите для выбора"}
						</span>
					</>
				)}
			</div>

			<InputFilesList
				files={value}
				disabled={disabled}
				onChange={(files) => {
					reading.cancel();
					onChange(files);
				}}
			/>
		</InputUI>
	);
}
