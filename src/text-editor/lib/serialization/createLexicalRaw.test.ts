import { $createListItemNode, $createListNode, ListItemNode, ListNode } from "@lexical/list";
import { $createHeadingNode, $createQuoteNode, HeadingNode, QuoteNode } from "@lexical/rich-text";
import { $createParagraphNode, $createTextNode, $getRoot, createEditor } from "lexical";
import { describe, expect, it, vi } from "vitest";

import { $createAccessibleLinkNode, AccessibleLinkNode } from "../../nodes/AccessibleLinkNode";

import { createLexicalRaw } from "./createLexicalRaw";

describe("JSON-снимок состояния Lexical", () => {
	it("убирает optional undefined SDK на любой глубине, не изменяя исходное состояние", () => {
		const editor = createEditor({
			namespace: "raw-serialization-optional-fields",
			onError: (error) => {
				throw error;
			}
		});
		editor.update(() => $getRoot().append($createParagraphNode().append($createTextNode("Текст 👋"))), { discrete: true });
		const state = editor.getEditorState();
		const sdkState = state.toJSON();
		// Версии SDK по-разному экспортируют optional поля. Подмена только формы
		// toJSON воспроизводит enumerable undefined, сохраняя настоящий EditorState.
		const source = {
			...sdkState,
			optional: undefined,
			root: {
				...sdkState.root,
				textFormat: undefined,
				textStyle: undefined,
				children: sdkState.root.children.map((node) => ({ ...node, optional: undefined }))
			}
		};
		const originalSource = structuredClone(source);
		const toJson = vi.spyOn(state, "toJSON").mockReturnValue(source);
		const expected: unknown = JSON.parse(JSON.stringify(source));

		try {
			const raw = createLexicalRaw(state);
			const restored: unknown = JSON.parse(JSON.stringify(raw));

			expect(raw.editorState).toStrictEqual(expected);
			expect(raw).toStrictEqual(restored);
			expect(toJson).toHaveBeenCalledTimes(1);
			expect(source).toHaveProperty("optional", undefined);
			expect(source.root).toHaveProperty("textFormat", undefined);
			expect(source.root).toHaveProperty("textStyle", undefined);
			expect(source.root.children[0]).toHaveProperty("optional", undefined);
			expect(source).toStrictEqual(originalSource);
			expect(source.root.children).toMatchObject(sdkState.root.children);
			state.read(() => expect($getRoot().getTextContent()).toBe("Текст 👋"));
		} finally {
			toJson.mockRestore();
		}
	});

	it("сохраняет форматирование, списки, Unicode, нули, пустые строки и null при чтении Lexical", () => {
		const editor = createEditor({
			namespace: "raw-serialization-rich-document",
			nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, AccessibleLinkNode],
			onError: (error) => {
				throw error;
			}
		});
		editor.update(
			() => {
				const link = $createAccessibleLinkNode("https://example.org/?value=0", { ariaLabel: null, qrCode: false });
				link.append($createTextNode("Ссылка"));
				$getRoot().append(
					$createHeadingNode("h2").append($createTextNode("Заголовок 👩‍💻")),
					$createQuoteNode().append($createTextNode("引用")),
					$createParagraphNode().append($createTextNode("Жирный").toggleFormat("bold"), link),
					$createListNode("number", 4).append($createListItemNode().setValue(4).append($createTextNode("Пункт 0"))),
					$createListNode("bullet").append($createListItemNode().append($createTextNode("É é"))),
					$createParagraphNode()
				);
			},
			{ discrete: true }
		);
		const state = editor.getEditorState();
		const expected: unknown = JSON.parse(JSON.stringify(state.toJSON()));
		const raw = createLexicalRaw(state);
		const restored: unknown = JSON.parse(JSON.stringify(raw));

		expect(raw).toStrictEqual(restored);
		expect(raw.editorState).toStrictEqual(expected);
		expect(raw.editorState).toMatchObject({
			root: {
				direction: null,
				format: "",
				indent: 0,
				children: [
					{ type: "heading", tag: "h2", children: [{ text: "Заголовок 👩‍💻", format: 0, style: "" }] },
					{ type: "quote", children: [{ text: "引用" }] },
					{
						type: "paragraph",
						children: [
							{ text: "Жирный", format: 1 },
							{
								type: "accessible-link",
								ariaLabel: null,
								qrCode: false,
								add: null,
								text: null,
								children: [{ text: "Ссылка" }]
							}
						]
					},
					{ type: "list", listType: "number", start: 4, children: [{ value: 4, children: [{ text: "Пункт 0" }] }] },
					{ type: "list", listType: "bullet", children: [{ children: [{ text: "É é" }] }] },
					{ type: "paragraph", children: [], direction: null, indent: 0, format: "" }
				]
			}
		});
		const parsedState = editor.parseEditorState(JSON.stringify(raw.editorState));
		const parsedJson: unknown = JSON.parse(JSON.stringify(parsedState.toJSON()));
		expect(parsedJson).toStrictEqual(expected);
	});

	it("сериализует пустой документ в читаемый Lexical JSON", () => {
		const editor = createEditor({
			namespace: "raw-serialization-empty-document",
			onError: (error) => {
				throw error;
			}
		});
		editor.update(() => $getRoot().append($createParagraphNode()), { discrete: true });
		const raw = createLexicalRaw(editor.getEditorState());
		const restored: unknown = JSON.parse(JSON.stringify(raw));

		expect(raw).toStrictEqual(restored);
		expect(raw.editorState).toMatchObject({ root: { children: [{ type: "paragraph", children: [] }] } });
		editor.parseEditorState(JSON.stringify(raw.editorState)).read(() => expect($getRoot().getTextContent()).toBe(""));
	});
});
