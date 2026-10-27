import { TextEditorLexical, type TextEditorClipboardOptions, type TextEditorClipboardProfile } from "../src/text-editor";

const profile = {
	blockStyles: ["unstyled", "ordered-list-item", "unordered-list-item"],
	inlineStyles: ["BOLD", "ITALIC"],
	normalizeLinkUrl: (url: string): string | null => (url.startsWith("https://") ? url : null)
} as const satisfies TextEditorClipboardProfile;
const options = { profile } satisfies TextEditorClipboardOptions;
const editor = <TextEditorLexical initialData={{ html: "", raw: null }} onChange={() => undefined} clipboardOptions={options} />;
const existingConsumer = <TextEditorLexical initialData={{ html: "", raw: null }} onChange={() => undefined} />;

// @ts-expect-error Профиль использует существующие имена inline-форматирования редактора.
const invalidProfile = { blockStyles: ["unstyled"], inlineStyles: ["RAINBOW"] } satisfies TextEditorClipboardProfile;
// @ts-expect-error URL callback возвращает строку или null, а не флаг допуска.
const invalidUrlPolicy = { ...profile, normalizeLinkUrl: () => true } satisfies TextEditorClipboardProfile;

void editor;
void existingConsumer;
void invalidProfile;
void invalidUrlPolicy;
