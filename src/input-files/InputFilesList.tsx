import { useCallback } from "react";

import { type ReadFileResult } from "@ryuzaki13/react-foundation-lib/file";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { XIcon } from "lucide-react";

import styles from "./InputFiles.module.scss";

interface InputFilesListProps<TFile extends ReadFileResult> {
	files: TFile[];
	onChange: (files: TFile[]) => void;
	/** Блокирует удаление на время отправки или недоступности родительской формы. */
	disabled?: boolean;
}

export function InputFilesList<TFile extends ReadFileResult>({ files, onChange, disabled = false }: InputFilesListProps<TFile>) {
	const handleRemove = useCallback(
		(index: number) => {
			if (!disabled) onChange(files.filter((_, i) => i !== index));
		},
		[files, onChange, disabled]
	);

	if (!files || !files.length) return null;
	// Повторный выбор одного файла различается номером в его группе. Удаление
	// соседнего файла сохраняет ключи уникальных строк и не пересоздаёт их DOM.
	const occurrences = new Map<string, number>();

	return (
		<ul className={styles.fileList}>
			{files.map((item, index) => {
				const identity = JSON.stringify([item.meta.name, item.meta.lastModified, item.meta.size]);
				const occurrence = occurrences.get(identity) ?? 0;
				occurrences.set(identity, occurrence + 1);
				return (
					<li key={`${identity}:${occurrence}`} className={styles.fileItem}>
						<span className={styles.fileItemName}>{item.meta.name}</span>
						<button
							type="button"
							disabled={disabled}
							className={cn(styles.removeButton, "flexCenter")}
							onClick={() => handleRemove(index)}
							aria-label={`Удалить ${item.meta.name}`}>
							<XIcon />
						</button>
					</li>
				);
			})}
		</ul>
	);
}
