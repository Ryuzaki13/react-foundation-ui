import { useRef, useState } from "react";

import { Button } from "../../button";
import { FlexContainer } from "../../flex";
import { type TextEditorCoreProps, type TextEditorHandle, TextEditorLexical } from "../index";

type TextEditorInitialFocusExampleProps = TextEditorCoreProps;

/** Явное открытие новой сессии не позволяет story забирать фокус при загрузке всей docs-страницы. */
export function TextEditorInitialFocusExample(props: TextEditorInitialFocusExampleProps) {
	const [session, setSession] = useState<number | null>(null);
	const [readOnly, setReadOnly] = useState(false);
	const editorRef = useRef<TextEditorHandle>(null);

	return (
		<FlexContainer column gap="md">
			<FlexContainer wrap gap="sm">
				<Button data-action="open-focused-text-editor" onClick={() => setSession((current) => (current ?? 0) + 1)}>
					Открыть новый документ
				</Button>
				<Button data-action="toggle-focused-text-editor-readonly" onClick={() => setReadOnly((current) => !current)}>
					{readOnly ? "Разрешить редактирование" : "Только чтение"}
				</Button>
				<Button data-action="clear-focused-text-editor" appearance="outline" onClick={() => editorRef.current?.clear()}>
					Очистить документ
				</Button>
				<Button data-action="close-focused-text-editor" appearance="ghost" onClick={() => setSession(null)}>
					Закрыть документ
				</Button>
			</FlexContainer>
			<p>Фокус получает только новый редактируемый документ. Переключение режима и очистка не забирают фокус с кнопок.</p>
			{session !== null && <TextEditorLexical {...props} key={session} autoFocus readOnly={readOnly} ref={editorRef} />}
		</FlexContainer>
	);
}
