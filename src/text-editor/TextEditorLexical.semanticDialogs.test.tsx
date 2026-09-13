// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { $getRoot, $isTextNode, $setSelection, getNearestEditorFromDOMNode } from "lexical";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { type TextEditorData, type TextEditorLexicalRaw } from "./editorModel";
import { TextEditorLexicalClient } from "./TextEditorLexicalClient";

const rangeRect = Object.getOwnPropertyDescriptor(Range.prototype, "getBoundingClientRect");
beforeAll(() => Object.defineProperty(Range.prototype, "getBoundingClientRect", { configurable: true, value: () => new DOMRect() }));
afterAll(() => {
	if (rangeRect) Object.defineProperty(Range.prototype, "getBoundingClientRect", rangeRect);
	else Reflect.deleteProperty(Range.prototype, "getBoundingClientRect");
});

/** Реальный Lexical и Modal: snapshot, история и повторное открытие без mock действий. */
describe("сессия семантического диалога", () => {
	it.each([
		["Аббревиатуру", "Аббревиатура", "КТК", "Расшифровка", "Колледж", "abbr", "title"],
		["Код языка", "Текст на другом языке", "Hello", "Код языка", "en", "span[lang]", "lang"],
		["Ссылку на источник", "Цитата источника", "Книга", "Название источника", "Источник", "cite", "title"],
		["Удалённый фрагмент", "Изменения в тексте", "Прежнее", "Когда был удалён", "2026-09-13", "del", "datetime"],
		["Добавленный фрагмент", "Изменения в тексте", "Новое", "Когда был добавлен", "2026-09-13", "ins", "datetime"],
		["Дату/время", "Значение", "2026-09-13", "Значение", "2026-09-13", "time", "datetime"]
	])("%s: без курсора, undo/redo, Raw и атрибуты", async (button, field, text, attribute, value, selector, attr) => {
		const changed = vi.fn<(data: TextEditorData<TextEditorLexicalRaw>) => void>();
		const view = render(
			<TextEditorLexicalClient
				initialData={{ html: "", raw: null }}
				onChange={changed}
				toolbarComponents={{ tags: true, history: true }}
			/>
		);
		const input = screen.getByRole("textbox");
		const editor = getNearestEditorFromDOMNode(input);
		fireEvent.click(screen.getByRole("button", { name: `Вставить ${button}` }));
		const dialog = within(screen.getByRole("dialog"));
		fireEvent.change(dialog.getByRole("textbox", { name: field }), { target: { value: text } });
		fireEvent.change(dialog.getByRole("textbox", { name: attribute }), { target: { value } });
		await act(async () => editor.update(() => $setSelection(null), { discrete: true }));
		fireEvent.click(dialog.getByRole("button", { name: "Подтвердить" }));
		await waitFor(() => expect(input.querySelector(selector)?.getAttribute(attr)).toBe(value));
		const saved = changed.mock.lastCall?.[0];
		if (!saved) throw new Error("Нет экспортированного документа");
		fireEvent.click(screen.getByRole("button", { name: "Отменить последнее действие" }));
		await waitFor(() => expect(input.textContent).toBe(""));
		fireEvent.click(screen.getByRole("button", { name: "Повторить предыдущее действие" }));
		await waitFor(() => expect(input.textContent).toBe(text));
		view.unmount();
		render(<TextEditorLexicalClient initialData={saved} onChange={changed} toolbarComponents={{ tags: true }} />);
		const reopened = screen.getByRole("textbox");
		const reopenedEditor = getNearestEditorFromDOMNode(reopened);
		await act(async () =>
			reopenedEditor.update(
				() => {
					const node = $getRoot().getFirstDescendant();
					if (!$isTextNode(node)) throw new Error("Нет текста");
					node.select(0, node.getTextContentSize());
				},
				{ discrete: true }
			)
		);
		fireEvent.click(screen.getByRole("button", { name: `Вставить ${button}` }));
		expect(within(screen.getByRole("dialog")).getByRole("textbox", { name: attribute })).toHaveProperty("value", value);
		fireEvent.click(screen.getByRole("button", { name: "Отмена" }));
		expect(reopened.querySelectorAll(selector)).toHaveLength(1);
		fireEvent.click(screen.getByRole("button", { name: `Вставить ${button}` }));
		fireEvent.click(screen.getByRole("button", { name: "Подтвердить" }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(reopened.querySelectorAll(selector)).toHaveLength(1);
		expect(reopened.textContent).toBe(text);
	});

	it("редактирует атрибуты abbr без потери жирного текста и вложенного тега", async () => {
		render(
			<TextEditorLexicalClient
				initialData={{ html: '<p><abbr title="Прежде"><strong>КТК</strong></abbr></p>', raw: null }}
				onChange={vi.fn()}
				toolbarComponents={{ tags: true }}
			/>
		);
		const input = screen.getByRole("textbox");
		const editor = getNearestEditorFromDOMNode(input);
		await act(async () =>
			editor.update(
				() => {
					const node = $getRoot().getFirstDescendant();
					if (!$isTextNode(node)) throw new Error("Нет текста");
					node.select(1, 1);
				},
				{ discrete: true }
			)
		);
		fireEvent.click(screen.getByRole("button", { name: "Вставить Аббревиатуру" }));
		fireEvent.change(screen.getByRole("textbox", { name: "Расшифровка" }), { target: { value: "Колледж" } });
		fireEvent.click(screen.getByRole("button", { name: "Подтвердить" }));
		await waitFor(() => expect(input.querySelector("abbr")?.title).toBe("Колледж"));
		expect(input.querySelectorAll("abbr")).toHaveLength(1);
		expect(input.querySelector("strong")?.textContent).toBe("КТК");
	});

	it.each([
		["email", "Email адрес", "mailto:test@example.org", "test@example.org"],
		["ссылку", "Полный URL адрес", "https://example.org/", "https://example.org/"]
	])("восстанавливает %s после ухода selection и сохраняет оформление", async (button, field, href, value) => {
		render(
			<TextEditorLexicalClient
				initialData={{
					html: `<p><a href="${href}" aria-label="Связаться" data-qr-code="true"><strong>Контакт</strong></a></p>`,
					raw: null
				}}
				onChange={vi.fn()}
				toolbarComponents={{ links: true }}
			/>
		);
		const input = screen.getByRole("textbox");
		const editor = getNearestEditorFromDOMNode(input);
		await act(async () =>
			editor.update(
				() => {
					const node = $getRoot().getFirstDescendant();
					if (!$isTextNode(node)) throw new Error("Нет текста");
					node.select(0, node.getTextContentSize());
				},
				{ discrete: true }
			)
		);
		fireEvent.click(screen.getByRole("button", { name: `Добавить ${button}` }));
		await act(async () => editor.update(() => $setSelection(null), { discrete: true }));
		expect(screen.getByRole("textbox", { name: field })).toHaveProperty("value", value);
		expect(screen.getByRole("textbox", { name: "Текст для экранных читалок" })).toHaveProperty("value", "Связаться");
		fireEvent.click(screen.getByRole("button", { name: "Подтвердить" }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(input.querySelectorAll("a")).toHaveLength(1);
		expect(input.querySelector("a")?.getAttribute("href")).toBe(href);
		expect(input.querySelector("strong")?.textContent).toBe("Контакт");
		if (button === "ссылку") expect(input.querySelector("a")?.getAttribute("data-qr-code")).toBe("true");
	});
});
