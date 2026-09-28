import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";

import { TextEditorInitialFocusPlugin } from "../../text-editor/lexical/plugins/TextEditorInitialFocusPlugin";

/** Отдельно проверяет текущую capability editor, не подменяя её начальным readOnly consumer. */
export function TextEditorInitialFocusReadOnlyFixture() {
	return (
		<LexicalComposer
			initialConfig={{
				namespace: "InitialFocusReadOnlyFixture",
				editable: false,
				onError: (error) => {
					throw error;
				}
			}}>
			<ContentEditable />
			<TextEditorInitialFocusPlugin autoFocus readOnly={false} />
		</LexicalComposer>
	);
}
