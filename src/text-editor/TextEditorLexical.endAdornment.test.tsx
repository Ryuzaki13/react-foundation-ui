import { createRef } from "react";

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { $getRoot, $isTextNode, FORMAT_TEXT_COMMAND, getNearestEditorFromDOMNode, REDO_COMMAND, UNDO_COMMAND } from "lexical";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { type TextEditorCoreProps, type TextEditorHandle } from "./editorModel";
import { TextEditorLexical } from "./TextEditorLexical";
import { TextEditorLexicalClient } from "./TextEditorLexicalClient";

const rangeRect = Object.getOwnPropertyDescriptor(Range.prototype, "getBoundingClientRect");
beforeAll(() => {
	// jsdom не вычисляет геометрию выделения; экземпляр Lexical и его история настоящие.
	Object.defineProperty(Range.prototype, "getBoundingClientRect", { configurable: true, value: () => new DOMRect() });
});
afterAll(() => {
	if (rangeRect) Object.defineProperty(Range.prototype, "getBoundingClientRect", rangeRect);
	else Reflect.deleteProperty(Range.prototype, "getBoundingClientRect");
});

const initialData = { html: "<p>Текст документа</p>", raw: null };

function actionButton(action: string): HTMLButtonElement {
	const button = document.querySelector(`[data-action="${action}"]`);
	if (!(button instanceof HTMLButtonElement)) throw new Error("Отсутствует переданное действие " + action);
	return button;
}

describe("действия внутри общей рамки редактора", () => {
	it("передаёт endAdornment через публичную client-only границу вне содержимого сообщения", async () => {
		vi.stubEnv("SSR", false);
		const action = vi.fn();
		const onChange = vi.fn();
		try {
			render(
				<TextEditorLexical
					initialData={initialData}
					onChange={onChange}
					presentation="compact"
					endAdornment={<button type="button" data-action="external-command" onClick={action} />}
				/>
			);
			const input = await screen.findByRole("textbox");
			await waitFor(() => expect(input.textContent).toBe("Текст документа"));
			onChange.mockClear();
			const command = actionButton("external-command");
			expect(input.contains(command)).toBe(false);

			fireEvent.click(command);

			expect(action).toHaveBeenCalledTimes(1);
			expect(onChange).not.toHaveBeenCalled();
			expect(input.textContent).toBe("Текст документа");
		} finally {
			vi.unstubAllEnvs();
		}
	});

	it.each(["document", "compact"] as const)(
		"%s: смена действий и readOnly сохраняет editable, документ и undo/redo",
		async (presentation) => {
			const onChange = vi.fn();
			const props = { initialData, onChange, presentation } satisfies TextEditorCoreProps;
			const view = render(<TextEditorLexicalClient {...props} />);
			const input = screen.getByRole("textbox");
			const editor = getNearestEditorFromDOMNode(input);
			const before = editor.getEditorState().toJSON();
			await act(async () => {
				editor.update(
					() => {
						const text = $getRoot().getFirstDescendant();
						if (!$isTextNode(text)) throw new Error("Документ потерял текстовый узел.");
						text.select(0, text.getTextContentSize());
					},
					{ discrete: true }
				);
			});
			await act(async () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold"));
			const formatted = editor.getEditorState().toJSON();
			expect(formatted).not.toEqual(before);
			onChange.mockClear();

			view.rerender(<TextEditorLexicalClient {...props} endAdornment={<button type="button" data-action="first-command" />} />);
			expect(screen.getByRole("textbox")).toBe(input);
			expect(getNearestEditorFromDOMNode(input)).toBe(editor);
			expect(editor.getEditorState().toJSON()).toEqual(formatted);

			view.rerender(
				<TextEditorLexicalClient {...props} readOnly endAdornment={<button type="button" data-action="second-command" />} />
			);
			expect(screen.getByRole("textbox")).toBe(input);
			expect(editor.isEditable()).toBe(false);
			expect(editor.getEditorState().toJSON()).toEqual(formatted);

			view.rerender(<TextEditorLexicalClient {...props} endAdornment={null} />);
			expect(screen.getByRole("textbox")).toBe(input);
			expect(getNearestEditorFromDOMNode(input)).toBe(editor);
			expect(editor.isEditable()).toBe(true);
			expect(editor.getEditorState().toJSON()).toEqual(formatted);
			expect(onChange).not.toHaveBeenCalled();

			await act(async () => editor.dispatchCommand(UNDO_COMMAND, undefined));
			expect(editor.getEditorState().toJSON()).toEqual(before);
			await act(async () => editor.dispatchCommand(REDO_COMMAND, undefined));
			expect(editor.getEditorState().toJSON()).toEqual(formatted);
		}
	);

	it("clear очищает документ, сохраняя действия и экземпляр editable", async () => {
		const ref = createRef<TextEditorHandle>();
		const onChange = vi.fn();
		const action = vi.fn();
		render(
			<TextEditorLexicalClient
				ref={ref}
				initialData={initialData}
				onChange={onChange}
				presentation="compact"
				endAdornment={<button type="button" data-action="external-command" onClick={action} />}
			/>
		);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("Текст документа"));
		const command = actionButton("external-command");
		onChange.mockClear();

		await act(async () => ref.current?.clear());

		expect(screen.getByRole("textbox")).toBe(input);
		expect(input.textContent).toBe("");
		expect(actionButton("external-command")).toBe(command);
		expect(onChange).toHaveBeenCalledTimes(1);
		fireEvent.click(command);
		expect(action).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledTimes(1);
	});
});
