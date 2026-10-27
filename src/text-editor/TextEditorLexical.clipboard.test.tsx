import { act } from "@testing-library/react";
import {
	$createParagraphNode,
	$createTextNode,
	$getRoot,
	$getSelection,
	$isElementNode,
	$isRangeSelection,
	getNearestEditorFromDOMNode,
	IS_BOLD,
	IS_ITALIC,
	IS_SUBSCRIPT
} from "lexical";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { type TextEditorClipboardOptions, type TextEditorClipboardProfile } from "./editorModel";
import { mountClipboardEditor, pasteClipboard, readClipboardBlocks } from "./TextEditorLexical.clipboard.fixture.test";
import { TextEditorLexicalClient } from "./TextEditorLexicalClient";

const profile = {
	blockStyles: ["unstyled", "ordered-list-item", "unordered-list-item"],
	inlineStyles: ["BOLD", "ITALIC", "UNDERLINE", "STRIKETHROUGH", "HIGHLIGHT", "CODE"],
	// Предикат fixture проверяет применение callback; безопасность URL принадлежит consumer.
	normalizeLinkUrl: (url: string) => (url.startsWith("https://") ? url : null)
} as const satisfies TextEditorClipboardProfile;
const normalizedClipboard = { profile } as const satisfies TextEditorClipboardOptions;
const alignedHtml = '<div style="text-align: left;"><p>Скопированный текст</p></div>';
const rangeRect = Object.getOwnPropertyDescriptor(Range.prototype, "getBoundingClientRect");

beforeAll(() => {
	// jsdom не вычисляет selection geometry; editor, import и insertion остаются настоящими.
	Object.defineProperty(Range.prototype, "getBoundingClientRect", { configurable: true, value: () => new DOMRect() });
});
afterAll(() => {
	if (rangeRect) Object.defineProperty(Range.prototype, "getBoundingClientRect", rangeRect);
	else Reflect.deleteProperty(Range.prototype, "getBoundingClientRect");
});
beforeEach(() => {
	vi.stubGlobal("ClipboardEvent", Event);
	vi.stubGlobal("DragEvent", class extends Event {});
});
afterEach(() => {
	vi.unstubAllGlobals();
});

