import { createRef, StrictMode } from "react";

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { $getRoot, $isTextNode, CONTROLLED_TEXT_INSERTION_COMMAND, getNearestEditorFromDOMNode, HISTORY_PUSH_TAG } from "lexical";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { LocalLinkDialogFixture } from "../test/text-editor/LocalLinkDialogFixture";

import { TextEditorLexicalClient } from "./TextEditorLexicalClient";
import { LinkTypes } from "./toolbar";

import { TextEditorLexical, type TextEditorData, type TextEditorHandle, type TextEditorLexicalRaw } from "./index";

const rangeRect = Object.getOwnPropertyDescriptor(Range.prototype, "getBoundingClientRect");
beforeAll(() => {
	// jsdom не рассчитывает геометрию selection; команды и сериализация остаются настоящими Lexical.
	Object.defineProperty(Range.prototype, "getBoundingClientRect", { configurable: true, value: () => new DOMRect() });
});
afterAll(() => {
	if (rangeRect) Object.defineProperty(Range.prototype, "getBoundingClientRect", rangeRect);
	else Reflect.deleteProperty(Range.prototype, "getBoundingClientRect");
});

const initialData = { html: "<p>Первоначальный текст</p>", raw: null };
const toolbarComponents = { inline: true, history: true, clearSemanticTag: false };

function commandButton(command: string): HTMLButtonElement {
	const element = document.querySelector(`[data-text-editor-command="${command}"]`);
	if (!(element instanceof HTMLButtonElement)) throw new Error("Нет команды редактора " + command);
	return element;
}

async function selectAllText(input: HTMLElement) {
	const editor = getNearestEditorFromDOMNode(input);
	await act(async () => {
		editor.update(
			() => {
				const text = $getRoot().getFirstDescendant();
				if (!$isTextNode(text)) throw new Error("В документе нет текста для выделения");
				text.select(0, text.getTextContentSize());
			},
			{ discrete: true }
		);
	});
	return editor;
}

async function insertNewText(input: HTMLElement, text: string) {
	const editor = getNearestEditorFromDOMNode(input);
	await act(async () => {
		// Публичная команда ввода нужна только вместо отсутствующего нативного редактирования jsdom.
		// Отдельный history tag делает результат независимым от таймера объединения вводимых символов.
		editor.update(
			() => {
				$getRoot().selectEnd();
				editor.dispatchCommand(CONTROLLED_TEXT_INSERTION_COMMAND, text);
			},
			{ discrete: true, tag: HISTORY_PUSH_TAG }
		);
	});
}

