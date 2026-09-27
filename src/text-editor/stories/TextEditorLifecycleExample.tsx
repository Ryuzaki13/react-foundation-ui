import { useRef, useState } from "react";

import { Button } from "../../button";
import { FlexContainer } from "../../flex";
import { type TextEditorCoreProps, type TextEditorHandle, TextEditorLexical } from "../index";

/** Consumer управляет доступностью и подтверждённой очисткой, но не editor instance. */
export function TextEditorLifecycleExample(props: TextEditorCoreProps) {
	const editorRef = useRef<TextEditorHandle>(null);
	const [readOnly, setReadOnly] = useState(false);
	return (
		<FlexContainer column gap="md">
			<FlexContainer wrap gap="sm">
				<Button onClick={() => setReadOnly((current) => !current)}>
					{readOnly ? "Разрешить редактирование" : "Только чтение"}
				</Button>
				<Button appearance="outline" onClick={() => editorRef.current?.clear()}>
					Очистить документ и историю
				</Button>
				<Button appearance="ghost">Внешний фокус</Button>
			</FlexContainer>
			<p>Очистка работает также в режиме чтения. Она не возвращает исходный текст и не переносит фокус с нажатой кнопки в поле.</p>
			<TextEditorLexical {...props} readOnly={readOnly} ref={editorRef} />
		</FlexContainer>
	);
}
