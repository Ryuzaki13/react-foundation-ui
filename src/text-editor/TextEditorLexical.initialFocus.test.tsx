import { createRef, StrictMode } from "react";

import { act, render, screen, waitFor } from "@testing-library/react";
import {
	$getRoot,
	$getSelection,
	$isRangeSelection,
	CONTROLLED_TEXT_INSERTION_COMMAND,
	getNearestEditorFromDOMNode,
	HISTORY_PUSH_TAG,
	type LexicalEditor,
	SKIP_SCROLL_INTO_VIEW_TAG,
	UNDO_COMMAND
} from "lexical";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { TextEditorInitialFocusReadOnlyFixture } from "../test/text-editor/TextEditorInitialFocusReadOnlyFixture";

import { TextEditorLexicalClient } from "./TextEditorLexicalClient";

import { type TextEditorData, type TextEditorHandle, type TextEditorLexicalRaw, TextEditorLexical } from "./index";

const rangeRect = Object.getOwnPropertyDescriptor(Range.prototype, "getBoundingClientRect");
beforeAll(() => {
	// jsdom не рассчитывает геометрию selection. Фокус, команды и состояние
	// остаются настоящими Lexical, без подмены imperative editor API.
	Object.defineProperty(Range.prototype, "getBoundingClientRect", { configurable: true, value: () => new DOMRect() });
});
afterAll(() => {
	if (rangeRect) Object.defineProperty(Range.prototype, "getBoundingClientRect", rangeRect);
	else Reflect.deleteProperty(Range.prototype, "getBoundingClientRect");
});

const htmlData = { html: "<p>Первая строка</p><p><strong>Последняя строка</strong></p>", raw: null };
const emptyData = { html: "", raw: null };
const rawData: TextEditorData<TextEditorLexicalRaw> = {
	html: "<p>Этот HTML не является источником</p>",
	raw: {
		format: "lexical",
		version: 1,
		editorState: {
			root: {
				children: [
					{
						children: [{ detail: 0, format: 1, mode: "normal", style: "", text: "Текст raw", type: "text", version: 1 }],
						direction: null,
						format: "",
						indent: 0,
						type: "paragraph",
						version: 1
					}
				],
				direction: null,
				format: "",
				indent: 0,
				type: "root",
				version: 1
			}
		}
	}
};

function requireTextEditor(input: HTMLElement): LexicalEditor {
	const editor = getNearestEditorFromDOMNode(input);
	if (!editor) throw new Error("У editable отсутствует Lexical instance");
	return editor;
}

function assertEndSelection(input: HTMLElement): void {
	requireTextEditor(input)
		.getEditorState()
		.read(() => {
			const selection = $getSelection();
			if (!$isRangeSelection(selection)) throw new Error("Ожидалась каретка редактора");
			const lastNode = $getRoot().getLastDescendant();
			if (!lastNode) throw new Error("В документе отсутствует последний узел");
			expect(selection.isCollapsed()).toBe(true);
			expect(selection.anchor.key).toBe(lastNode.getKey());
			expect(selection.anchor.offset).toBe(lastNode.getTextContentSize());
		});
}

