import { createRef } from "react";

import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	$getRoot,
	$isTextNode,
	$setSelection,
	CONTROLLED_TEXT_INSERTION_COMMAND,
	getNearestEditorFromDOMNode,
	HISTORY_PUSH_TAG
} from "lexical";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { type TextEditorHandle, type TextEditorToolbarComponents } from "./editorModel";
import { TextEditorLexicalClient } from "./TextEditorLexicalClient";
import { LinkTypes } from "./toolbar";

const rectDescriptor = Object.getOwnPropertyDescriptor(Range.prototype, "getBoundingClientRect");
beforeAll(() => {
	// Подменяется только отсутствующая в jsdom геометрия; editor, команды и выделение настоящие.
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

function renderCompact() {
	return render(
		<TextEditorLexicalClient
			initialData={{ html: "<p>До выбор после</p>", raw: null }}
			onChange={vi.fn()}
			presentation="compact"
			placeholder={null}
			toolbarComponents={profile}
		/>
	);
}

describe("компактный редактор", () => {
	it("не создаёт подсказку при null и скрывает инструменты до явного открытия", () => {
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

	it("раскрывает инструменты в редакторе без переноса фокуса и изменения документа", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		const view = render(
			<TextEditorLexicalClient
				initialData={{ html: "<p>До выбор после</p>", raw: null }}
				onChange={onChange}
				presentation="compact"
				toolbarComponents={profile}
			/>
		);
		const input = screen.getByRole("textbox");
		const editor = await selectText(input);
		act(() => input.focus());
		const before = editor.getEditorState().toJSON();
		onChange.mockClear();

		await user.click(formattingTrigger());

		const panel = screen.getByRole("group");
		expect(view.container.contains(panel)).toBe(true);
		expect(panel.id).not.toBe("");
		expect(formattingTrigger().getAttribute("aria-controls")).toBe(panel.id);
		expect(formattingTrigger().getAttribute("aria-expanded")).toBe("true");
		expect(document.activeElement).toBe(input);
		expect(screen.getByRole("textbox")).toBe(input);
		expect(editor.getEditorState().toJSON()).toEqual(before);
		expect(onChange).not.toHaveBeenCalled();
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

	it.each(["pointer", "touch", "keyboard"])("сохраняет диапазон при переходе к инструменту: %s", async (source) => {
		const user = userEvent.setup();
		renderCompact();
		const input = screen.getByRole("textbox");
		const editor = await selectText(input);

		if (source === "keyboard") {
			act(() => formattingTrigger().focus());
			await user.keyboard("{Enter}");
		} else if (source === "touch") {
			await user.pointer([{ keys: "[TouchA>]", target: formattingTrigger() }, { keys: "[/TouchA]" }]);
		} else await user.click(formattingTrigger());

		const panel = screen.getByRole("group");
		await act(async () => editor.update(() => $setSelection(null), { discrete: true }));
		if (source === "keyboard") {
			act(() => commandButton("BOLD").focus());
			await user.keyboard(" ");
		} else if (source === "touch") {
			await user.pointer([{ keys: "[TouchB>]", target: commandButton("BOLD") }, { keys: "[/TouchB]" }]);
		} else await user.click(commandButton("BOLD"));

		await waitFor(() => expect(input.querySelector("strong")?.textContent).toBe("выбор"));
		expect(input.textContent).toBe("До выбор после");
		expect(screen.getByRole("group")).toBe(panel);
		expect(formattingTrigger().getAttribute("aria-expanded")).toBe("true");
		expect(document.activeElement).toBe(input);
	});

	it("применяет несколько команд к одному диапазону без повторного открытия", async () => {
		const user = userEvent.setup();
		renderCompact();
		const input = screen.getByRole("textbox");
		const editor = await selectText(input);
		await user.click(formattingTrigger());
		const panel = screen.getByRole("group");

		await user.click(commandButton("BOLD"));
		await user.click(commandButton("ITALIC"));

		await waitFor(() =>
			expect(
				editor.getEditorState().read(() =>
					$getRoot()
						.getAllTextNodes()
						.filter((node) => node.hasFormat("bold") && node.hasFormat("italic"))
						.map((node) => node.getTextContent())
						.join("")
				)
			).toBe("выбор")
		);
		expect(screen.getByRole("group")).toBe(panel);
		expect(commandButton("BOLD").getAttribute("aria-pressed")).toBe("true");
		expect(commandButton("ITALIC").getAttribute("aria-pressed")).toBe("true");
		expect(document.activeElement).toBe(input);
	});

	it("использует новый диапазон после открытия панели и его последнее значение при потере selection", async () => {
		const user = userEvent.setup();
		renderCompact();
		const input = screen.getByRole("textbox");
		const editor = await selectText(input);
		await user.click(formattingTrigger());
		await selectText(input, 9, 14);
		await act(async () => editor.update(() => $setSelection(null), { discrete: true }));

		await user.click(commandButton("BOLD"));

		await waitFor(() => expect(input.querySelector("strong")?.textContent).toBe("после"));
		expect(input.textContent).toBe("До выбор после");
	});

	it("обновляет цель форматирования после ввода при раскрытой панели", async () => {
		const user = userEvent.setup();
		renderCompact();
		const input = screen.getByRole("textbox");
		const editor = await selectText(input);
		await user.click(formattingTrigger());
		await act(async () => {
			editor.update(
				() => {
					$getRoot().selectEnd();
					editor.dispatchCommand(CONTROLLED_TEXT_INSERTION_COMMAND, " новое");
				},
				{ discrete: true, tag: HISTORY_PUSH_TAG }
			);
		});
		await selectText(input, 15, 20);
		await user.click(commandButton("ITALIC"));

		await waitFor(() => expect(input.querySelector("em")?.textContent).toBe("новое"));
		expect(input.textContent).toBe("До выбор после новое");
		expect(screen.getByRole("group")).toBeDefined();
	});

	it.each(["ordered-list-item", "unordered-list-item"])(
		"снимает %s после потери выделения без устаревшего состояния панели",
		async (command) => {
			const user = userEvent.setup();
			renderCompact();
			const input = screen.getByRole("textbox");
			const editor = await selectText(input);
			await user.click(formattingTrigger());
			await user.click(commandButton(command));
			await waitFor(() => expect(input.querySelector("ol, ul")).not.toBeNull());
			await act(async () => editor.update(() => $setSelection(null), { discrete: true }));

			await user.click(commandButton(command));

			await waitFor(() => expect(input.querySelector("ol, ul")).toBeNull());
			expect(input.textContent).toBe("До выбор после");
			expect(screen.getByRole("group")).toBeDefined();
		}
	);

	it("сохраняет undo и redo форматирования без повторного открытия панели", async () => {
		const user = userEvent.setup();
		renderCompact();
		const input = screen.getByRole("textbox");
		await selectText(input);
		await user.click(formattingTrigger());
		const panel = screen.getByRole("group");
		await user.click(commandButton("BOLD"));
		await user.click(commandButton("undo"));
		await waitFor(() => expect(input.querySelector("strong")).toBeNull());
		await user.click(commandButton("redo"));
		await waitFor(() => expect(input.querySelector("strong")?.textContent).toBe("выбор"));
		expect(screen.getByRole("group")).toBe(panel);
		expect(input.textContent).toBe("До выбор после");
	});

	it("закрывает панель по Escape и возвращает фокус с удаляемой команды на кнопку раскрытия", async () => {
		const user = userEvent.setup();
		renderCompact();
		const input = screen.getByRole("textbox");
		const editor = await selectText(input);
		const before = editor.getEditorState().toJSON();
		act(() => formattingTrigger().focus());
		await user.keyboard(" ");
		expect(document.activeElement).toBe(formattingTrigger());
		act(() => commandButton("BOLD").focus());

		await user.keyboard("{Escape}");

		expect(screen.queryByRole("group")).toBeNull();
		expect(formattingTrigger().getAttribute("aria-expanded")).toBe("false");
		expect(document.activeElement).toBe(formattingTrigger());
		expect(editor.getEditorState().toJSON()).toEqual(before);
	});

	it("закрытие кнопкой не уводит фокус с редактора и не меняет содержимое", async () => {
		const user = userEvent.setup();
		renderCompact();
		const input = screen.getByRole("textbox");
		const editor = await selectText(input);
		await user.click(formattingTrigger());
		act(() => input.focus());
		const before = editor.getEditorState().toJSON();

		await user.click(formattingTrigger());

		expect(screen.queryByRole("group")).toBeNull();
		expect(document.activeElement).toBe(input);
		expect(editor.getEditorState().toJSON()).toEqual(before);
	});

	it("возвращает фокус в событии команды и не оставляет отложенное действие после unmount", async () => {
		const user = userEvent.setup();
		const view = renderCompact();
		const input = screen.getByRole("textbox");
		await selectText(input);
		await user.click(formattingTrigger());
		act(() => commandButton("BOLD").focus());
		const callbacks = new Map<number, FrameRequestCallback>();
		let nextFrame = 100;
		const schedule = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
			callbacks.set(++nextFrame, callback);
			return nextFrame;
		});
		const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => callbacks.delete(id));
		const focus = vi.spyOn(HTMLElement.prototype, "focus");
		try {
			fireEvent.click(commandButton("BOLD"));
			// Восстановление клавиатуры iOS нельзя откладывать до будущего кадра.
			expect(document.activeElement).toBe(input);
			await waitFor(() => expect(input.querySelector("strong")?.textContent).toBe("выбор"));
			const pendingCallbacks = Array.from(callbacks.values());
			view.unmount();
			focus.mockClear();
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

	it("clear отзывает раскрытую панель и не возвращает старый текст через undo", async () => {
		const user = userEvent.setup();
		const ref = createRef<TextEditorHandle>();
		render(
			<TextEditorLexicalClient
				ref={ref}
				initialData={{ html: "<p>До выбор после</p>", raw: null }}
				onChange={vi.fn()}
				presentation="compact"
				toolbarComponents={profile}
			/>
		);
		const input = screen.getByRole("textbox");
		await selectText(input);
		await user.click(formattingTrigger());
		await user.click(commandButton("BOLD"));
		await act(async () => ref.current?.clear());

		expect(screen.getByRole("textbox")).toBe(input);
		expect(input.textContent).toBe("");
		expect(screen.queryByRole("group")).toBeNull();
		expect(formattingTrigger().getAttribute("aria-expanded")).toBe("false");
		await user.click(formattingTrigger());
		await user.click(commandButton("undo"));
		await user.click(commandButton("redo"));
		expect(input.textContent).toBe("");
	});

	it("readOnly отзывает панель и блокирует её открытие, сохраняя документ", async () => {
		const user = userEvent.setup();
		const initialData = { html: "<p>До выбор после</p>", raw: null };
		const onChange = vi.fn();
		const view = render(
			<TextEditorLexicalClient initialData={initialData} onChange={onChange} presentation="compact" toolbarComponents={profile} />
		);
		const input = screen.getByRole("textbox");
		const editor = await selectText(input);
		await user.click(formattingTrigger());
		const before = editor.getEditorState().toJSON();

		view.rerender(
			<TextEditorLexicalClient
				readOnly
				initialData={initialData}
				onChange={onChange}
				presentation="compact"
				toolbarComponents={profile}
			/>
		);

		expect(screen.getByRole("textbox")).toBe(input);
		expect(screen.queryByRole("group")).toBeNull();
		expect(formattingTrigger().disabled).toBe(true);
		await user.click(formattingTrigger());
		expect(screen.queryByRole("group")).toBeNull();
		expect(editor.getEditorState().toJSON()).toEqual(before);
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
		await user.click(commandButton("undo"));
		await waitFor(() => expect(input.querySelector("a")).toBeNull());
		expect(input.textContent).toBe("До выбор после");
	});

	it("отмена диалога ссылки сохраняет диапазон для следующего форматирования", async () => {
		const user = userEvent.setup();
		renderCompact();
		const input = screen.getByRole("textbox");
		await selectText(input);
		await user.click(formattingTrigger());
		await user.click(commandButton("link"));
		const dialog = within(await screen.findByRole("dialog"));
		await user.click(dialog.getByRole("button", { name: "Отмена" }));
		await waitFor(() => expect(document.activeElement).toBe(input));
		await user.click(commandButton("BOLD"));

		await waitFor(() => expect(input.querySelector("strong")?.textContent).toBe("выбор"));
		expect(input.querySelector("a")).toBeNull();
		expect(screen.getByRole("group")).toBeDefined();
	});
});
