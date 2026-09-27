import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { $getRoot, $isTextNode, $setSelection, getNearestEditorFromDOMNode } from "lexical";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { type TextEditorToolbarComponents } from "./editorModel";
import { TextEditorLexicalClient } from "./TextEditorLexicalClient";
import { LinkTypes } from "./toolbar";

const rectDescriptor = Object.getOwnPropertyDescriptor(Range.prototype, "getBoundingClientRect");
beforeAll(() => {
	Object.defineProperty(Range.prototype, "getBoundingClientRect", { configurable: true, value: () => new DOMRect() });
});
afterAll(() => {
	if (rectDescriptor) Object.defineProperty(Range.prototype, "getBoundingClientRect", rectDescriptor);
	else Reflect.deleteProperty(Range.prototype, "getBoundingClientRect");
});

const profile = {
	inline: true,
	links: true,
	linkTypes: [LinkTypes.LINK],
	blocks: true,
	blockStyles: ["unstyled", "ordered-list-item", "unordered-list-item"],
	clearSemanticTag: false
} satisfies TextEditorToolbarComponents;

function formattingTrigger(): HTMLButtonElement {
	const element = document.querySelector('[data-action="toggle-text-editor-formatting"]');
	if (!(element instanceof HTMLButtonElement)) throw new Error("Нет входа в панель форматирования");
	return element;
}

function commandButton(command: string): HTMLButtonElement {
	const element = document.querySelector(`[data-text-editor-command="${command}"]`);
	if (!(element instanceof HTMLButtonElement)) throw new Error("Нет команды " + command);
	return element;
}

async function selectText(input: HTMLElement, start = 3, end = 8) {
	const editor = getNearestEditorFromDOMNode(input);
	await act(async () => {
		editor.update(
			() => {
				const text = $getRoot().getFirstDescendant();
				if (!$isTextNode(text)) throw new Error("Нет текста для выделения");
				text.select(start, end);
			},
			{ discrete: true }
		);
	});
	return editor;
}

