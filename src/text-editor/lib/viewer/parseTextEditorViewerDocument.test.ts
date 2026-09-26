import { IS_BOLD, IS_CODE, IS_HIGHLIGHT, IS_ITALIC, IS_STRIKETHROUGH, IS_SUBSCRIPT, IS_SUPERSCRIPT, IS_UNDERLINE } from "lexical";
import { describe, expect, it, vi } from "vitest";

import { parseTextEditorViewerDocument } from "./parseTextEditorViewerDocument";

/** Fixtures описывают сериализацию editor, а не DOM или предметный профиль приложения. */
function text(value = "Текст", format = 0) {
	return { type: "text", version: 1, detail: 0, mode: "normal", style: "", text: value, format };
}

function element(type: string, children: readonly unknown[], properties: Record<string, unknown> = {}) {
	return { type, version: 1, direction: null, format: "", indent: 0, children, ...properties };
}

function document(children: readonly unknown[]) {
	return { format: "lexical", version: 1, editorState: { root: element("root", children) } };
}

function link(type = "accessible-link", properties: Record<string, unknown> = {}) {
	return element(type, [text("Ссылка")], {
		url: "https://example.org/path",
		target: "_blank",
		rel: "opener",
		title: "Описание",
		...(type === "accessible-link" ? { ariaLabel: "Открыть сайт", qrCode: false, add: null, text: "Не источник отображения" } : {}),
		...properties
	});
}

function nestedList(depth: number): unknown {
	let child: unknown = text();
	for (let index = 0; index < depth; index++) {
		child = element("list", [element("listitem", [child], { value: 1 })], { listType: "bullet", tag: "ul", start: 1 });
	}
	return child;
}

