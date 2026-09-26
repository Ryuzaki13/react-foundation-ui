// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { $getRoot, $isTextNode, getNearestEditorFromDOMNode } from "lexical";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { type TextEditorData, type TextEditorLexicalRaw, type TextEditorToolbarComponents } from "./editorModel";
import { TextEditorLexicalClient } from "./TextEditorLexicalClient";
import { LinkTypes } from "./toolbar";

const rangeRect = Object.getOwnPropertyDescriptor(Range.prototype, "getBoundingClientRect");
beforeAll(() => {
	// Lexical обновляет геометрию selection, которую jsdom сам не рассчитывает.
	Object.defineProperty(Range.prototype, "getBoundingClientRect", { configurable: true, value: () => new DOMRect() });
});
afterAll(() => {
	if (rangeRect) Object.defineProperty(Range.prototype, "getBoundingClientRect", rangeRect);
	else Reflect.deleteProperty(Range.prototype, "getBoundingClientRect");
});

const toolbarComponents: TextEditorToolbarComponents = {
	blocks: true,
	blockStyles: ["unstyled", "ordered-list-item", "unordered-list-item"],
	inline: true,
	links: true,
	linkTypes: [LinkTypes.LINK],
	clearSemanticTag: false
};

async function selectEditorText(input: HTMLElement) {
	const editor = getNearestEditorFromDOMNode(input);
	await act(async () =>
		editor.update(
			() => {
				const text = $getRoot().getFirstDescendant();
				if (!$isTextNode(text)) throw new Error("В документе нет текста для выделения");
				text.select(0, text.getTextContentSize());
			},
			{ discrete: true }
		)
	);
}

