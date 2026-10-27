import { createRef, type RefCallback } from "react";

import {
	TextEditorLexical,
	type TextEditorCoreProps,
	type TextEditorFocusHandle,
	type TextEditorFocusOptions,
	type TextEditorHandle
} from "../src/text-editor";

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

// Прежний минимальный контракт совместим и с consumer-owned clear-only реализацией.
const oldHandle: TextEditorHandle = { clear: () => undefined };
const focusRef = createRef<TextEditorFocusHandle>();
const focusCallback: RefCallback<TextEditorFocusHandle> = (handle) => handle?.focus();
const focusedEditor = <TextEditorLexical {...props} ref={focusRef} />;
const focusCallbackEditor = <TextEditorLexical {...props} ref={focusCallback} />;
const focusOptions = { preventScroll: true } satisfies TextEditorFocusOptions;
focusRef.current?.clear();
focusRef.current?.focus();
focusRef.current?.focus(focusOptions);

// @ts-expect-error Focus options не принимают строковые HTML-значения.
focusRef.current?.focus({ preventScroll: "true" });
// @ts-expect-error Дополнительная возможность не раскрывает внутренний Lexical instance.
const focusedInternalEditor = focusRef.current?.editor;

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
void focusedEditor;
void focusCallbackEditor;
void focusedInternalEditor;
void oldHandle;
void invalidReadOnly;
void invalidElementRef;
void internalEditor;
