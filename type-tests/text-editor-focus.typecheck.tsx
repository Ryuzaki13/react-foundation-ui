import { TextEditorLexical, type TextEditorCoreProps } from "../src/text-editor";

const props = {
	initialData: { html: "", raw: null },
	onChange: () => undefined,
	autoFocus: true
} satisfies TextEditorCoreProps;

const focusedEditor = <TextEditorLexical {...props} />;
const unchangedConsumer = <TextEditorLexical initialData={{ html: "", raw: null }} onChange={() => undefined} />;
const readonlyEditor = <TextEditorLexical {...props} readOnly />;

// @ts-expect-error Это флаг новой сессии, а не строковый HTML-атрибут.
const invalidAutoFocus = <TextEditorLexical {...props} autoFocus="true" />;

void focusedEditor;
void unchangedConsumer;
void readonlyEditor;
void invalidAutoFocus;
