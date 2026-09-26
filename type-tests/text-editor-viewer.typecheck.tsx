import { TextEditorLexicalViewer, type TextEditorLexicalRaw, type TextEditorLexicalViewerProps } from "../src/text-editor";

const raw: TextEditorLexicalRaw = {
	format: "lexical",
	version: 1,
	editorState: { root: { type: "root", version: 1, children: [], direction: null, format: "", indent: 0 } }
};

const props = { raw, className: "article", fallback: null } satisfies TextEditorLexicalViewerProps;
const viewer = <TextEditorLexicalViewer {...props} />;
const customFallback = <TextEditorLexicalViewer raw={raw} fallback={<span>Нет содержимого</span>} />;
// @ts-expect-error Viewer принимает версионированный raw, а не готовый HTML.
const unsupportedHtml = <TextEditorLexicalViewer raw="<p>HTML</p>" />;
// @ts-expect-error Read-only API не предоставляет мутации или editor onChange.
const unsupportedChange = <TextEditorLexicalViewer raw={raw} onChange={() => undefined} />;

void viewer;
void customFallback;
void unsupportedHtml;
void unsupportedChange;