describe("проекция Lexical-документа для чтения", () => {
	it("сохраняет inline текст буквально, отдельный перенос и пустые абзацы", () => {
		const input = document([
			element("paragraph", [text("  <script> & 🐈  "), { type: "linebreak", version: 1 }, text("Следующая строка")]),
			element("paragraph", [])
		]);
		expect(parseTextEditorViewerDocument(input)).toEqual({
			status: "valid",
			element: { direction: null, alignment: "", indent: 0 },
			children: [
				{
					type: "paragraph",
					direction: null,
					alignment: "",
					indent: 0,
					children: [
						{ type: "text", text: "  <script> & 🐈  ", format: 0 },
						{ type: "linebreak" },
						{ type: "text", text: "Следующая строка", format: 0 }
					]
				},
				{ type: "paragraph", direction: null, alignment: "", indent: 0, children: [] }
			]
		});
	});

	it.each([
		IS_BOLD,
		IS_ITALIC,
		IS_STRIKETHROUGH,
		IS_UNDERLINE,
		IS_CODE,
		IS_HIGHLIGHT,
		IS_SUBSCRIPT,
		IS_SUPERSCRIPT,
		IS_BOLD | IS_ITALIC | IS_STRIKETHROUGH | IS_UNDERLINE | IS_CODE | IS_HIGHLIGHT | IS_SUBSCRIPT | IS_SUPERSCRIPT
	])("сохраняет поддержанный inline format %s", (format) => {
		expect(parseTextEditorViewerDocument(document([element("paragraph", [text("Текст", format)])]))).toMatchObject({
			status: "valid",
			children: [{ children: [{ format }] }]
		});
	});

	it("сохраняет headings, quote, root и element formatting без Messenger policy", () => {
		const input = document([
			...(["h1", "h2", "h3", "h4", "h5", "h6"] as const).map((tag) => element("heading", [text(tag)], { tag })),
			element("quote", [text("Цитата")], { direction: "rtl", format: "center", indent: 2 })
		]);
		expect(
			parseTextEditorViewerDocument({
				...input,
				editorState: { root: { ...input.editorState.root, direction: "rtl", format: "right", indent: 1 } }
			})
		).toMatchObject({
			status: "valid",
			element: { direction: "rtl", alignment: "right", indent: 1 },
			children: [
				...(["h1", "h2", "h3", "h4", "h5", "h6"] as const).map((tag) => ({ type: "heading", tag })),
				{ type: "quote", direction: "rtl", alignment: "center", indent: 2 }
			]
		});
		expect(parseTextEditorViewerDocument(document([])).status).toBe("valid");
		expect(parseTextEditorViewerDocument(document([element("paragraph", [text("а".repeat(5_001))])])).status).toBe("valid");
	});

	it.each(["", "left", "right", "center", "justify", "start", "end"])("принимает alignment %s", (format) => {
		expect(parseTextEditorViewerDocument(document([element("paragraph", [], { format })]))).toMatchObject({
			status: "valid",
			children: [{ alignment: format }]
		});
	});

	it("сохраняет start/value и list-only wrapper вложенного списка", () => {
		const inner = element("list", [element("listitem", [text("Вложенный")], { value: 1 })], {
			listType: "bullet",
			tag: "ul",
			start: 1
		});
		const input = document([
			element("list", [element("listitem", [text("Первый")], { value: 7 }), element("listitem", [inner], { value: 8 })], {
				listType: "number",
				tag: "ol",
				start: 7
			})
		]);
		expect(parseTextEditorViewerDocument(input)).toMatchObject({
			status: "valid",
			children: [
				{
					type: "list",
					listType: "number",
					start: 7,
					children: [
						{ type: "listitem", value: 7 },
						{
							type: "listitem",
							value: 8,
							children: [{ type: "list", listType: "bullet", children: [{ children: [{ text: "Вложенный" }] }] }]
						}
					]
				}
			]
		});
	});

	it.each(["link", "accessible-link"])("проецирует %s без raw rel и без подмены детей полем text", (type) => {
		const parsed = parseTextEditorViewerDocument(document([element("paragraph", [link(type, { direction: "rtl" })])]));
		expect(parsed).toMatchObject({
			status: "valid",
			children: [
				{
					children: [
						{
							type: "link",
							url: "https://example.org/path",
							target: "_blank",
							direction: "rtl",
							title: "Описание",
							children: [{ text: "Ссылка" }]
						}
					]
				}
			]
		});
		if (parsed.status !== "valid") throw new Error("Ожидалась валидная проекция.");
		const paragraph = parsed.children[0];
		if (paragraph?.type !== "paragraph") throw new Error("Ожидался абзац.");
		expect(paragraph.children[0]).not.toHaveProperty("rel");
		expect(paragraph.children[0]).not.toHaveProperty("text");
	});

	it("выбирает _self при отсутствии target и сохраняет accessible label", () => {
		expect(parseTextEditorViewerDocument(document([element("paragraph", [link("accessible-link", { target: null })])]))).toMatchObject({
			status: "valid",
			children: [{ children: [{ target: "_self", ariaLabel: "Открыть сайт" }] }]
		});
	});
});

