import { createRef, type RefCallback } from "react";

import { TextEditorLexical, type TextEditorCoreProps, type TextEditorHandle } from "../src/text-editor";

const ref = createRef<TextEditorHandle>();
const callbackRef: RefCallback<TextEditorHandle> = (handle) => {
	handle?.clear();
};
const props = {
	initialData: { html: "", raw: null },
	onChange: () => undefined,
	readOnly: true,
	ref
} satisfies TextEditorCoreProps;

const readonlyEditor = <TextEditorLexical {...props} />;
const callbackEditor = <TextEditorLexical {...props} ref={callbackRef} readOnly={false} />;
const unchangedConsumer = <TextEditorLexical initialData={{ html: "", raw: null }} onChange={() => undefined} />;
ref.current?.clear();

// @ts-expect-error Режим редактирования является флагом, а не строковым значением HTML.
const invalidReadOnly = <TextEditorLexical {...props} readOnly="true" />;
// @ts-expect-error Ref предоставляет ограниченную handle, а не DOM-узел editable.
const invalidElementRef = <TextEditorLexical {...props} ref={createRef<HTMLDivElement>()} />;
// @ts-expect-error Очистка не принимает новое содержимое и не создаёт второй controlled API.
ref.current?.clear("<p>Подмена документа</p>");
// @ts-expect-error Consumer не получает доступ к LexicalEditor и его внутренним командам.
const internalEditor = ref.current?.editor;
// @ts-expect-error Lifecycle не открывает произвольное управление фокусом.
ref.current?.focus();

void readonlyEditor;
void callbackEditor;
void unchangedConsumer;
void invalidReadOnly;
void invalidElementRef;
void internalEditor;
