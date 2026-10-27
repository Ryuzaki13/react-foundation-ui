import { createRef, StrictMode } from "react";

import { act, render, screen, waitFor } from "@testing-library/react";
import {
	$getRoot,
	$getSelection,
	$isRangeSelection,
	$isTextNode,
	CONTROLLED_TEXT_INSERTION_COMMAND,
	getNearestEditorFromDOMNode,
	HISTORY_PUSH_TAG,
	type LexicalEditor,
	REDO_COMMAND,
	SKIP_SCROLL_INTO_VIEW_TAG,
	UNDO_COMMAND
} from "lexical";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { TextEditorLexicalClient } from "./TextEditorLexicalClient";

import { TextEditorLexical, type TextEditorFocusHandle } from "./index";

const rangeRect = Object.getOwnPropertyDescriptor(Range.prototype, "getBoundingClientRect");
beforeAll(() => {
	Object.defineProperty(Range.prototype, "getBoundingClientRect", { configurable: true, value: () => new DOMRect() });
});
afterAll(() => {
	if (rangeRect) Object.defineProperty(Range.prototype, "getBoundingClientRect", rangeRect);
	else Reflect.deleteProperty(Range.prototype, "getBoundingClientRect");
});

const initialData = { html: "<p>Документ для продолжения</p>", raw: null };

function requireEditor(input: HTMLElement): LexicalEditor {
	const editor = getNearestEditorFromDOMNode(input);
	if (!editor) throw new Error("Editable не предоставил Lexical instance.");
	return editor;
}

function readSelection(editor: LexicalEditor) {
	return editor.getEditorState().read(() => {
		const selection = $getSelection();
		if (!$isRangeSelection(selection)) throw new Error("Ожидалось сохранённое текстовое выделение.");
		return {
			anchor: { key: selection.anchor.key, offset: selection.anchor.offset },
			focus: { key: selection.focus.key, offset: selection.focus.offset }
		};
	});
}

function requireOutsideButton(): HTMLButtonElement {
	const button = document.querySelector('[data-action="outside-focus"]');
	if (!(button instanceof HTMLButtonElement)) throw new Error("Не найдена внешняя команда.");
	return button;
}

