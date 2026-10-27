import { useRef, useState } from "react";

import { Button } from "../../button";
import { FlexContainer } from "../../flex";
import { type TextEditorCoreProps, type TextEditorFocusHandle, TextEditorLexical } from "../index";

type TextEditorImperativeFocusExampleProps = TextEditorCoreProps;

/** Внешнее действие возвращает фокус в тот же документ, не управляя его содержимым. */
export function TextEditorImperativeFocusExample(props: TextEditorImperativeFocusExampleProps) {
	const editorRef = useRef<TextEditorFocusHandle>(null);
	const [readOnly, setReadOnly] = useState(false);

	return (
		<FlexContainer column gap="md">
			<FlexContainer wrap gap="sm">
				<Button data-action="focus-existing-text-editor" onClick={() => editorRef.current?.focus({ preventScroll: true })}>
					Вернуть фокус в редактор
				</Button>
				<Button data-action="toggle-existing-text-editor-readonly" onClick={() => setReadOnly((current) => !current)}>
					{readOnly ? "Разрешить редактирование" : "Только чтение"}
				</Button>
			</FlexContainer>
			<p>
				Введите текст или выделите его часть, затем верните фокус кнопкой. Документ, выделение и история сохраняются. В режиме
				чтения команда ничего не меняет.
			</p>
			<TextEditorLexical {...props} readOnly={readOnly} ref={editorRef} />
		</FlexContainer>
	);
}