describe("профиль реального TextEditorLexical", () => {
	it("передаёт id и ARIA именно в редактируемую область и обновляет их без сброса содержимого", async () => {
		const initialData = { html: "<p>Сохранённый текст</p>", raw: null };
		const onChange = vi.fn();
		const view = render(
			<TextEditorLexicalClient
				initialData={initialData}
				onChange={onChange}
				editableProps={{
					id: "draft-input",
					"aria-label": "Черновик",
					"aria-labelledby": "draft-label",
					"aria-describedby": "draft-help",
					"aria-invalid": true,
					"aria-required": true
				}}
			/>
		);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("Сохранённый текст"));
		expect(input.id).toBe("draft-input");
		expect(input.getAttribute("contenteditable")).toBe("true");
		expect(input.getAttribute("aria-label")).toBe("Черновик");
		expect(input.getAttribute("aria-labelledby")).toBe("draft-label");
		expect(input.getAttribute("aria-describedby")).toBe("draft-help");
		expect(input.getAttribute("aria-invalid")).toBe("true");
		expect(input.getAttribute("aria-required")).toBe("true");
		view.rerender(
			<TextEditorLexicalClient
				initialData={initialData}
				onChange={onChange}
				editableProps={{ id: "draft-input", "aria-label": "Исправленный черновик", "aria-invalid": false, "aria-required": false }}
			/>
		);
		expect(screen.getByRole("textbox")).toBe(input);
		expect(input.textContent).toBe("Сохранённый текст");
		expect(input.getAttribute("aria-label")).toBe("Исправленный черновик");
		expect(input.getAttribute("aria-invalid")).toBe("false");
		expect(input.getAttribute("aria-required")).toBe("false");
		expect(input.hasAttribute("aria-describedby")).toBe(false);
		expect(input.hasAttribute("aria-labelledby")).toBe(false);
	});

	it.each([
		["Нумерованный список", "number", "ol"],
		["Маркированный список", "bullet", "ul"]
	])("сохраняет list + inline + внешнюю ссылку через профиль: %s", async (listAction, listType, tag) => {
		const changed = vi.fn<(data: TextEditorData<TextEditorLexicalRaw>) => void>();
		const view = render(
			<TextEditorLexicalClient
				initialData={{ html: "<p>Документ</p>", raw: null }}
				onChange={changed}
				toolbarComponents={toolbarComponents}
				externalLinkOptions={{ allowQrCode: false }}
			/>
		);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("Документ"));
		await selectEditorText(input);
		fireEvent.click(screen.getByRole("button", { name: listAction }));
		await waitFor(() => expect(input.querySelector(`${tag} > li`)?.textContent).toBe("Документ"));
		await selectEditorText(input);
		fireEvent.click(screen.getByRole("button", { name: "Выделение жирным" }));
		await waitFor(() => expect(input.querySelector("strong")?.textContent).toBe("Документ"));
		// Проверяется однородное выделение. Сохранение смешанного форматирования
		// нескольких text nodes не следует из этого ограниченного сценария.
		expect(changed.mock.lastCall?.[0].raw.editorState).toMatchObject({
			root: {
				children: [
					{ type: "list", listType, children: [{ type: "listitem", children: [{ type: "text", text: "Документ", format: 1 }] }] }
				]
			}
		});
		await selectEditorText(input);
		fireEvent.click(screen.getByRole("button", { name: "Добавить ссылку", exact: true }));
		const dialog = within(screen.getByRole("dialog"));
		expect(dialog.queryByRole("checkbox")).toBeNull();
		fireEvent.change(dialog.getByRole("textbox", { name: "Полный URL адрес" }), { target: { value: "https://example.org/" } });
		fireEvent.change(dialog.getByRole("textbox", { name: "Текст для экранных читалок" }), { target: { value: "Источник" } });
		fireEvent.click(dialog.getByRole("button", { name: "Подтвердить" }));
		await waitFor(() => expect(input.querySelector("a")?.getAttribute("href")).toBe("https://example.org/"));
		const saved = changed.mock.lastCall?.[0];
		if (!saved) throw new Error("Нет сериализованного документа");
		expect(saved.raw).toMatchObject({
			format: "lexical",
			version: 1,
			editorState: {
				root: {
					children: [
						{
							type: "list",
							listType,
							children: [
								{
									type: "listitem",
									children: [
										{
											type: "accessible-link",
											url: "https://example.org/",
											qrCode: false,
											children: [{ type: "text", text: "Документ", format: 1 }]
										}
									]
								}
							]
						}
					]
				}
			}
		});
		view.unmount();
		render(
			<TextEditorLexicalClient
				initialData={saved}
				onChange={changed}
				toolbarComponents={toolbarComponents}
				externalLinkOptions={{ allowQrCode: false }}
			/>
		);
		await waitFor(() => expect(screen.getByRole("textbox").querySelector(`${tag} li a strong`)?.textContent).toBe("Документ"));
	});

	it.each([
		[undefined, true],
		[{ allowQrCode: true }, true],
		[{ allowQrCode: false }, false]
	])("подтверждает прежнюю QR-ссылку согласно настройке %j", async (externalLinkOptions, expectedQr) => {
		const changed = vi.fn<(data: TextEditorData<TextEditorLexicalRaw>) => void>();
		render(
			<TextEditorLexicalClient
				initialData={{
					html: '<p><a href="https://example.org/" aria-label="Источник" data-qr-code="true">Документ</a></p>',
					raw: null
				}}
				onChange={changed}
				toolbarComponents={toolbarComponents}
				externalLinkOptions={externalLinkOptions}
			/>
		);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.querySelector("a")?.getAttribute("data-qr-code")).toBe("true"));
		await selectEditorText(input);
		fireEvent.click(screen.getByRole("button", { name: "Добавить ссылку", exact: true }));
		const dialog = within(screen.getByRole("dialog"));
		if (expectedQr) expect(dialog.getByRole("checkbox")).toHaveProperty("checked", true);
		else expect(dialog.queryByRole("checkbox")).toBeNull();
		fireEvent.click(dialog.getByRole("button", { name: "Подтвердить" }));
		await waitFor(() => expect(input.querySelector("a")?.getAttribute("data-qr-code")).toBe(String(expectedQr)));
		expect(changed.mock.lastCall?.[0].raw.editorState).toMatchObject({
			root: { children: [{ type: "paragraph", children: [{ type: "accessible-link", qrCode: expectedQr }] }] }
		});
	});

	it("применяет запрет QR к уже открытому диалогу с прежним true", async () => {
		const initialData = {
			html: '<p><a href="https://example.org/" aria-label="Источник" data-qr-code="true">Документ</a></p>',
			raw: null
		};
		const changed = vi.fn<(data: TextEditorData<TextEditorLexicalRaw>) => void>();
		const view = render(
			<TextEditorLexicalClient
				initialData={initialData}
				onChange={changed}
				toolbarComponents={toolbarComponents}
				externalLinkOptions={{ allowQrCode: true }}
			/>
		);
		const input = screen.getByRole("textbox");
		await waitFor(() => expect(input.querySelector("a")?.getAttribute("data-qr-code")).toBe("true"));
		await selectEditorText(input);
		fireEvent.click(screen.getByRole("button", { name: "Добавить ссылку", exact: true }));
		expect(within(screen.getByRole("dialog")).getByRole("checkbox")).toHaveProperty("checked", true);
		view.rerender(
			<TextEditorLexicalClient
				initialData={initialData}
				onChange={changed}
				toolbarComponents={toolbarComponents}
				externalLinkOptions={{ allowQrCode: false }}
			/>
		);
		const dialog = within(screen.getByRole("dialog"));
		expect(dialog.queryByRole("checkbox")).toBeNull();
		fireEvent.click(dialog.getByRole("button", { name: "Подтвердить" }));
		await waitFor(() => expect(input.querySelector("a")?.getAttribute("data-qr-code")).toBe("false"));
		expect(changed.mock.lastCall?.[0].raw.editorState).toMatchObject({
			root: { children: [{ type: "paragraph", children: [{ type: "accessible-link", qrCode: false }] }] }
		});
	});
});