describe("явный профиль содержимого буфера обмена", () => {
	it.each([undefined, {}])("без профиля сохраняет прежнее выравнивание HTML: %j", async (clipboardOptions) => {
		const fixture = mountClipboardEditor({ clipboardOptions });
		const event = await pasteClipboard(fixture, { "text/html": alignedHtml, "text/plain": "Скопированный текст" });
		expect(event.defaultPrevented).toBe(true);
		expect(fixture.input.textContent).toBe("Скопированный текст");
		expect(readClipboardBlocks(fixture.editor)).toEqual(
			expect.arrayContaining([expect.objectContaining({ format: "left", text: "Скопированный текст" })])
		);
	});

	it("без профиля сохраняет языковую семантику", async () => {
		const fixture = mountClipboardEditor();
		await pasteClipboard(fixture, { "text/html": '<p><span lang="en">Hello</span></p>', "text/plain": "Hello" });
		fixture.editor.getEditorState().read(() => {
			const parents = $getRoot()
				.getAllTextNodes()
				.flatMap((node) => node.getParents().map((parent) => parent.getType()));
			expect(parents).toContain("semantic-tag");
		});
	});

	it.each([
		{ name: "абзац", html: '<p style="text-align: right;">Скопированный текст</p>', type: "paragraph" },
		{ name: "внешний div", html: alignedHtml, type: "paragraph" },
		{
			name: "вложенные div",
			html: '<div style="text-align: right;"><div style="text-align: center;"><p>Скопированный текст</p></div></div>',
			type: "paragraph"
		},
		{
			name: "список",
			html: '<div style="text-align: right;"><ul style="text-align: justify;"><li style="text-align: center;">Скопированный текст</li></ul></div>',
			type: "list"
		}
	])("нормализует блоки после полного импорта HTML: $name", async ({ html, type }) => {
		const fixture = mountClipboardEditor({ clipboardOptions: normalizedClipboard });
		const event = await pasteClipboard(fixture, { "text/html": html, "text/plain": "Скопированный текст" });
		expect(event.defaultPrevented).toBe(true);
		expect(fixture.input.textContent).toBe("Скопированный текст");
		const blocks = readClipboardBlocks(fixture.editor);
		expect(blocks).toEqual(expect.arrayContaining([expect.objectContaining({ type, format: "" })]));
		expect(blocks.every((block) => block.format === "")).toBe(true);
		expect(fixture.onChange.mock.lastCall?.[0].raw).toMatchObject({ format: "lexical", version: 1 });
	});

	it.each([
		{ name: "заголовок", html: "<h2>Скопированный текст</h2>" },
		{ name: "цитата", html: "<blockquote>Скопированный текст</blockquote>" },
		{ name: "язык", html: '<p><span lang="en">Скопированный текст</span></p>' },
		{ name: "время", html: '<p><time datetime="2026-10-27">Скопированный текст</time></p>' },
		{ name: "аббревиатура", html: '<p><abbr title="Значение">Скопированный текст</abbr></p>' },
		{ name: "семантическая цитата", html: "<p><cite>Скопированный текст</cite></p>" },
		{ name: "вставка", html: "<p><ins>Скопированный текст</ins></p>" },
		{ name: "удаление", html: "<p><del>Скопированный текст</del></p>" },
		{ name: "неизвестные HTML-обёртки", html: "<section><article><p>Скопированный текст</p></article></section>" }
	])("сохраняет текст неподдерживаемого содержимого: $name", async ({ html }) => {
		const fixture = mountClipboardEditor({ clipboardOptions: normalizedClipboard });
		await pasteClipboard(fixture, { "text/html": html, "text/plain": "Plain fallback" });
		expect(fixture.input.textContent).toBe("Скопированный текст");
		const blocks = readClipboardBlocks(fixture.editor);
		expect(blocks.length).toBeGreaterThan(0);
		expect(blocks.every((block) => block.type === "paragraph")).toBe(true);
		fixture.editor.getEditorState().read(() => {
			const types = $getRoot()
				.getAllTextNodes()
				.flatMap((node) => node.getParents().map((parent) => parent.getType()));
			expect(types).not.toContain("semantic-tag");
		});
	});

	it("сохраняет разрешённые блоки и вложенный список", async () => {
		const clipboardOptions = { profile: { ...profile, blockStyles: [...profile.blockStyles, "header-two", "blockquote"] } } as const;
		const fixture = mountClipboardEditor({ clipboardOptions });
		const html = "<h2>Заголовок</h2><blockquote>Цитата</blockquote><ul><li>Первый<ul><li>Вложенный</li></ul></li></ul>";
		await pasteClipboard(fixture, { "text/html": html, "text/plain": "Plain fallback" });
		const blocks = readClipboardBlocks(fixture.editor);
		expect(blocks).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ type: "heading", text: "Заголовок" }),
				expect.objectContaining({ type: "quote", text: "Цитата" }),
				expect.objectContaining({ type: "listitem", text: "Вложенный" })
			])
		);
		expect(fixture.input.textContent).toContain("Первый");
	});

	it("сохраняет разрешённые inline-форматы и ссылку", async () => {
		const fixture = mountClipboardEditor({ clipboardOptions: normalizedClipboard });
		const html =
			'<div style="text-align: left;"><p><strong><em>Выделение</em></strong> <a href="https://example.com/material">Материал</a></p></div>';
		await pasteClipboard(fixture, { "text/html": html, "text/plain": "Plain fallback" });
		expect(fixture.input.textContent).toBe("Выделение Материал");
		expect(fixture.input.querySelector("a")?.getAttribute("href")).toBe("https://example.com/material");
		fixture.editor.getEditorState().read(() => {
			const emphasis = $getRoot()
				.getAllTextNodes()
				.find((node) => node.getTextContent() === "Выделение");
			expect(emphasis?.getFormat()).toBe(IS_BOLD | IS_ITALIC);
		});
	});

	it("оставляет только разрешённые inline-форматы", async () => {
		const fixture = mountClipboardEditor({ clipboardOptions: { profile: { ...profile, inlineStyles: ["BOLD"] } } });
		await pasteClipboard(fixture, { "text/html": "<p><strong><em><u>Выделение</u></em></strong></p>", "text/plain": "Plain fallback" });
		fixture.editor.getEditorState().read(() => {
			expect(
				$getRoot()
					.getAllTextNodes()
					.map((node) => node.getFormat())
			).toEqual([IS_BOLD]);
		});
	});

	it("по callback превращает неподдерживаемый URL в оформленный текст", async () => {
		const fixture = mountClipboardEditor({ clipboardOptions: normalizedClipboard });
		await pasteClipboard(fixture, {
			"text/html": '<p><a href="javascript:alert(1)"><strong>Подпись ссылки</strong></a></p>',
			"text/plain": "Plain fallback"
		});
		expect(fixture.input.textContent).toBe("Подпись ссылки");
		expect(fixture.input.querySelector("a")).toBeNull();
		fixture.editor.getEditorState().read(() => {
			expect(
				$getRoot()
					.getAllTextNodes()
					.map((node) => node.getFormat())
			).toEqual([IS_BOLD]);
		});
	});

	it("использует нормализованный URL, возвращённый callback", async () => {
		const normalizeLinkUrl = vi.fn(() => "https://example.com/canonical");
		const fixture = mountClipboardEditor({ clipboardOptions: { profile: { ...profile, normalizeLinkUrl } } });
		await pasteClipboard(fixture, {
			"text/html": '<p><a href="https://example.com/input">Ссылка</a></p>',
			"text/plain": "Plain fallback"
		});
		expect(normalizeLinkUrl).toHaveBeenCalledWith("https://example.com/input");
		expect(fixture.input.querySelector("a")?.getAttribute("href")).toBe("https://example.com/canonical");
	});

	it("не меняет HTML initialData по clipboard-профилю", () => {
		const fixture = mountClipboardEditor({
			initialData: { html: '<h2 style="text-align: right;">Начальный документ</h2>', raw: null },
			clipboardOptions: normalizedClipboard
		});
		expect(readClipboardBlocks(fixture.editor)).toEqual(
			expect.arrayContaining([expect.objectContaining({ type: "heading", format: "right", text: "Начальный документ" })])
		);
	});

	it("сохраняет явное направление текста при очистке оформления", async () => {
		const fixture = mountClipboardEditor({ clipboardOptions: normalizedClipboard });
		await pasteClipboard(fixture, { "text/html": '<p dir="rtl" style="text-align: right;">שלום</p>', "text/plain": "Plain fallback" });
		fixture.editor.getEditorState().read(() => {
			const paragraph = $getRoot().getFirstChild();
			if (!$isElementNode(paragraph)) throw new Error("Нет вставленного абзаца");
			expect(paragraph.getDirection()).toBe("rtl");
			expect(paragraph.getFormatType()).toBe("");
		});
	});

	it("нормализует tab и перевод строки в тексте Raw clipboard", async () => {
		const source = mountClipboardEditor({ initialData: { html: "<p>Источник</p>", raw: null } });
		await act(async () => {
			source.editor.update(
				() => {
					const text = $getRoot().getAllTextNodes()[0];
					if (!text) throw new Error("Нет исходного текста");
					text.setTextContent("Строка\tодин\nСтрока два");
				},
				{ discrete: true }
			);
		});
		const target = mountClipboardEditor({ clipboardOptions: normalizedClipboard });
		await pasteClipboard(target, {
			"application/x-lexical-editor": JSON.stringify({
				namespace: "TextEditorLexical",
				nodes: source.editor.getEditorState().toJSON().root.children
			}),
			"text/plain": "Plain fallback"
		});
		target.editor.getEditorState().read(() => {
			expect($getRoot().getTextContent()).toBe("Строка один\nСтрока два");
			expect(
				$getRoot()
					.getAllTextNodes()
					.every((node) => !/[\t\n]/.test(node.getTextContent()))
			).toBe(true);
		});
	});

	it("нормализует tab и несколько строк чистого text/plain без TabNode", async () => {
		const fixture = mountClipboardEditor({ clipboardOptions: normalizedClipboard });
		const event = await pasteClipboard(fixture, { "text/plain": "Первая\tстрока\r\nВторая\n\nТретья" });
		expect(event.defaultPrevented).toBe(true);
		fixture.editor.getEditorState().read(() => {
			const children = $getRoot().getChildren();
			expect(children.map((node) => node.getType())).toEqual(["paragraph", "paragraph", "paragraph", "paragraph"]);
			expect(children.map((node) => node.getTextContent())).toEqual(["Первая строка", "Вторая", "", "Третья"]);
			const texts = $getRoot().getAllTextNodes();
			expect(texts.every((node) => node.getType() === "text" && !/[\t\r\n]/.test(node.getTextContent()))).toBe(true);
		});
	});

	it("сохраняет допустимый формат selection для plain-вставки и не меняет прежние блоки", async () => {
		const source = mountClipboardEditor({ initialData: { html: "<p>Первый фрагмент</p><p>Второй</p>", raw: null } });
		const sourceRaw = source.editor.getEditorState().toJSON();
		const plain = source.editor.getEditorState().read(() => $getRoot().getTextContent());
		const target = mountClipboardEditor({
			initialData: { html: '<p style="text-align: right;">Прежний блок</p>', raw: null },
			clipboardOptions: normalizedClipboard
		});
		const original = readClipboardBlocks(target.editor)[0];
		await act(async () => {
			target.input.focus();
			target.editor.update(
				() => {
					const paragraph = $createParagraphNode();
					const prefix = $createTextNode("Префикс").setFormat(IS_BOLD | IS_ITALIC | IS_SUBSCRIPT);
					paragraph.append(prefix);
					$getRoot().append(paragraph);
					// Реальный caret наследует формат существующего TextNode и сохраняет его после DOM sync.
					prefix.selectEnd();
				},
				{ discrete: true }
			);
		});
		target.editor.getEditorState().read(() => {
			const selection = $getSelection();
			if (!$isRangeSelection(selection)) throw new Error("Нет текущего текстового выделения");
			expect(selection.format).toBe(IS_BOLD | IS_ITALIC | IS_SUBSCRIPT);
		});
		const event = await pasteClipboard(target, { "text/plain": plain }, "current");
		expect(event.defaultPrevented).toBe(true);
		expect(readClipboardBlocks(target.editor).find((block) => block.key === original?.key)).toEqual(original);
		target.editor.getEditorState().read(() => {
			const prefix = $getRoot()
				.getAllTextNodes()
				.find((node) => node.getTextContent() === "Префикс");
			expect(prefix?.getFormat()).toBe(IS_BOLD | IS_ITALIC | IS_SUBSCRIPT);
			const texts = $getRoot()
				.getAllTextNodes()
				.filter((node) => node.getTextContent() !== "Прежний блок" && node.getTextContent() !== "Префикс");
			expect(texts.map((node) => ({ text: node.getTextContent(), format: node.getFormat() }))).toEqual([
				{ text: "Первый фрагмент", format: IS_BOLD | IS_ITALIC },
				{ text: "Второй", format: IS_BOLD | IS_ITALIC }
			]);
		});
		expect(source.editor.getEditorState().toJSON()).toStrictEqual(sourceRaw);
	});

	it("сохраняет initial Raw и исходный документ, нормализуя только новые Raw clipboard nodes", async () => {
		const source = mountClipboardEditor({ initialData: { html: '<p style="text-align: right;">Источник</p>', raw: null } });
		await act(async () => {
			source.editor.update(
				() => {
					const paragraph = $getRoot().getFirstChild();
					if (!$isElementNode(paragraph)) throw new Error("Нет исходного абзаца");
					paragraph.setIndent(2);
					paragraph.setTextStyle("color: red;");
					const text = $getRoot().getAllTextNodes()[0];
					if (!text) throw new Error("Нет исходного текста");
					text.setFormat(IS_BOLD | IS_SUBSCRIPT)
						.setStyle("color: red;")
						.setMode("token")
						.setDetail(3);
				},
				{ discrete: true }
			);
		});
		const sourceRaw = source.editor.getEditorState().toJSON();
		const initialData = { html: "", raw: { format: "lexical", version: 1, editorState: sourceRaw } };
		const target = mountClipboardEditor({ initialData, clipboardOptions: normalizedClipboard });
		expect(target.editor.getEditorState().toJSON()).toStrictEqual(sourceRaw);
		const original = readClipboardBlocks(target.editor)[0];
		await act(async () => {
			target.editor.update(() => $getRoot().append($createParagraphNode()), { discrete: true });
		});
		await pasteClipboard(
			target,
			{
				"application/x-lexical-editor": JSON.stringify({ namespace: "TextEditorLexical", nodes: sourceRaw.root.children }),
				"text/html": '<p style="text-align: center;">HTML fallback</p>',
				"text/plain": "Plain fallback"
			},
			"append"
		);
		expect(target.input.textContent).toBe("ИсточникИсточник");
		const blocks = readClipboardBlocks(target.editor);
		expect(blocks.find((block) => block.key === original?.key)).toEqual(original);
		expect(blocks.filter((block) => block.key !== original?.key).every((block) => block.format === "")).toBe(true);
		target.editor.getEditorState().read(() => {
			const pasted = $getRoot().getLastChild();
			if (!$isElementNode(pasted)) throw new Error("Нет вставленного блока");
			expect(pasted.getIndent()).toBe(0);
			expect(pasted.getTextStyle()).toBe("");
			const texts = pasted.getAllTextNodes();
			expect(
				texts.map((node) => ({
					text: node.getTextContent(),
					format: node.getFormat(),
					style: node.getStyle(),
					mode: node.getMode(),
					detail: node.getDetail()
				}))
			).toEqual([{ text: "Источник", format: IS_BOLD, style: "", mode: "normal", detail: 0 }]);
		});
		expect(source.editor.getEditorState().toJSON()).toStrictEqual(sourceRaw);
	});

	it("ошибка URL callback прерывает вставку, сохраняя прежний документ", async () => {
		const failure = new Error("Ошибка callback fixture");
		const fixture = mountClipboardEditor({
			initialData: { html: "<p>Сохранить документ</p>", raw: null },
			clipboardOptions: {
				profile: {
					...profile,
					normalizeLinkUrl: () => {
						throw failure;
					}
				}
			}
		});
		const before = fixture.editor.getEditorState().toJSON();
		const logged = vi.spyOn(console, "error").mockImplementation(() => undefined);
		try {
			await pasteClipboard(fixture, {
				"text/html": '<p><a href="https://example.com/input">Новая ссылка</a></p>',
				"text/plain": "Plain fallback"
			});
			expect(fixture.editor.getEditorState().toJSON()).toStrictEqual(before);
			expect(logged.mock.calls.flat()).toContain(failure);
		} finally {
			logged.mockRestore();
		}
	});

	it("удаление профиля отключает прежнюю обработку без замены editor", async () => {
		const initialData = { html: "", raw: null };
		const fixture = mountClipboardEditor({ initialData, clipboardOptions: normalizedClipboard });
		await pasteClipboard(fixture, { "text/html": alignedHtml, "text/plain": "Скопированный текст" });
		expect(readClipboardBlocks(fixture.editor).every((block) => block.format === "")).toBe(true);
		await act(async () => fixture.handle.clear());
		fixture.view.rerender(<TextEditorLexicalClient initialData={initialData} onChange={fixture.onChange} />);
		expect(getNearestEditorFromDOMNode(fixture.input)).toBe(fixture.editor);
		const event = await pasteClipboard(fixture, { "text/html": alignedHtml, "text/plain": "Скопированный текст" });
		expect(event.defaultPrevented).toBe(true);
		expect(fixture.input.textContent).toBe("Скопированный текст");
		expect(readClipboardBlocks(fixture.editor)).toEqual(
			expect.arrayContaining([expect.objectContaining({ format: "left", text: "Скопированный текст" })])
		);
	});
});
