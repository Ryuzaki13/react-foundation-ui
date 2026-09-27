import { $generateNodesFromDOM } from "@lexical/html";
import { $createParagraphNode, $getRoot, type LexicalEditor } from "lexical";

/** Выполняется только внутри начальной Lexical update, до публикации imperative ref. */
export function initializeTextEditorHtml(editor: LexicalEditor, html: string): void {
	const dom = new DOMParser().parseFromString(html, "text/html");
	const nodes = $generateNodesFromDOM(editor, dom);
	$getRoot().append(...(nodes.length ? nodes : [$createParagraphNode()]));
}
