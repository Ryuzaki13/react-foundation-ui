import { type TextEditorLexicalRaw } from "../../text-editor/editorModel";

/** Сериализованные fixtures не требуют запуска редактора и применимы к browser/SSR контрактам viewer. */
export function createTextEditorViewerText(text: string, format = 0) {
	return { type: "text", version: 1, detail: 0, mode: "normal", style: "", text, format } as const;
}

export function createTextEditorViewerElement(
	type: string,
	children: readonly unknown[],
	attributes: Readonly<Record<string, unknown>> = {}
) {
	return { type, version: 1, direction: null, format: "", indent: 0, children, ...attributes };
}

export function createTextEditorViewerRaw(children: readonly unknown[]): TextEditorLexicalRaw {
	return {
		format: "lexical",
		version: 1,
		editorState: { root: createTextEditorViewerElement("root", children) }
	};
}
