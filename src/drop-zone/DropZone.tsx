import { ChangeEvent, ReactNode, useCallback, useMemo, useRef, useState } from "react";

import { UploadIcon } from "lucide-react";

import { assertValidAccept, assertValidAllowedMime, readFile, ReadFileError, ReadFileResult, ReadMode } from "@ryuzaki13/react-foundation-lib/file";
import { cn, handleKeyboardActivation } from "@ryuzaki13/react-foundation-lib/utils";

import { InputFilesList } from "../input-files";

import styles from "./DropZone.module.scss";

/**
 * Пропсы компонента DropZone.
 *
 * Компонент представляет собой визуальную зону для выбора файлов.
 * Поддерживает перетаскивание и выбор по клику, а результаты передаются в onDrop.
 */
export interface DropZoneProps {
	value: ReadFileResult[];
	/** Вызывается с массивом результатов readFile после сброса файлов */
	onChange: (results: ReadFileResult[]) => void;
	/** Callback ошибки чтения одного из файлов */
	onChangeError?: (error: ReadFileError) => void;

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
 * При сбросе файлов каждый читается через readFile, успешные результаты
 * передаются в onDrop, ошибки — в onDropError.
 *
 * Поддерживает кастомный контент через children.
 * Если children не указан — отображается иконка загрузки и подсказка.
 */
export function DropZone({
	value,
	onChange,
	onChangeError,
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

	const readDroppedFile = useCallback(
		(file: File) => {
			if (readMode === "array-buffer") {
				return readFile(file, { allowedMime, maxBytes, mode: "array-buffer" });
			}

			return readFile(file, { allowedMime, maxBytes });
		},
		[allowedMime, maxBytes, readMode]
	);

	const processFiles = useCallback(
		async (files: File[]) => {
			if (disabled || files.length === 0) return;

			const filesToProcess = multiple ? files : files.slice(0, 1);
			const results: ReadFileResult[] = [];

			for (const file of filesToProcess) {
				try {
					const result = await readDroppedFile(file);
					results.push(result);
				} catch (err) {
					if (err instanceof ReadFileError && onChangeError) {
						onChangeError(err);
					}
				}
			}

			if (results.length > 0) {
				onChange(results);
			}
		},
		[disabled, multiple, onChange, onChangeError, readDroppedFile]
	);

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
	const handleDrop = useCallback(
		async (e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();

			// Сбрасываем состояние drag
			dragCounter.current = 0;
			setIsDragOver(false);

			if (disabled) return;

			const droppedFiles = Array.from(e.dataTransfer.files);
			await processFiles(droppedFiles);
		},
		[disabled, processFiles]
	);

	const handleInputChange = useCallback(
		async (e: ChangeEvent<HTMLInputElement>) => {
			const selectedFiles = Array.from(e.target.files ?? []);
			await processFiles(selectedFiles);

			// Сбрасываем значение, чтобы повторный выбор того же файла тоже вызывал change.
			e.target.value = "";
		},
		[processFiles]
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			handleKeyboardActivation(e, openFileDialog, { disabled });
		},
		[disabled, openFileDialog]
	);

	return (
		<div>
			<input
				ref={inputRef}
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
				aria-disabled={disabled}>
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

			{/* Список выбранных файлов */}
			<InputFilesList files={value} onChange={onChange} />
		</div>
	);
}
