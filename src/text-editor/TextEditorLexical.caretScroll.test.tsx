import { StrictMode } from "react";

import { act, render, screen } from "@testing-library/react";
import {
	$getRoot,
	CONTROLLED_TEXT_INSERTION_COMMAND,
	getNearestEditorFromDOMNode,
	INSERT_LINE_BREAK_COMMAND,
	INSERT_PARAGRAPH_COMMAND,
	KEY_DOWN_COMMAND,
	REDO_COMMAND,
	SKIP_SCROLL_INTO_VIEW_TAG,
	UNDO_COMMAND
} from "lexical";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { TextEditorLexicalClient } from "./TextEditorLexicalClient";

const originalRangeRect = Object.getOwnPropertyDescriptor(Range.prototype, "getBoundingClientRect");
beforeAll(() => {
	Object.defineProperty(Range.prototype, "getBoundingClientRect", { configurable: true, value: () => new DOMRect() });
});
afterAll(() => {
	if (originalRangeRect) Object.defineProperty(Range.prototype, "getBoundingClientRect", originalRangeRect);
	else Reflect.deleteProperty(Range.prototype, "getBoundingClientRect");
});

describe("прокрутка compact Lexical", () => {
	it("помечает Enter, Shift+Enter и ввод до reconciliation, сохраняя документ и undo", async () => {
		render(
			<StrictMode>
				<TextEditorLexicalClient
					autoFocus
					presentation="compact"
					initialData={{ html: "<p>Текст</p>", raw: null }}
					onChange={vi.fn()}
				/>
			</StrictMode>
		);
		const input = screen.getByRole("textbox");
		const editor = getNearestEditorFromDOMNode(input);
		const tags: boolean[] = [];
		const unsubscribe = editor.registerUpdateListener(({ tags: updateTags, dirtyElements, dirtyLeaves }) => {
			// SDK также публикует no-op flush предыдущего command state перед
			// historic restore. Здесь проверяем commits самого документа.
			if (dirtyElements.size || dirtyLeaves.size) tags.push(updateTags.has(SKIP_SCROLL_INTO_VIEW_TAG));
		});
		await act(async () => editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined));
		await act(async () => editor.dispatchCommand(CONTROLLED_TEXT_INSERTION_COMMAND, "Строка"));
		await act(async () => editor.dispatchCommand(INSERT_LINE_BREAK_COMMAND, false));
		await act(async () => editor.dispatchCommand(CONTROLLED_TEXT_INSERTION_COMMAND, "Продолжение"));
		expect(input.textContent).toBe("ТекстСтрокаПродолжение");
		expect(input.querySelectorAll("p").length).toBe(2);
		await act(async () => editor.dispatchCommand(UNDO_COMMAND, undefined));
		await act(async () => editor.dispatchCommand(REDO_COMMAND, undefined));
		expect(input.textContent).toBe("ТекстСтрокаПродолжение");
		expect(tags.length).toBeGreaterThanOrEqual(6);
		expect(tags.every(Boolean)).toBe(true);
		unsubscribe();
	});

	it("помечает selection-only клавиатуру без изменения дерева", async () => {
		render(
			<TextEditorLexicalClient
				autoFocus
				presentation="compact"
				initialData={{ html: "<p>Текст</p>", raw: null }}
				onChange={vi.fn()}
			/>
		);
		const editor = getNearestEditorFromDOMNode(screen.getByRole("textbox"));
		const before = editor.getEditorState().toJSON();
		let skipsScroll = false;
		const unsubscribe = editor.registerUpdateListener(({ tags }) => {
			skipsScroll = tags.has(SKIP_SCROLL_INTO_VIEW_TAG);
		});
		await act(async () => {
			editor.update(
				() => {
					editor.dispatchCommand(KEY_DOWN_COMMAND, new KeyboardEvent("keydown", { key: "ArrowLeft" }));
					$getRoot().selectStart();
				},
				{ discrete: true }
			);
		});
		expect(skipsScroll).toBe(true);
		expect(editor.getEditorState().toJSON()).toEqual(before);
		unsubscribe();
	});

	it("при возврате в document отключает compact policy без remount документа", async () => {
		const initialData = { html: "<p>Текст</p>", raw: null };
		const onChange = vi.fn();
		const view = render(<TextEditorLexicalClient autoFocus presentation="compact" initialData={initialData} onChange={onChange} />);
		const input = screen.getByRole("textbox");
		const editor = getNearestEditorFromDOMNode(input);
		view.rerender(<TextEditorLexicalClient autoFocus presentation="document" initialData={initialData} onChange={onChange} />);
		expect(screen.getByRole("textbox")).toBe(input);
		let skipsScroll = true;
		const unsubscribe = editor.registerUpdateListener(({ tags }) => {
			skipsScroll = tags.has(SKIP_SCROLL_INTO_VIEW_TAG);
		});
		await act(async () => editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined));
		expect(skipsScroll).toBe(false);
		expect(input.querySelectorAll("p").length).toBe(2);
		unsubscribe();
	});
});
