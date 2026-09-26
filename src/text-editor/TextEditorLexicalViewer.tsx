import { type ReactNode, useMemo } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { type TextEditorLexicalRaw } from "./editorModel";
import { getTextEditorViewerElementStyle } from "./lib/viewer/getTextEditorViewerElementStyle";
import { parseTextEditorViewerDocument } from "./lib/viewer/parseTextEditorViewerDocument";
import styles from "./TextEditorLexicalViewer.module.scss";
import { TextEditorViewerNode } from "./ui/viewer/TextEditorViewerNode";

export type TextEditorLexicalViewerProps = Readonly<{
	raw: TextEditorLexicalRaw;
	className?: string;
	fallback?: ReactNode;
}>;

/** Читает immutable raw без editor instance; SSR и браузер используют одну безопасную проекцию. */
export function TextEditorLexicalViewer({
	raw,
	className,
	fallback = "Содержимое недоступно для отображения."
}: TextEditorLexicalViewerProps) {
	// Повторный render карточки не должен заново обходить неизменившийся документ.
	const document = useMemo(() => parseTextEditorViewerDocument(raw), [raw]);
	if (document.status === "invalid") {
		return (
			<div className={cn(styles.viewer, className)} data-text-editor-viewer="unsupported">
				{fallback}
			</div>
		);
	}
	return (
		<div
			className={cn(styles.viewer, className)}
			data-text-editor-viewer="ready"
			dir={document.element.direction ?? undefined}
			style={getTextEditorViewerElementStyle(document.element)}>
			{document.children.map((node, index) => (
				<TextEditorViewerNode key={index} node={node} />
			))}
		</div>
	);
}
