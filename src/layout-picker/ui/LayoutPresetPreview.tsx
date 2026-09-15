import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { getLayoutCellStyle, getLayoutStyle, type LayoutPickerPreset } from "../lib";

import styles from "./LayoutPicker.module.scss";

export type LayoutPresetPreviewProps = {
	preset: LayoutPickerPreset;
	compact?: boolean;
};

/** Схематичное, скрытое от accessibility tree превью layout-пресета. */
export function LayoutPresetPreview({ preset, compact = false }: LayoutPresetPreviewProps) {
	return (
		<span
			className={cn(styles.preview, compact && styles.previewCompact)}
			style={getLayoutStyle(preset)}
			aria-hidden="true"
			data-ui="layout-picker-preview">
			{preset.cells.map((cell) => (
				<span key={`${preset.id}:${cell.id}`} className={styles.previewCell} style={getLayoutCellStyle(cell)} />
			))}
		</span>
	);
}