describe("компактный редактор", () => {
	it("не создаёт подсказку при null", () => {
		const initialData = { html: "", raw: null };
		const onChange = vi.fn();
		const view = render(<TextEditorLexicalClient initialData={initialData} onChange={onChange} placeholder="Подсказка ввода" />);
		expect(screen.getByText("Подсказка ввода")).toBeDefined();
		view.rerender(<TextEditorLexicalClient initialData={initialData} onChange={onChange} presentation="compact" placeholder={null} />);
		expect(screen.queryByText("Подсказка ввода")).toBeNull();
		expect(screen.getByRole("textbox")).toBeDefined();
		expect(formattingTrigger().getAttribute("aria-expanded")).toBe("false");
		expect(screen.queryByRole("group")).toBeNull();
	});

	it("сохраняет документ и undo-history при смене presentation", async () => {
		const user = userEvent.setup();
		const initialData = { html: "<p>Документ</p>", raw: null };
		const onChange = vi.fn();
		const view = render(<TextEditorLexicalClient initialData={initialData} onChange={onChange} toolbarComponents={profile} />);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("Документ"));
		await selectText(input, 0, 8);
		await user.click(commandButton("BOLD"));
		await waitFor(() => expect(input.querySelector("strong")?.textContent).toBe("Документ"));
		view.rerender(
			<TextEditorLexicalClient initialData={initialData} onChange={onChange} toolbarComponents={profile} presentation="compact" />
		);
		expect(screen.getByRole("textbox")).toBe(input);
		expect(input.querySelector("strong")?.textContent).toBe("Документ");
		await user.click(formattingTrigger());
		await user.click(commandButton("undo"));
		await waitFor(() => expect(input.querySelector("strong")).toBeNull());
		expect(input.textContent).toBe("Документ");
	});

	it.each(["pointer", "touch", "keyboard"])("применяет команду к исходному диапазону после потери selection: %s", async (source) => {
		const user = userEvent.setup();
		render(
			<TextEditorLexicalClient
				initialData={{ html: "<p>До выбор после</p>", raw: null }}
				onChange={vi.fn()}
				presentation="compact"
				placeholder={null}
				toolbarComponents={profile}
			/>
		);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("До выбор после"));
		const editor = await selectText(input);
		if (source === "keyboard") {
			formattingTrigger().focus();
			await user.keyboard("{Enter}");
		} else if (source === "touch") {
			await user.pointer([{ keys: "[TouchA>]", target: formattingTrigger() }, { keys: "[/TouchA]" }]);
		} else await user.click(formattingTrigger());
		expect(screen.getByRole("group")).toBeDefined();
		await act(async () => editor.update(() => $setSelection(null), { discrete: true }));
		await user.click(commandButton("BOLD"));
		await waitFor(() => expect(input.querySelector("strong")?.textContent).toBe("выбор"));
		expect(input.textContent).toBe("До выбор после");
		expect(screen.queryByRole("group")).toBeNull();
		await waitFor(() => expect(document.activeElement).toBe(input));
		await user.click(formattingTrigger());
		await user.click(commandButton("undo"));
		await waitFor(() => expect(input.querySelector("strong")).toBeNull());
		await user.click(formattingTrigger());
		await user.click(commandButton("redo"));
		await waitFor(() => expect(input.querySelector("strong")?.textContent).toBe("выбор"));
	});

	it("отмена панели не меняет содержимое и оставляет фокус на кнопке", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<TextEditorLexicalClient
				initialData={{ html: "<p>До выбор после</p>", raw: null }}
				onChange={onChange}
				presentation="compact"
				toolbarComponents={profile}
			/>
		);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("До выбор после"));
		await selectText(input);
		onChange.mockClear();
		formattingTrigger().focus();
		await user.keyboard(" ");
		await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("group")));
		await user.keyboard("{Escape}");
		await waitFor(() => expect(screen.queryByRole("group")).toBeNull());
		expect(input.textContent).toBe("До выбор после");
		expect(onChange).not.toHaveBeenCalled();
		await waitFor(() => expect(document.activeElement).toBe(formattingTrigger()));
	});

	it.each(["BOLD", "link"])("отменяет отложенное действие %s при размонтировании редактора", async (command) => {
		const user = userEvent.setup();
		const view = render(
			<TextEditorLexicalClient
				initialData={{ html: "<p>До выбор после</p>", raw: null }}
				onChange={vi.fn()}
				presentation="compact"
				toolbarComponents={profile}
			/>
		);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("До выбор после"));
		const editor = await selectText(input);
		await user.click(formattingTrigger());
		await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("group")));
		const callbacks = new Map<number, FrameRequestCallback>();
		let nextFrame = 100;
		const schedule = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
			callbacks.set(++nextFrame, callback);
			return nextFrame;
		});
		const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
			callbacks.delete(id);
		});
		const focus = vi.spyOn(editor, "focus");
		try {
			fireEvent.click(commandButton(command));
			expect(schedule).toHaveBeenCalled();
			const pendingCallbacks = Array.from(callbacks.values());
			view.unmount();
			expect(cancel).toHaveBeenCalled();
			// Уже извлечённый браузером callback тоже безопасен: root старого editor
			// отсоединён, даже если отмена frame пришла после постановки в очередь.
			await act(async () => {
				for (const callback of pendingCallbacks) callback(0);
			});
			expect(focus).not.toHaveBeenCalled();
			expect(screen.queryByRole("dialog")).toBeNull();
		} finally {
			schedule.mockRestore();
			cancel.mockRestore();
			focus.mockRestore();
		}
	});

	it("передаёт исходное выделение в диалог ссылки и сохраняет один undo-шаг", async () => {
		const user = userEvent.setup();
		render(
			<TextEditorLexicalClient
				initialData={{ html: "<p>До выбор после</p>", raw: null }}
				onChange={vi.fn()}
				presentation="compact"
				toolbarComponents={profile}
				externalLinkOptions={{ allowQrCode: false }}
			/>
		);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("До выбор после"));
		const editor = await selectText(input);
		await user.click(formattingTrigger());
		await act(async () => editor.update(() => $setSelection(null), { discrete: true }));
		await user.click(commandButton("link"));
		const dialogElement = await screen.findByRole("dialog");
		await waitFor(() => expect(dialogElement.contains(document.activeElement)).toBe(true));
		const dialog = within(dialogElement);
		const address = dialog.getByRole("textbox", { name: "Полный URL адрес" });
		fireEvent.change(address, { target: { value: "https://example.org/" } });
		fireEvent.change(dialog.getByRole("textbox", { name: "Текст для экранных читалок" }), { target: { value: "Источник" } });
		await user.click(dialog.getByRole("button", { name: "Подтвердить" }));
		await waitFor(() => expect(input.querySelector("a")?.textContent).toBe("выбор"));
		expect(input.textContent).toBe("До выбор после");
		await waitFor(() => expect(document.activeElement).toBe(input));
		await user.click(formattingTrigger());
		await user.click(commandButton("undo"));
		await waitFor(() => expect(input.querySelector("a")).toBeNull());
		expect(input.textContent).toBe("До выбор после");
	});
});
