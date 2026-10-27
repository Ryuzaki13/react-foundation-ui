import { type ReadFileError, type ReadFileResult } from "@ryuzaki13/react-foundation-lib/file";

import { type UiBaseProps } from "../types";

interface InputFilesCommonProps extends Omit<UiBaseProps<undefined>, "value" | "onChange"> {
	/** Callback ошибки чтения файла */
	onReadError?: (error: ReadFileError) => void;
	/** Чтение всей выбранной группы; false приходит также при отмене, блокировке и unmount. */
	onReadingChange?: (isReading: boolean) => void;

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
