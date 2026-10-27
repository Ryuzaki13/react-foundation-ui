import { createRef } from "react";

import { act, render, type RenderResult } from "@testing-library/react";
import { $getRoot, $isElementNode, $isTextNode, getNearestEditorFromDOMNode, type LexicalEditor } from "lexical";
import { type Mock, vi } from "vitest";

import { type TextEditorClipboardOptions, type TextEditorData, type TextEditorHandle, type TextEditorLexicalRaw } from "./editorModel";
import { TextEditorLexicalClient } from "./TextEditorLexicalClient";

type ClipboardEditorFixtureOptions = {
	readonly initialData?: TextEditorData;
	readonly clipboardOptions?: TextEditorClipboardOptions;
};

type ClipboardEditorFixture = {
	readonly editor: LexicalEditor;
	readonly input: HTMLElement;
	readonly onChange: Mock<(data: TextEditorData<TextEditorLexicalRaw>) => void>;
	readonly handle: TextEditorHandle;
	readonly view: RenderResult;
};

type ClipboardBlockFixture = {
	readonly key: string;
	readonly type: string;
	readonly format: string;
	readonly text: string;
};

/** Создаёт настоящий client с его nodes, import, onChange и lifecycle, без подмены документа. */
export function mountClipboardEditor({
	initialData = { html: "", raw: null },
	clipboardOptions
}: ClipboardEditorFixtureOptions = {}): ClipboardEditorFixture {
	const ref = createRef<TextEditorHandle>();
	const onChange = vi.fn<(data: TextEditorData<TextEditorLexicalRaw>) => void>();
	const view = render(
		<TextEditorLexicalClient ref={ref} initialData={initialData} clipboardOptions={clipboardOptions} onChange={onChange} />
	);
	const input = view.container.querySelector<HTMLElement>('[role="textbox"]');
	if (!input || !ref.current) throw new Error("Не подключён настоящий clipboard editor");
	return { input, editor: getNearestEditorFromDOMNode(input), onChange, handle: ref.current, view };
}

/** Только event shell отсутствует в jsdom; разбор MIME, HTML и Raw выполняет установленный Lexical. */
export async function pasteClipboard(
	fixture: ClipboardEditorFixture,
	data: Readonly<Record<string, string>>,
	placement: "replace" | "append" | "current" = "replace"
): Promise<Event> {
	const event = new Event("paste", { bubbles: true, cancelable: true });
	Object.defineProperty(event, "clipboardData", {
		value: { types: Object.keys(data), files: [], getData: (type: string) => data[type] ?? "" }
	});
	await act(async () => {
		fixture.editor.update(
			() => {
				const root = $getRoot();
				if (placement === "replace") {
					const first = root.getFirstDescendant();
					const last = root.getLastDescendant();
					if ($isTextNode(first) && $isTextNode(last)) {
						// После отказа вставки остаётся настоящее текстовое выделение, а не искусственный root anchor.
						const selection = first.select(0, first.getTextContentSize());
						selection.focus.set(last.getKey(), last.getTextContentSize(), "text");
					} else root.select(0, root.getChildrenSize());
				} else if (placement === "append") root.selectEnd();
				fixture.input.dispatchEvent(event);
			},
			{ discrete: true }
		);
	});
	return event;
}

/** Проверяет смысл импортированных блоков, не закрепляя число технических DOM-обёрток. */
export function readClipboardBlocks(editor: LexicalEditor): readonly ClipboardBlockFixture[] {
	return editor.getEditorState().read(() => {
		const result: ClipboardBlockFixture[] = [];
		const pending = [...$getRoot().getChildren()];
		while (pending.length) {
			const node = pending.pop();
			if (!$isElementNode(node)) continue;
			if (!node.isInline())
				result.push({ key: node.getKey(), type: node.getType(), format: node.getFormatType(), text: node.getTextContent() });
			pending.push(...node.getChildren());
		}
		return result;
	});
}