describe("fail-closed границы viewer", () => {
	it.each([-1, 0.5, 256, 512, 2 ** 32, Number.MAX_SAFE_INTEGER, NaN, Infinity])(
		"не обрезает неизвестный format %s до 32 бит",
		(format) => {
			expect(parseTextEditorViewerDocument(document([element("paragraph", [text("Текст", format)])]))).toEqual({ status: "invalid" });
		}
	);

	it("отклоняет неподдержанный узел вместе со всем документом", () => {
		for (const type of ["semantic-tag", "image", "table", "autolink", "unknown"]) {
			expect(
				parseTextEditorViewerDocument(document([element("paragraph", [text("До")]), element(type, [text("Не скрывать молча")])]))
			).toEqual({ status: "invalid" });
		}
	});

	it("отклоняет CSS, checklist, неизвестные атрибуты и некорректную структуру", () => {
		for (const block of [
			element("paragraph", [text()], { textStyle: "color:red" }),
			element("paragraph", [{ ...text(), style: "position:fixed" }]),
			element("paragraph", [text()], { onclick: "alert(1)" }),
			element("paragraph", [text()], { indent: 33 }),
			element("paragraph", [text()], { direction: "auto" }),
			element("heading", [text()], { tag: "script" }),
			element("paragraph", [element("paragraph", [text()])]),
			element("list", [element("listitem", [text()], { value: 1, checked: false })], { listType: "bullet", tag: "ul", start: 1 }),
			element("list", [], { listType: "check", tag: "ul", start: 1 }),
			element("list", [], { listType: "bullet", tag: "ol", start: 1 }),
			element("list", [text()], { listType: "bullet", tag: "ul", start: 1 }),
			element("listitem", [text()], { value: 1 })
		])
			expect(parseTextEditorViewerDocument(document([block]))).toEqual({ status: "invalid" });
	});

	it("отклоняет nested link, QR, business metadata и опасную ссылку", () => {
		for (const invalid of [
			link("accessible-link", { qrCode: true }),
			link("accessible-link", { add: "/business" }),
			link("accessible-link", { target: "popup" }),
			link("accessible-link", { url: "javascript:alert(1)" }),
			link("accessible-link", { children: [link()] })
		])
			expect(parseTextEditorViewerDocument(document([element("paragraph", [invalid])]))).toEqual({ status: "invalid" });
	});

	it("проверяет envelope и не принимает executable или class-shaped значения", () => {
		for (const input of [
			null,
			{},
			[],
			new Date(),
			{ ...document([]), version: 2 },
			{ ...document([]), html: "<p>HTML</p>" },
			{ ...document([]), editorState: { root: element("root", []), selection: {} } }
		]) {
			expect(parseTextEditorViewerDocument(input)).toEqual({ status: "invalid" });
		}
	});

	it("не исполняет getter объекта, индекса массива или подменённый iterator", () => {
		const getter = vi.fn(() => "Текст");
		const node = { ...text() };
		Object.defineProperty(node, "text", { get: getter });
		expect(parseTextEditorViewerDocument(document([element("paragraph", [node])])).status).toBe("invalid");
		const children = [text()];
		Object.defineProperty(children, 0, { get: getter });
		expect(parseTextEditorViewerDocument(document([element("paragraph", children)])).status).toBe("invalid");
		const iterator = vi.fn();
		const iterable = [text()];
		Object.defineProperty(iterable, Symbol.iterator, { value: iterator });
		expect(parseTextEditorViewerDocument(document([element("paragraph", iterable)])).status).toBe("invalid");
		expect(getter).not.toHaveBeenCalled();
		expect(iterator).not.toHaveBeenCalled();
	});

	it("не считает разреженные массивы и скрытые свойства JSON-снимком", () => {
		const sparse = Array(1);
		expect(parseTextEditorViewerDocument(document([element("paragraph", sparse)])).status).toBe("invalid");
		const node = { ...text() };
		Object.defineProperty(node, "privateProperty", { value: "Не сериализуется" });
		expect(parseTextEditorViewerDocument(document([element("paragraph", [node])])).status).toBe("invalid");
	});

	it("принимает обычное повторное использование immutable узла, но ограничивает циклы и глубину", () => {
		const shared = text();
		expect(parseTextEditorViewerDocument(document([element("paragraph", [shared, shared])])).status).toBe("valid");
		expect(parseTextEditorViewerDocument(document([nestedList(15)]))).toMatchObject({ status: "valid" });
		expect(parseTextEditorViewerDocument(document([nestedList(16)]))).toEqual({ status: "invalid" });
		const cyclic: Record<string, unknown> = element("list", [], { listType: "bullet", tag: "ul", start: 1 });
		cyclic.children = [element("listitem", [cyclic], { value: 1 })];
		expect(parseTextEditorViewerDocument(document([cyclic]))).toEqual({ status: "invalid" });
	});

	it("ограничивает число узлов и суммарный текст до построения полного результата", () => {
		expect(
			parseTextEditorViewerDocument(
				document([
					element(
						"paragraph",
						Array.from({ length: 9_998 }, () => text(""))
					)
				])
			).status
		).toBe("valid");
		expect(
			parseTextEditorViewerDocument(
				document([
					element(
						"paragraph",
						Array.from({ length: 9_999 }, () => text(""))
					)
				])
			).status
		).toBe("invalid");
		expect(parseTextEditorViewerDocument(document([element("paragraph", [text("а".repeat(1_000_000))])])).status).toBe("valid");
		expect(
			parseTextEditorViewerDocument(document([element("paragraph", [text("а".repeat(500_001)), text("б".repeat(500_000))])])).status
		).toBe("invalid");
	});
});
