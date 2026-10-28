import { type ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { FlexContainer, FlexItem } from "../flex";

import { type TextEditorCoreProps } from "./editorModel";
import styles from "./TextEditorInputSurface.module.scss";

type TextEditorInputSurfaceProps = {
	readonly presentation?: TextEditorCoreProps["presentation"];
	readonly endAdornment?: TextEditorCoreProps["endAdornment"];
	readonly children: ReactNode;
};

/**
 * Общая рамка поля резервирует настоящую ширину действий: текст и placeholder
 * занимают отдельную сжимаемую ячейку. Обёртки постоянны, поэтому смена действий
 * не пересоздаёт editable, его выделение и историю. Содержимое действий задаёт consumer.
 */
export function TextEditorInputSurface({ presentation, endAdornment, children }: TextEditorInputSurfaceProps) {
	return (
		<FlexContainer align="stretch" className={cn(styles.surface, presentation === "compact" && styles.compact)}>
			<FlexItem grow basis="0" className={styles.content}>
				{children}
			</FlexItem>
			{endAdornment !== undefined && endAdornment !== null && (
				<FlexItem shrink={false} className={styles.endAdornment}>
					{endAdornment}
				</FlexItem>
			)}
		</FlexContainer>
	);
}
