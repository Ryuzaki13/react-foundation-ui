import {
	LinkTypes,
	TextEditorLexical,
	type TextEditorBlockStyle,
	type TextEditorCoreProps,
	type TextEditorEditableProps,
	type TextEditorExternalLinkOptions,
	type TextEditorToolbarComponents
} from "../src/text-editor";

const blockStyles: readonly TextEditorBlockStyle[] = ["unstyled", "ordered-list-item", "unordered-list-item"];
const linkTypes: readonly LinkTypes[] = [LinkTypes.LINK];
const toolbarComponents = {
	blocks: true,
	blockStyles,
	links: true,
	linkTypes,
	clearSemanticTag: false
} satisfies TextEditorToolbarComponents;
const editableProps = {
	id: "document-input",
	"aria-label": "Документ",
	"aria-labelledby": "document-label",
	"aria-describedby": "document-help",
	"aria-invalid": "grammar",
	"aria-required": true
} satisfies TextEditorEditableProps;
const externalLinkOptions = { allowQrCode: false } satisfies TextEditorExternalLinkOptions;
const props = {
	initialData: { html: "", raw: null },
	onChange: () => undefined,
	toolbarComponents,
	editableProps,
	externalLinkOptions
} satisfies TextEditorCoreProps;
const profileEditor = <TextEditorLexical {...props} />;
const unchangedConsumer = <TextEditorLexical initialData={{ html: "", raw: null }} onChange={() => undefined} />;

// @ts-expect-error Профиль принимает только зарегистрированные типы блочных команд.
const unknownBlock: TextEditorToolbarComponents = { blockStyles: ["image"] };
// @ts-expect-error Внешние строки не расширяют enum типов ссылок.
const unknownLink: TextEditorToolbarComponents = { linkTypes: ["sms"] };
// @ts-expect-error Пропсы доступности не подменяют управление Lexical contentEditable.
const replaceEditable: TextEditorEditableProps = { contentEditable: false };
// @ts-expect-error Обработчики ввода остаются ответственностью редактора.
const replaceInput: TextEditorEditableProps = { onInput: () => undefined };
// @ts-expect-error Новый API доступности не открывает произвольный HTML.
const replaceContent: TextEditorEditableProps = { dangerouslySetInnerHTML: { __html: "<p>Текст</p>" } };
// @ts-expect-error Настройка QR является флагом, а не строковым режимом.
const invalidQr: TextEditorExternalLinkOptions = { allowQrCode: "false" };

void profileEditor;
void unchangedConsumer;
void unknownBlock;
void unknownLink;
void replaceEditable;
void replaceInput;
void replaceContent;
void invalidQr;