describe("lifecycle публичного редактора", () => {
	it("передаёт ref через client-only границу публичного компонента", async () => {
		vi.stubEnv("SSR", false);
		const ref = createRef<TextEditorHandle>();
		const onChange = vi.fn();
		try {
			render(<TextEditorLexical ref={ref} initialData={initialData} onChange={onChange} />);
			const input = await screen.findByRole("textbox");
			await waitFor(() => expect(input.textContent).toBe("Первоначальный текст"));
			expect(ref.current).not.toBeNull();
			await act(async () => ref.current?.clear());
			expect(screen.getByRole("textbox")).toBe(input);
			expect(input.textContent).toBe("");
		} finally {
			vi.unstubAllEnvs();
		}
	});

	it("очищает документ и сообщает пустой raw без замены editor и editable", async () => {
		const ref = createRef<TextEditorHandle>();
		const onChange = vi.fn<(data: TextEditorData<TextEditorLexicalRaw>) => void>();
		render(<TextEditorLexicalClient ref={ref} initialData={initialData} onChange={onChange} />);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("Первоначальный текст"));
		const editor = getNearestEditorFromDOMNode(input);
		onChange.mockClear();
		await act(async () => ref.current?.clear());
		expect(screen.getByRole("textbox")).toBe(input);
		expect(getNearestEditorFromDOMNode(input)).toBe(editor);
		expect(input.textContent).toBe("");
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange.mock.lastCall?.[0].raw).toMatchObject({
			format: "lexical",
			version: 1,
			editorState: { root: { children: [{ type: "paragraph", children: [] }] } }
		});
		expect(onChange.mock.lastCall?.[0].html).not.toContain("Первоначальный текст");
	});

	it("отсекает undo и redo старого текста и задаёт пустую базу для нового ввода", async () => {
		const user = userEvent.setup();
		const ref = createRef<TextEditorHandle>();
		render(<TextEditorLexicalClient ref={ref} initialData={initialData} onChange={vi.fn()} toolbarComponents={toolbarComponents} />);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("Первоначальный текст"));
		await selectAllText(input);
		await user.click(commandButton("BOLD"));
		await waitFor(() => expect(input.querySelector("strong")).not.toBeNull());
		await user.click(commandButton("undo"));
		await waitFor(() => expect(input.querySelector("strong")).toBeNull());
		await act(async () => ref.current?.clear());
		await user.click(commandButton("undo"));
		await user.click(commandButton("redo"));
		expect(input.textContent).toBe("");
		await insertNewText(input, "Новый текст");
		expect(input.textContent).toBe("Новый текст");
		await user.click(commandButton("undo"));
		await waitFor(() => expect(input.textContent).toBe(""));
		await user.click(commandButton("redo"));
		await waitFor(() => expect(input.textContent).toBe("Новый текст"));
		expect(input.textContent).not.toContain("Первоначальный");
	});

	it("clear не забирает внешний фокус при сохранённом выделении редактора", async () => {
		const ref = createRef<TextEditorHandle>();
		render(
			<>
				<TextEditorLexicalClient ref={ref} initialData={initialData} onChange={vi.fn()} />
				<button type="button">Внешнее действие</button>
			</>
		);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("Первоначальный текст"));
		await selectAllText(input);
		const outside = screen.getByRole("button", { name: "Внешнее действие" });
		act(() => outside.focus());
		expect(document.activeElement).toBe(outside);
		await act(async () => ref.current?.clear());
		expect(input.textContent).toBe("");
		expect(document.activeElement).toBe(outside);
	});

	it("clear не перемонтирует сфокусированный editable", async () => {
		const ref = createRef<TextEditorHandle>();
		render(<TextEditorLexicalClient ref={ref} initialData={initialData} onChange={vi.fn()} />);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("Первоначальный текст"));
		act(() => input.focus());
		await act(async () => ref.current?.clear());
		expect(document.activeElement).toBe(input);
		expect(screen.getByRole("textbox")).toBe(input);
	});

	it("readOnly блокирует ввод, сохраняя документ, экземпляр и историю после разблокировки", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		const view = render(
			<TextEditorLexicalClient initialData={initialData} onChange={onChange} toolbarComponents={toolbarComponents} />
		);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("Первоначальный текст"));
		const editor = await selectAllText(input);
		await user.click(commandButton("BOLD"));
		await waitFor(() => expect(input.querySelector("strong")).not.toBeNull());
		view.rerender(
			<TextEditorLexicalClient readOnly initialData={initialData} onChange={onChange} toolbarComponents={toolbarComponents} />
		);
		expect(screen.getByRole("textbox")).toBe(input);
		expect(getNearestEditorFromDOMNode(input)).toBe(editor);
		expect(input.getAttribute("contenteditable")).toBe("false");
		expect(editor.isEditable()).toBe(false);
		onChange.mockClear();
		await user.click(input);
		await user.keyboard("Нельзя{Backspace}{Delete}{Enter}");
		fireEvent.paste(input, { clipboardData: { types: ["text/plain"], getData: () => "Вставка запрещена" } });
		fireEvent(
			input,
			new InputEvent("beforeinput", { bubbles: true, cancelable: true, inputType: "insertText", data: "Ввод запрещён" })
		);
		fireEvent.input(input, { inputType: "insertText", data: "Ввод запрещён" });
		expect(input.textContent).toBe("Первоначальный текст");
		expect(onChange).not.toHaveBeenCalled();
		view.rerender(
			<TextEditorLexicalClient readOnly={false} initialData={initialData} onChange={onChange} toolbarComponents={toolbarComponents} />
		);
		expect(input.getAttribute("contenteditable")).toBe("true");
		await user.click(commandButton("undo"));
		await waitFor(() => expect(input.querySelector("strong")).toBeNull());
		expect(input.textContent).toBe("Первоначальный текст");
	});

	it("clear доступен при readOnly и не меняет режим редактирования", async () => {
		const ref = createRef<TextEditorHandle>();
		const onChange = vi.fn();
		render(<TextEditorLexicalClient ref={ref} readOnly initialData={initialData} onChange={onChange} />);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("Первоначальный текст"));
		expect(input.getAttribute("contenteditable")).toBe("false");
		expect(getNearestEditorFromDOMNode(input).isEditable()).toBe(false);
		onChange.mockClear();
		await act(async () => ref.current?.clear());
		expect(input.textContent).toBe("");
		expect(input.getAttribute("contenteditable")).toBe("false");
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	it("замена ref отключает прежнюю handle, сохраняя текущий документ", async () => {
		const firstRef = createRef<TextEditorHandle>();
		const nextRef = createRef<TextEditorHandle>();
		const onChange = vi.fn();
		const view = render(<TextEditorLexicalClient ref={firstRef} initialData={initialData} onChange={onChange} />);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("Первоначальный текст"));
		const staleHandle = firstRef.current;
		expect(staleHandle).not.toBeNull();
		view.rerender(<TextEditorLexicalClient ref={nextRef} initialData={initialData} onChange={onChange} />);
		expect(firstRef.current).toBeNull();
		expect(nextRef.current).not.toBeNull();
		onChange.mockClear();
		await act(async () => staleHandle?.clear());
		expect(input.textContent).toBe("Первоначальный текст");
		expect(onChange).not.toHaveBeenCalled();
		await act(async () => nextRef.current?.clear());
		expect(screen.getByRole("textbox")).toBe(input);
		expect(input.textContent).toBe("");
	});

	it("handle размонтированного editor не изменяет следующий экземпляр", async () => {
		const ref = createRef<TextEditorHandle>();
		const onChange = vi.fn();
		const view = render(<TextEditorLexicalClient ref={ref} initialData={initialData} onChange={onChange} />);
		await waitFor(() => expect(screen.getByRole("textbox").textContent).toBe("Первоначальный текст"));
		const staleHandle = ref.current;
		expect(staleHandle).not.toBeNull();
		view.unmount();
		expect(ref.current).toBeNull();
		onChange.mockClear();
		render(<TextEditorLexicalClient initialData={{ html: "<p>Другой документ</p>", raw: null }} onChange={vi.fn()} />);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("Другой документ"));
		await act(async () => staleHandle?.clear());
		expect(input.textContent).toBe("Другой документ");
		expect(onChange).not.toHaveBeenCalled();
	});

	it("StrictMode публикует рабочую handle после повторной установки lifecycle", async () => {
		const ref = createRef<TextEditorHandle>();
		const onChange = vi.fn();
		render(
			<StrictMode>
				<TextEditorLexicalClient ref={ref} initialData={initialData} onChange={onChange} />
			</StrictMode>
		);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("Первоначальный текст"));
		expect(ref.current).not.toBeNull();
		onChange.mockClear();
		await act(async () => ref.current?.clear());
		expect(input.textContent).toBe("");
		expect(onChange).toHaveBeenCalledTimes(1);
		await insertNewText(input, "После очистки");
		expect(input.textContent).toBe("После очистки");
	});

	it("StrictMode отзывает handle первой установки после повторного подключения", async () => {
		const publish = vi.fn<(handle: TextEditorHandle | null) => void>();
		const onChange = vi.fn();
		render(
			<StrictMode>
				<TextEditorLexicalClient ref={publish} initialData={initialData} onChange={onChange} />
			</StrictMode>
		);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("Первоначальный текст"));
		const handles = publish.mock.calls.map(([handle]) => handle).filter((handle) => handle !== null);
		const first = handles[0];
		const current = handles.at(-1);
		if (!first || !current) throw new Error("StrictMode не опубликовал handle");
		expect(first).not.toBe(current);
		onChange.mockClear();
		await act(async () => first.clear());
		expect(input.textContent).toBe("Первоначальный текст");
		expect(onChange).not.toHaveBeenCalled();
		await act(async () => current.clear());
		expect(input.textContent).toBe("");
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	it("немедленный clear из ref не проигрывает отложенной HTML-инициализации", async () => {
		const user = userEvent.setup();
		const publish = vi.fn((handle: TextEditorHandle | null) => handle?.clear());
		const onChange = vi.fn();
		render(<TextEditorLexicalClient ref={publish} initialData={initialData} onChange={onChange} />);
		expect(publish).toHaveBeenCalled();
		const input = screen.getByRole("textbox");
		await act(async () => undefined);
		expect(input.textContent).toBe("");
		expect(input.querySelector("p")).not.toBeNull();
		expect(onChange).toHaveBeenCalledTimes(1);
		await insertNewText(input, "После ранней очистки");
		expect(input.textContent).toBe("После ранней очистки");
		await user.click(commandButton("undo"));
		await waitFor(() => expect(input.textContent).toBe(""));
	});

	it("initialData остаётся initializer при смене props и после clear", async () => {
		const ref = createRef<TextEditorHandle>();
		const onChange = vi.fn();
		const view = render(<TextEditorLexicalClient ref={ref} initialData={initialData} onChange={onChange} />);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("Первоначальный текст"));
		const editor = getNearestEditorFromDOMNode(input);
		view.rerender(
			<TextEditorLexicalClient ref={ref} initialData={{ html: "<p>Новый initializer</p>", raw: null }} onChange={onChange} />
		);
		expect(input.textContent).toBe("Первоначальный текст");
		await act(async () => ref.current?.clear());
		view.rerender(<TextEditorLexicalClient ref={ref} initialData={initialData} onChange={onChange} />);
		await act(async () => undefined);
		expect(input.textContent).toBe("");
		expect(getNearestEditorFromDOMNode(screen.getByRole("textbox"))).toBe(editor);
	});

	it.each(["clear", "readOnly"])("не применяет позднее подтверждение адаптера после %s", async (boundary) => {
		const ref = createRef<TextEditorHandle>();
		const onChange = vi.fn();
		const adapter = vi.fn(LocalLinkDialogFixture);
		const props = {
			initialData,
			onChange,
			toolbarComponents: { links: true, linkTypes: [LinkTypes.LOCAL_LINK] },
			businessAdapters: { LocalLinkDialogComponent: adapter }
		};
		const view = render(<TextEditorLexicalClient ref={ref} {...props} />);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("Первоначальный текст"));
		await selectAllText(input);
		fireEvent.click(commandButton(LinkTypes.LOCAL_LINK));
		expect(screen.getByRole("dialog", { name: "Каталог ссылок" })).toBeDefined();
		const pending = adapter.mock.lastCall?.[0];
		if (!pending?.isOpen) throw new Error("Нет открытого адаптера");
		if (boundary === "clear") await act(async () => ref.current?.clear());
		else view.rerender(<TextEditorLexicalClient ref={ref} {...props} readOnly />);
		expect(screen.queryByRole("dialog")).toBeNull();
		onChange.mockClear();
		await act(async () => {
			pending.onConfirm("/articles/late", "Поздний ответ");
			pending.onClose();
		});
		expect(input.querySelector("a")).toBeNull();
		expect(input.textContent).toBe(boundary === "clear" ? "" : "Первоначальный текст");
		expect(onChange).not.toHaveBeenCalled();
	});

	it.each(["clear", "readOnly"])("отзывает отложенную команду компактной панели после %s", async (boundary) => {
		const user = userEvent.setup();
		const ref = createRef<TextEditorHandle>();
		const onChange = vi.fn();
		const props = { initialData, onChange, toolbarComponents: { links: true, linkTypes: [LinkTypes.LINK] } };
		const view = render(<TextEditorLexicalClient {...props} ref={ref} presentation="compact" />);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("Первоначальный текст"));
		await selectAllText(input);
		const trigger = document.querySelector('[data-action="toggle-text-editor-formatting"]');
		if (!(trigger instanceof HTMLButtonElement)) throw new Error("Нет компактной панели");
		await user.click(trigger);
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
		try {
			fireEvent.click(commandButton(LinkTypes.LINK));
			expect(schedule).toHaveBeenCalled();
			// Уже взятый браузером callback тоже обязан уважать новую границу документа.
			const pending = Array.from(callbacks.values());
			if (boundary === "clear") await act(async () => ref.current?.clear());
			else view.rerender(<TextEditorLexicalClient {...props} ref={ref} presentation="compact" readOnly />);
			onChange.mockClear();
			await act(async () => {
				for (const callback of pending) callback(0);
			});
			expect(screen.queryByRole("group")).toBeNull();
			expect(screen.queryByRole("dialog")).toBeNull();
			expect(input.querySelector("strong")).toBeNull();
			expect(input.textContent).toBe(boundary === "clear" ? "" : "Первоначальный текст");
			expect(onChange).not.toHaveBeenCalled();
		} finally {
			schedule.mockRestore();
			cancel.mockRestore();
		}
	});

	it("отмена диалога возвращает фокус без изменения документа", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<TextEditorLexicalClient
				initialData={initialData}
				onChange={onChange}
				toolbarComponents={{ inline: true, links: true, linkTypes: [LinkTypes.LINK] }}
			/>
		);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("Первоначальный текст"));
		await selectAllText(input);
		await user.click(commandButton(LinkTypes.LINK));
		const dialog = await screen.findByRole("dialog");
		await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
		onChange.mockClear();
		await user.keyboard("{Escape}");
		await waitFor(() => expect(document.activeElement).toBe(input));
		expect(input.textContent).toBe("Первоначальный текст");
		expect(onChange).not.toHaveBeenCalled();
		await user.click(commandButton("BOLD"));
		await waitFor(() => expect(input.querySelector("strong")?.textContent).toBe("Первоначальный текст"));
	});
});
