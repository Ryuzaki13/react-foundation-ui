// @vitest-environment jsdom
import { $generateNodesFromDOM } from "@lexical/html";
import { $createParagraphNode, $createTextNode, $getRoot, $insertNodes, createEditor, IS_BOLD, IS_ITALIC, IS_UNDERLINE } from "lexical";
import { describe, expect, it } from "vitest";

import { $createSemanticTagNode, SemanticTagNode } from "./SemanticTagNode";

function createImportEditor() {
	return createEditor({
		namespace: "semantic-html-import",
		nodes: [SemanticTagNode],
		onError(error) {
			throw error;
		}
	});
}

/** Использует настоящий HTML importer Lexical, без заранее подготовленного Raw. */
function importHtml(html: string) {
	const editor = createImportEditor();
	editor.update(
		() => {
			const paragraph = $createParagraphNode();
			$getRoot().append(paragraph);
			paragraph.select();
			$insertNodes($generateNodesFromDOM(editor, new DOMParser().parseFromString(html, "text/html")));
		},
		{ discrete: true }
	);
	return editor.getEditorState().toJSON();
}

describe("HTML-импорт обычных и семантических span", () => {
	it.each([
		"<span>Скопированный текст</span>",
		'<p><span style="color: rgb(255, 255, 255); white-space: pre-wrap;">Скопированный текст</span></p>',
		'<p><span class="Apple-converted-space">Скопированный текст</span></p>',
		'<p><span lang="fr">Bonjour</span><span>Скопированный текст</span></p>'
	])("не превращает обычную обёртку в semantic-tag: %s", (html) => {
		expect(importHtml(html).root.children).toMatchObject([
			{
				type: "paragraph",
				children: expect.arrayContaining([expect.objectContaining({ type: "text", text: "Скопированный текст" })])
			}
		]);
	});

	it("сохраняет inline-форматирование внутри обычной span-обёртки", () => {
		expect(importHtml("<p><span><strong>Жирный</strong> <em>Курсив</em></span></p>").root.children).toMatchObject([
			{
				type: "paragraph",
				children: [
					{ type: "text", text: "Жирный", format: 1 },
					{ type: "text", text: " ", format: 0 },
					{ type: "text", text: "Курсив", format: 2 }
				]
			}
		]);
	});

	it("сохраняет поддерживаемое CSS-форматирование span через стандартный импортёр", () => {
		const html = '<p><span style="font-weight: 700; font-style: italic; text-decoration: underline;">Выделенный текст</span></p>';
		expect(importHtml(html).root.children).toMatchObject([
			{
				type: "paragraph",
				children: [{ type: "text", text: "Выделенный текст", format: IS_BOLD | IS_ITALIC | IS_UNDERLINE, style: "" }]
			}
		]);
	});

	it.each(["fr", ""])("сохраняет явную языковую семантику lang=%j", (lang) => {
		expect(importHtml(`<p><span lang="${lang}"><strong>Bonjour</strong></span></p>`).root.children).toMatchObject([
			{
				type: "paragraph",
				children: [
					{ type: "semantic-tag", tag: "span", attributes: { lang }, children: [{ type: "text", text: "Bonjour", format: 1 }] }
				]
			}
		]);
	});

	it.each(["abbr", "time", "cite", "del", "ins"])("сохраняет настоящий тег %s", (tag) => {
		expect(importHtml(`<p><${tag}>Значение</${tag}></p>`).root.children).toMatchObject([
			{ type: "paragraph", children: [{ type: "semantic-tag", tag, children: [{ type: "text", text: "Значение" }] }] }
		]);
	});

	it("не меняет прежний semantic-span при восстановлении из Raw", () => {
		const editor = createImportEditor();
		editor.update(
			() => {
				const paragraph = $createParagraphNode();
				paragraph.append(
					$createSemanticTagNode("span", { style: "color: red" }, "Сохранённый текст").append(
						$createTextNode("Сохранённый текст")
					)
				);
				$getRoot().append(paragraph);
			},
			{ discrete: true }
		);
		const stored = editor.getEditorState().toJSON();
		const restored = createImportEditor();
		restored.setEditorState(restored.parseEditorState(stored));
		expect(restored.getEditorState().toJSON()).toStrictEqual(stored);
	});
});
