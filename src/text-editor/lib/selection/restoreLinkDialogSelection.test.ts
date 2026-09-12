import { $createParagraphNode, $createTextNode, $getRoot, createEditor } from "lexical";
import { describe, expect, it } from "vitest";

import { $restoreLinkDialogSelection } from "./restoreLinkDialogSelection";

describe("безопасное восстановление места вставки ссылки", () => {
	it("создаёт абзац только при подтверждении в действительно пустом корне", () => {
		const editor = createEditor({
			onError: (error) => {
				throw error;
			}
		});
		editor.update(
			() => {
				const root = $getRoot();
				expect(root.isEmpty()).toBe(true);
				const selection = $restoreLinkDialogSelection(null);
				expect(root.getChildrenSize()).toBe(1);
				expect(selection.anchor.getNode().getType()).toBe("paragraph");
				expect(selection.isCollapsed()).toBe(true);
			},
			{ discrete: true }
		);
	});
	it.each(["removed", "shortened"])("устаревший диапазон %s заменяет вставкой в конец", (change) => {
		const editor = createEditor({
			onError: (error) => {
				throw error;
			}
		});
		editor.update(
			() => {
				const text = $createTextNode("Исходный текст");
				const tail = $createTextNode("Конец");
				$getRoot().append($createParagraphNode().append(text), $createParagraphNode().append(tail));
				const snapshot = text.select(10, 12).clone();
				if (change === "removed") text.remove();
				else text.setTextContent("Кратко");
				const selection = $restoreLinkDialogSelection(snapshot);
				expect(selection.anchor.key).toBe(tail.getKey());
				expect(selection.anchor.offset).toBe(5);
				expect(selection.isCollapsed()).toBe(true);
			},
			{ discrete: true }
		);
	});
});
