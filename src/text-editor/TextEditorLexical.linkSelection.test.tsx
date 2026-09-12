// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { $getRoot, $getSelection, $isTextNode, $setSelection, getNearestEditorFromDOMNode } from "lexical";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { LocalLinkDialogFixture } from "../test/text-editor/LocalLinkDialogFixture";

import { TextEditorLexicalClient } from "./TextEditorLexicalClient";

const rangeRectDescriptor = Object.getOwnPropertyDescriptor(Range.prototype, "getBoundingClientRect");
beforeAll(() => {
	// jsdom не рассчитывает геометрию Range, нужную Lexical при undo/focus.
	Object.defineProperty(Range.prototype, "getBoundingClientRect", { configurable: true, value: () => new DOMRect() });
});
afterAll(() => {
	if (rangeRectDescriptor) Object.defineProperty(Range.prototype, "getBoundingClientRect", rangeRectDescriptor);
	else Reflect.deleteProperty(Range.prototype, "getBoundingClientRect");
});

describe("вставка ссылки через внешний диалог", () => {
	it.each(["", "<p>До ссылки:</p>"])("вставляет без предварительного курсора: %s", async (html) => {
		const user = userEvent.setup();
		render(
			<TextEditorLexicalClient
				initialData={{ html, raw: null }}
				onChange={vi.fn()}
				toolbarComponents={{ links: true, history: true }}
				businessAdapters={{ LocalLinkDialogComponent: LocalLinkDialogFixture }}
			/>
		);
		const input = screen.getByRole("textbox");
		const editor = getNearestEditorFromDOMNode(input);
		if (!editor) throw new Error("Редактор не подключён");
		await waitFor(() => expect(input.textContent).toBe(html ? "До ссылки:" : ""));
		editor.getEditorState().read(() => expect($getSelection()).toBeNull());
		await user.click(screen.getByRole("button", { name: "Добавить ссылку на статью" }));
		await user.type(screen.getByRole("textbox", { name: "Поиск ссылки" }), "тест");
		await user.click(screen.getByRole("button", { name: "Выбрать ссылку" }));
		await waitFor(() => expect(input.querySelector("a")?.getAttribute("href")).toBe("/articles/test"));
		expect(input.textContent).toBe((html ? "До ссылки:" : "") + "Ссылка");
		await waitFor(() => expect(document.activeElement).toBe(input));
		await user.click(screen.getByRole("button", { name: "Отменить последнее действие" }));
		await waitFor(() => expect(input.textContent).toBe(html ? "До ссылки:" : ""));
		await user.click(screen.getByRole("button", { name: "Повторить предыдущее действие" }));
		await waitFor(() => expect(input.textContent).toContain("Ссылка"));
	});

	it.each([
		[3, 3, "До Ссылкавыбор после"],
		[3, 8, "До Ссылка после"],
		[8, 3, "До Ссылка после"]
	] as const)("восстанавливает курсор/диапазон %i..%i после потери selection", async (start, end, expected) => {
		const user = userEvent.setup();
		render(
			<TextEditorLexicalClient
				initialData={{ html: "<p>До выбор после</p>", raw: null }}
				onChange={vi.fn()}
				toolbarComponents={{ links: true }}
				businessAdapters={{ LocalLinkDialogComponent: LocalLinkDialogFixture }}
			/>
		);
		const input = screen.getByRole("textbox");
		const editor = getNearestEditorFromDOMNode(input);
		if (!editor) throw new Error("Редактор не подключён");
		await waitFor(() => expect(input.textContent).toBe("До выбор после"));
		await act(async () =>
			editor.update(
				() => {
					const text = $getRoot().getFirstDescendant();
					if (!$isTextNode(text)) throw new Error("Нет текста для выделения");
					text.select(start, end);
				},
				{ discrete: true }
			)
		);
		await user.click(screen.getByRole("button", { name: "Добавить ссылку на статью" }));
		// Диалог/другой редактор может очистить live selection; вставка относится к исходному месту.
		await act(async () => editor.update(() => $setSelection(null), { discrete: true }));
		await user.click(screen.getByRole("button", { name: "Выбрать ссылку" }));
		await waitFor(() => expect(input.textContent).toBe(expected));
	});

	it.each(["{Enter}", " "])("открывает каталог клавишей %s и не меняет документ при отмене", async (key) => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<TextEditorLexicalClient
				initialData={{ html: "<p>Исходный текст</p>", raw: null }}
				onChange={onChange}
				toolbarComponents={{ links: true }}
				businessAdapters={{ LocalLinkDialogComponent: LocalLinkDialogFixture }}
			/>
		);
		await waitFor(() => expect(screen.getByRole("textbox").textContent).toBe("Исходный текст"));
		onChange.mockClear();
		screen.getByRole("button", { name: "Добавить ссылку на статью" }).focus();
		await user.keyboard(key);
		expect(screen.getByRole("dialog")).toBeDefined();
		await user.click(screen.getByRole("button", { name: "Отмена" }));
		expect(screen.queryByRole("dialog")).toBeNull();
		expect(onChange).not.toHaveBeenCalled();
		expect(screen.getByRole("textbox").textContent).toBe("Исходный текст");
		// После отмены следующая сессия не использует устаревший snapshot.
		fireEvent.click(screen.getByRole("button", { name: "Добавить ссылку на статью" }));
		await user.click(screen.getByRole("button", { name: "Выбрать ссылку" }));
		await waitFor(() => expect(screen.getByRole("textbox").textContent).toBe("Исходный текстСсылка"));
	});
});
