// @vitest-environment node
import { isRecord } from "@ryuzaki13/react-foundation-lib/validators";
import { $getRoot, $isParagraphNode, createEditor } from "lexical";
import { describe, expect, it } from "vitest";

import { createEmptyTextEditorLexicalRaw, isLexicalTextRaw } from "../../index";

describe("публичная фабрика пустого Lexical-документа", () => {
	it("работает в Node без DOM и создаёт один пустой абзац", () => {
		expect(typeof window).toBe("undefined");
		expect(typeof document).toBe("undefined");
		const raw = createEmptyTextEditorLexicalRaw();
		expect(isLexicalTextRaw(raw)).toBe(true);
		expect(raw).toMatchObject({
			format: "lexical",
			version: 1,
			editorState: { root: { type: "root", children: [{ type: "paragraph", children: [] }] } }
		});
		const editor = createEditor({
			namespace: "empty-raw-public-roundtrip",
			onError: (error) => {
				throw error;
			}
		});
		const restored = editor.parseEditorState(JSON.stringify(raw.editorState));
		restored.read(() => {
			const root = $getRoot();
			expect(root.getChildrenSize()).toBe(1);
			expect($isParagraphNode(root.getFirstChild())).toBe(true);
			expect(root.getFirstChild()?.getTextContent()).toBe("");
			expect(root.getTextContent()).toBe("");
		});
		expect(JSON.parse(JSON.stringify(restored.toJSON()))).toStrictEqual(raw.editorState);
	});

	it("возвращает обычный JSON без undefined и сохраняет raw envelope после roundtrip", () => {
		const raw = createEmptyTextEditorLexicalRaw();
		const restored: unknown = JSON.parse(JSON.stringify(raw));
		expect(restored).toStrictEqual(raw);
		expect(isLexicalTextRaw(restored)).toBe(true);
	});

	it("каждый вызов возвращает собственное дерево, включая вложенные массивы", () => {
		const first = createEmptyTextEditorLexicalRaw();
		const second = createEmptyTextEditorLexicalRaw();
		const unchanged = structuredClone(second);
		expect(first).not.toBe(second);
		expect(first.editorState).not.toBe(second.editorState);
		expect(first.editorState.root).not.toBe(second.editorState.root);
		const firstRoot = first.editorState.root;
		const secondRoot = second.editorState.root;
		if (!isRecord(firstRoot) || !isRecord(secondRoot) || !Array.isArray(firstRoot.children) || !Array.isArray(secondRoot.children)) {
			throw new Error("Пустой документ должен содержать root с массивом children");
		}
		expect(firstRoot.children).not.toBe(secondRoot.children);
		expect(firstRoot.children[0]).not.toBe(secondRoot.children[0]);
		const paragraph = firstRoot.children[0];
		if (!isRecord(paragraph) || !Array.isArray(paragraph.children)) {
			throw new Error("Пустой документ должен содержать абзац с массивом children");
		}
		paragraph.children.push({ type: "text", text: "Изменение первого снимка" });
		expect(second).toStrictEqual(unchanged);
		expect(createEmptyTextEditorLexicalRaw()).toStrictEqual(unchanged);
	});
});
