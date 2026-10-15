import { createEmptyTextEditorLexicalRaw, type TextEditorLexicalRaw } from "../src/text-editor";

const raw: TextEditorLexicalRaw = createEmptyTextEditorLexicalRaw();
const factory: () => TextEditorLexicalRaw = createEmptyTextEditorLexicalRaw;

void raw;
void factory;