describe("явный фокус публичного редактора", () => {
	it("передаёт дополнительный handle через public client-only boundary", async () => {
		vi.stubEnv("SSR", false);
		const ref = createRef<TextEditorFocusHandle>();
		try {
			render(<TextEditorLexical ref={ref} initialData={initialData} onChange={vi.fn()} />);
			const input = await screen.findByRole("textbox");
			await act(async () => ref.current?.focus());
			expect(document.activeElement).toBe(input);
			expect(typeof ref.current?.clear).toBe("function");
		} finally {
			vi.unstubAllEnvs();
		}
	});

	it.each([undefined, { preventScroll: true }, { preventScroll: false }])(
		"согласует native и Lexical scroll policy для %j без замены editable или документа",
		async (options) => {
			const ref = createRef<TextEditorFocusHandle>();
			const onChange = vi.fn();
			render(<TextEditorLexicalClient ref={ref} initialData={initialData} onChange={onChange} />);
			const input = screen.getByRole("textbox");
			await waitFor(() => expect(input.textContent).toBe("Документ для продолжения"));
			const editor = requireEditor(input);
			const before = editor.getEditorState().toJSON();
			const focus = vi.spyOn(HTMLElement.prototype, "focus");
			const tags: ReadonlySet<string>[] = [];
			const unsubscribe = editor.registerUpdateListener(({ tags: updateTags }) => tags.push(updateTags));
			onChange.mockClear();
			try {
				await act(async () => ref.current?.focus(options));
				expect(document.activeElement).toBe(input);
				expect(screen.getByRole("textbox")).toBe(input);
				expect(requireEditor(input)).toBe(editor);
				expect(editor.getEditorState().toJSON()).toEqual(before);
				expect(onChange).not.toHaveBeenCalled();
				const ownFocusCalls = focus.mock.contexts.flatMap((context, index) => (context === input ? [focus.mock.calls[index]] : []));
				expect(ownFocusCalls).toEqual([[{ preventScroll: options?.preventScroll ?? true }]]);
				expect(tags.some((value) => value.has(SKIP_SCROLL_INTO_VIEW_TAG))).toBe(options?.preventScroll !== false);
				const selection = readSelection(editor);
				expect(selection.anchor).toEqual(selection.focus);
				expect(selection.anchor.offset).toBe("Документ для продолжения".length);
			} finally {
				unsubscribe();
				focus.mockRestore();
			}
		}
	);

	it("восстанавливает прежний диапазон после внешнего действия, не перемещая каретку в конец", async () => {
		const ref = createRef<TextEditorFocusHandle>();
		render(
			<>
				<TextEditorLexicalClient ref={ref} initialData={initialData} onChange={vi.fn()} />
				<button data-action="outside-focus" type="button" />
			</>
		);
		const input = screen.getByRole("textbox");
		const editor = requireEditor(input);
		await act(async () => {
			editor.update(
				() => {
					const text = $getRoot().getFirstDescendant();
					if (!$isTextNode(text)) throw new Error("Документ потерял текстовый узел.");
					text.select(2, 7);
				},
				{ discrete: true }
			);
		});
		const selected = readSelection(editor);
		act(() => requireOutsideButton().focus());
		await act(async () => ref.current?.focus({ preventScroll: true }));
		expect(document.activeElement).toBe(input);
		expect(readSelection(editor)).toEqual(selected);
	});

	it("не добавляет шаг истории и сохраняет undo/redo введённого текста", async () => {
		const ref = createRef<TextEditorFocusHandle>();
		render(<TextEditorLexicalClient ref={ref} initialData={initialData} onChange={vi.fn()} />);
		const input = screen.getByRole("textbox");
		const editor = requireEditor(input);
		const before = editor.getEditorState().toJSON();
		await act(async () => ref.current?.focus());
		await act(async () => {
			editor.update(() => editor.dispatchCommand(CONTROLLED_TEXT_INSERTION_COMMAND, " Продолжение"), {
				discrete: true,
				tag: HISTORY_PUSH_TAG
			});
		});
		const after = editor.getEditorState().toJSON();
		expect(after).not.toEqual(before);
		await act(async () => ref.current?.focus());
		await act(async () => editor.dispatchCommand(UNDO_COMMAND, undefined));
		expect(editor.getEditorState().toJSON()).toEqual(before);
		await act(async () => editor.dispatchCommand(REDO_COMMAND, undefined));
		expect(editor.getEditorState().toJSON()).toEqual(after);
	});

	it("readOnly и реальный editor.isEditable запрещают фокус без влияния на clear", async () => {
		const ref = createRef<TextEditorFocusHandle>();
		const view = render(
			<>
				<TextEditorLexicalClient ref={ref} readOnly initialData={initialData} onChange={vi.fn()} />
				<button data-action="outside-focus" type="button" />
			</>
		);
		const input = screen.getByRole("textbox");
		const outside = requireOutsideButton();
		act(() => outside.focus());
		await act(async () => ref.current?.focus());
		expect(document.activeElement).toBe(outside);
		view.rerender(
			<>
				<TextEditorLexicalClient ref={ref} initialData={initialData} onChange={vi.fn()} />
				<button data-action="outside-focus" type="button" />
			</>
		);
		act(() => requireEditor(input).setEditable(false));
		await act(async () => ref.current?.focus());
		expect(document.activeElement).toBe(outside);
		await act(async () => ref.current?.clear());
		expect(input.textContent).toBe("");
		expect(document.activeElement).toBe(outside);
	});

	it("отсоединённый root не получает фокус", async () => {
		const ref = createRef<TextEditorFocusHandle>();
		const container = document.createElement("div");
		const focus = vi.spyOn(HTMLElement.prototype, "focus");
		const view = render(<TextEditorLexicalClient ref={ref} initialData={initialData} onChange={vi.fn()} />, { container });
		try {
			const input = view.getByRole("textbox");
			await act(async () => ref.current?.focus());
			expect(focus.mock.contexts).not.toContain(input);
		} finally {
			view.unmount();
			focus.mockRestore();
		}
	});

	it("отзывает handle при замене ref и unmount", async () => {
		const first = createRef<TextEditorFocusHandle>();
		const next = createRef<TextEditorFocusHandle>();
		const view = render(<TextEditorLexicalClient ref={first} initialData={initialData} onChange={vi.fn()} />);
		const input = screen.getByRole("textbox");
		const stale = first.current;
		view.rerender(<TextEditorLexicalClient ref={next} initialData={initialData} onChange={vi.fn()} />);
		const focus = vi.spyOn(HTMLElement.prototype, "focus");
		try {
			await act(async () => stale?.focus());
			expect(focus.mock.contexts).not.toContain(input);
			await act(async () => next.current?.focus());
			expect(document.activeElement).toBe(input);
			const unmounted = next.current;
			view.unmount();
			focus.mockClear();
			await act(async () => unmounted?.focus());
			expect(focus).not.toHaveBeenCalled();
		} finally {
			focus.mockRestore();
		}
	});

	it("StrictMode отзывает первую handle и предоставляет действующий focus без повторной инициализации", async () => {
		const handles: TextEditorFocusHandle[] = [];
		const ref = (handle: TextEditorFocusHandle | null) => {
			if (handle !== null) handles.push(handle);
		};
		const focus = vi.spyOn(HTMLElement.prototype, "focus");
		try {
			render(
				<StrictMode>
					<TextEditorLexicalClient ref={ref} initialData={initialData} onChange={vi.fn()} />
				</StrictMode>
			);
			const input = screen.getByRole("textbox");
			expect(focus.mock.contexts).not.toContain(input);
			const first = handles[0];
			const current = handles.at(-1);
			if (!first || !current || first === current) throw new Error("StrictMode не переустановил imperative handle.");
			await act(async () => first.focus());
			expect(focus.mock.contexts).not.toContain(input);
			await act(async () => current.focus());
			expect(document.activeElement).toBe(input);
			expect(input.textContent).toBe("Документ для продолжения");
		} finally {
			focus.mockRestore();
		}
	});
});
