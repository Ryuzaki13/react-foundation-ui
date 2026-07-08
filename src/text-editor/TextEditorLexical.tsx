import { LazyDynamicComponent } from "../misc";

import type { TextEditorCoreProps } from "./editorModel";

function importTextEditorLexicalClient() {
	if (import.meta.env.SSR) return Promise.resolve(null);

	return import("./TextEditorLexicalClient").then((module) => ({
		TextEditorLexicalClient: module.TextEditorLexicalClient
	}));
}

/**
 * Client-only граница редактора: Lexical использует DOM и не должен попадать в SSR-исполнение.
 */
export function TextEditorLexical(props: TextEditorCoreProps) {
	return (
		<LazyDynamicComponent<TextEditorCoreProps>
			clientOnly
			importFunc={importTextEditorLexicalClient}
			componentName="TextEditorLexicalClient"
			cacheKey="shared-ui:text-editor-lexical-client"
			fallback={null}
			props={props}
		/>
	);
}
