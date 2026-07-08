import { useCallback } from "react";

import { XIcon } from "lucide-react";

import { ReadFileResult } from "@ryuzaki13/react-foundation-lib/file";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "./InputFiles.module.scss";

interface InputFilesListProps<TFile extends ReadFileResult> {
	files: TFile[];
	onChange: (files: TFile[]) => void;
}

export function InputFilesList<TFile extends ReadFileResult>({ files, onChange }: InputFilesListProps<TFile>) {
	const handleRemove = useCallback(
		(index: number) => {
			onChange(files.filter((_, i) => i !== index));
		},
		[files, onChange]
	);

	if (!files || !files.length) return null;

	return (
		<ul className={styles.fileList}>
			{files.map((item, index) => (
				<li key={`${item.meta.name}-${item.meta.lastModified}`} className={styles.fileItem}>
					<span className={styles.fileItemName}>{item.meta.name}</span>
					<button
						type="button"
						className={cn(styles.removeButton, "flexCenter")}
						onClick={() => handleRemove(index)}
						aria-label={`Удалить ${item.meta.name}`}>
						<XIcon />
					</button>
				</li>
			))}
		</ul>
	);
}
