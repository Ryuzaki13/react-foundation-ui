import { useCallback, useLayoutEffect, useRef } from "react";

import { readFile, ReadFileError, type ReadFileResult } from "@ryuzaki13/react-foundation-lib/file";

import { READ_FILE_MODE_ARRAY_BUFFER, READ_FILE_MODE_DATA_URL } from "../../input-file/readFileModeConstants";
import { type InputFilesProps } from "../InputFilesProps";

/** Отзывает всю группу чтения при новом выборе, удалении, блокировке или размонтировании поля. */
export function useInputFilesReading(props: InputFilesProps) {
	const disabled = props.disabled ?? false;
	const readMode = props.readMode ?? READ_FILE_MODE_DATA_URL;
	const active = useRef<AbortController | null>(null);
	const reading = useRef(false);
	const callback = useRef(props.onReadingChange);
	useLayoutEffect(() => {
		callback.current = props.onReadingChange;
	}, [props.onReadingChange]);
	const updateReading = useCallback((next: boolean) => {
		if (reading.current === next) return;
		reading.current = next;
		callback.current?.(next);
	}, []);
	const cancel = useCallback(() => {
		const previous = active.current;
		active.current = null;
		previous?.abort();
		updateReading(false);
	}, [updateReading]);
	useLayoutEffect(() => {
		if (disabled) cancel();
		return cancel;
	}, [disabled, readMode, cancel]);

	const read = async (files: readonly File[]) => {
		if (disabled || files.length === 0) return;
		const remaining = props.maxFiles === undefined ? files.length : Math.max(0, props.maxFiles - props.value.length);
		const selected = files.slice(0, remaining);
		if (selected.length === 0) return;
		const previous = active.current;
		const current = new AbortController();
		active.current = current;
		previous?.abort();
		updateReading(true);
		if (props.error) props.onClearError?.();
		const isCurrent = () => active.current === current && !current.signal.aborted;
		const dataUrls: Extract<ReadFileResult, { mode: typeof READ_FILE_MODE_DATA_URL }>[] = [];
		const buffers: Extract<ReadFileResult, { mode: typeof READ_FILE_MODE_ARRAY_BUFFER }>[] = [];
		try {
			for (const file of selected) {
				if (!isCurrent()) return;
				try {
					const options = { allowedMime: props.allowedMime, maxBytes: props.maxBytes, signal: current.signal };
					if (props.readMode === READ_FILE_MODE_ARRAY_BUFFER) {
						const result = await readFile(file, { ...options, mode: READ_FILE_MODE_ARRAY_BUFFER });
						if (!isCurrent()) return;
						buffers.push(result);
					} else {
						const result = await readFile(file, options);
						if (!isCurrent()) return;
						dataUrls.push(result);
					}
				} catch (error) {
					if (!isCurrent()) return;
					props.onReadError?.(error instanceof ReadFileError ? error : new ReadFileError("READ_FAILED", undefined, error));
				}
			}
			if (!isCurrent()) return;
			// Частичный отказ не теряет уже выбранные файлы и успешные результаты этой группы.
			if (props.readMode === READ_FILE_MODE_ARRAY_BUFFER) {
				if (buffers.length > 0) props.onChange([...props.value, ...buffers]);
			} else if (dataUrls.length > 0) props.onChange([...props.value, ...dataUrls]);
		} finally {
			if (active.current === current) {
				active.current = null;
				updateReading(false);
			}
		}
	};
	return { read, cancel };
}