describe("начальный фокус новой сессии редактора", () => {
	it("отмена public lazy mount не переносит внешний фокус после завершения import", async () => {
		vi.stubEnv("SSR", false);
		const onChange = vi.fn();
		try {
			render(<button data-action="outside" type="button" />);
			const outside = screen.getByRole("button");
			act(() => outside.focus());
			const view = render(<TextEditorLexical autoFocus initialData={htmlData} onChange={onChange} />);
			expect(screen.queryByRole("textbox")).toBeNull();
			view.unmount();
			await act(async () => {
				await import("./TextEditorLexicalClient");
			});
			expect(screen.queryByRole("textbox")).toBeNull();
			expect(document.activeElement).toBe(outside);
			expect(onChange).not.toHaveBeenCalled();
		} finally {
			vi.unstubAllEnvs();
		}
	});

	it("передаёт autoFocus через реальную public client-only границу", async () => {
		vi.stubEnv("SSR", false);
		try {
			render(<TextEditorLexical autoFocus initialData={htmlData} onChange={vi.fn()} />);
			const input = await screen.findByRole("textbox");
			await waitFor(() => expect(document.activeElement).toBe(input));
			assertEndSelection(input);
		} finally {
			vi.unstubAllEnvs();
		}
	});

	it.each([undefined, false])("autoFocus=%s сохраняет прежний внешний фокус", async (autoFocus) => {
		const outsideView = render(<button type="button" />);
		const outside = screen.getByRole("button");
		act(() => outside.focus());
		render(<TextEditorLexicalClient autoFocus={autoFocus} initialData={htmlData} onChange={vi.fn()} />);
		await act(async () => undefined);
		expect(document.activeElement).toBe(outside);
		outsideView.unmount();
	});

	it.each([
		["HTML", htmlData],
		["raw", rawData],
		["пустой документ", emptyData]
	])("%s получает каретку в конце без изменения содержимого и нового onChange", async (_source, initialData) => {
		const baselineChange = vi.fn();
		const baseline = render(<TextEditorLexicalClient initialData={initialData} onChange={baselineChange} />);
		await act(async () => undefined);
		const baselineState = requireTextEditor(screen.getByRole("textbox")).getEditorState().toJSON();
		const baselineCalls = baselineChange.mock.calls.length;
		baseline.unmount();

		const onChange = vi.fn();
		render(<TextEditorLexicalClient autoFocus initialData={initialData} onChange={onChange} />);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(document.activeElement).toBe(input));
		assertEndSelection(input);
		expect(requireTextEditor(input).getEditorState().toJSON()).toEqual(baselineState);
		expect(onChange.mock.calls.length).toBe(baselineCalls);
	});

	it("начальный фокус не добавляет шаг undo, новый ввод отменяется к исходному документу", async () => {
		render(<TextEditorLexicalClient autoFocus initialData={htmlData} onChange={vi.fn()} />);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(document.activeElement).toBe(input));
		const editor = requireTextEditor(input);
		const baseline = editor.getEditorState().toJSON();
		await act(async () => {
			editor.dispatchCommand(UNDO_COMMAND, undefined);
		});
		expect(editor.getEditorState().toJSON()).toEqual(baseline);
		await act(async () => {
			editor.update(() => editor.dispatchCommand(CONTROLLED_TEXT_INSERTION_COMMAND, " Добавление"), {
				discrete: true,
				tag: HISTORY_PUSH_TAG
			});
		});
		expect(editor.getEditorState().toJSON()).not.toEqual(baseline);
		await act(async () => {
			editor.dispatchCommand(UNDO_COMMAND, undefined);
		});
		expect(editor.getEditorState().toJSON()).toEqual(baseline);
	});

	it("начальный readOnly отменяет focus, разблокировка и переключение prop его не возвращают", async () => {
		render(<button type="button" />);
		const outside = screen.getByRole("button");
		act(() => outside.focus());
		const onChange = vi.fn();
		const view = render(<TextEditorLexicalClient autoFocus readOnly initialData={htmlData} onChange={onChange} />);
		const input = screen.getByRole("textbox");
		await act(async () => undefined);
		expect(document.activeElement).toBe(outside);
		view.rerender(<TextEditorLexicalClient autoFocus initialData={htmlData} onChange={onChange} />);
		expect(requireTextEditor(input).isEditable()).toBe(true);
		expect(document.activeElement).toBe(outside);
		view.rerender(<TextEditorLexicalClient autoFocus={false} initialData={htmlData} onChange={onChange} />);
		view.rerender(<TextEditorLexicalClient autoFocus initialData={htmlData} onChange={onChange} />);
		await act(async () => undefined);
		expect(document.activeElement).toBe(outside);
	});

	it("позднее включение autoFocus не фокусирует уже существующую сессию", async () => {
		render(<button type="button" />);
		const outside = screen.getByRole("button");
		act(() => outside.focus());
		const onChange = vi.fn();
		const view = render(<TextEditorLexicalClient initialData={htmlData} onChange={onChange} />);
		view.rerender(<TextEditorLexicalClient autoFocus initialData={htmlData} onChange={onChange} />);
		await act(async () => undefined);
		expect(document.activeElement).toBe(outside);
	});

	it("rerender, смена initializer и readOnly не повторяют начальный фокус", async () => {
		render(<button type="button" />);
		const outside = screen.getByRole("button");
		const onChange = vi.fn();
		const view = render(<TextEditorLexicalClient autoFocus initialData={htmlData} onChange={onChange} />);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(document.activeElement).toBe(input));
		const baseline = requireTextEditor(input).getEditorState().toJSON();
		act(() => outside.focus());
		view.rerender(<TextEditorLexicalClient autoFocus={false} initialData={rawData} onChange={onChange} />);
		view.rerender(<TextEditorLexicalClient autoFocus readOnly initialData={rawData} onChange={onChange} />);
		view.rerender(<TextEditorLexicalClient autoFocus initialData={htmlData} onChange={onChange} />);
		await act(async () => undefined);
		expect(screen.getByRole("textbox")).toBe(input);
		expect(document.activeElement).toBe(outside);
		expect(requireTextEditor(input).getEditorState().toJSON()).toEqual(baseline);
	});

	it("clear не запускает autoFocus повторно и сохраняет внешний фокус", async () => {
		render(<button type="button" />);
		const outside = screen.getByRole("button");
		const ref = createRef<TextEditorHandle>();
		render(<TextEditorLexicalClient autoFocus ref={ref} initialData={htmlData} onChange={vi.fn()} />);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(document.activeElement).toBe(input));
		act(() => outside.focus());
		await act(async () => ref.current?.clear());
		expect(input.textContent).toBe("");
		expect(document.activeElement).toBe(outside);
	});

	it("StrictMode выполняет один native focus с preventScroll", async () => {
		const focus = vi.spyOn(HTMLElement.prototype, "focus");
		try {
			render(
				<StrictMode>
					<TextEditorLexicalClient autoFocus initialData={htmlData} onChange={vi.fn()} />
				</StrictMode>
			);
			const input = screen.getByRole("textbox");
			await waitFor(() => expect(document.activeElement).toBe(input));
			const ownFocusCalls = focus.mock.contexts.flatMap((context, index) => (context === input ? [focus.mock.calls[index]] : []));
			expect(ownFocusCalls).toEqual([[{ preventScroll: true }]]);
			assertEndSelection(input);
		} finally {
			focus.mockRestore();
		}
	});

	it("focus update запрещает отдельную прокрутку каретки Lexical", async () => {
		const updateTags: ReadonlySet<string>[] = [];
		let unsubscribe: () => void = () => undefined;
		const ref = (handle: TextEditorHandle | null) => {
			if (!handle) return;
			const input = document.getElementById("initial-focus-editor");
			if (!input) throw new Error("Editable не подключён к document");
			unsubscribe = requireTextEditor(input).registerUpdateListener(({ tags }) => {
				updateTags.push(tags);
			});
		};
		try {
			render(
				<TextEditorLexicalClient
					autoFocus
					ref={ref}
					editableProps={{ id: "initial-focus-editor" }}
					initialData={htmlData}
					onChange={vi.fn()}
				/>
			);
			await act(async () => undefined);
			const focusUpdates = updateTags.filter((tags) => tags.has(SKIP_SCROLL_INTO_VIEW_TAG));
			expect(focusUpdates).toHaveLength(1);
		} finally {
			unsubscribe();
		}
	});

	it("текущий editor.isEditable блокирует focus независимо от начального readOnly prop", async () => {
		render(<button type="button" />);
		const outside = screen.getByRole("button");
		act(() => outside.focus());
		render(<TextEditorInitialFocusReadOnlyFixture />);
		await act(async () => undefined);
		expect(requireTextEditor(screen.getByRole("textbox")).isEditable()).toBe(false);
		expect(document.activeElement).toBe(outside);
	});

	it("отсоединённый root не фокусируется после подключения его container", async () => {
		const container = document.createElement("div");
		const focus = vi.spyOn(HTMLElement.prototype, "focus");
		const view = render(<TextEditorLexicalClient autoFocus initialData={htmlData} onChange={vi.fn()} />, { container });
		try {
			const input = view.getByRole("textbox");
			expect(input.isConnected).toBe(false);
			expect(focus.mock.contexts).not.toContain(input);
			document.body.append(container);
			await act(async () => undefined);
			expect(focus.mock.contexts).not.toContain(input);
		} finally {
			view.unmount();
			container.remove();
			focus.mockRestore();
		}
	});

	it("новый key создаёт новый фокус, отменённая сессия не имеет позднего callback", async () => {
		render(<button type="button" />);
		const outside = screen.getByRole("button");
		const onChange = vi.fn();
		const view = render(<TextEditorLexicalClient key="first" autoFocus initialData={htmlData} onChange={onChange} />);
		const firstInput = screen.getByRole("textbox");
		await waitFor(() => expect(document.activeElement).toBe(firstInput));
		act(() => outside.focus());
		view.rerender(<TextEditorLexicalClient key="next" autoFocus initialData={rawData} onChange={onChange} />);
		const nextInput = screen.getByRole("textbox");
		expect(nextInput).not.toBe(firstInput);
		await waitFor(() => expect(document.activeElement).toBe(nextInput));
		assertEndSelection(nextInput);
		view.unmount();
		act(() => outside.focus());
		await act(async () => undefined);
		expect(document.activeElement).toBe(outside);
	});
});
