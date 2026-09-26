// @vitest-environment jsdom

import { $createListItemNode, $createListNode, ListItemNode, ListNode } from "@lexical/list";
import { $createHeadingNode, $createQuoteNode, HeadingNode, QuoteNode } from "@lexical/rich-text";
import { act, render } from "@testing-library/react";
import {
	$createParagraphNode,
	$createTextNode,
	$getRoot,
	createEditor,
	IS_BOLD,
	IS_CODE,
	IS_HIGHLIGHT,
	IS_ITALIC,
	IS_STRIKETHROUGH,
	IS_SUBSCRIPT,
	IS_SUPERSCRIPT,
	IS_UNDERLINE
} from "lexical";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
	createTextEditorViewerElement,
	createTextEditorViewerRaw,
	createTextEditorViewerText
} from "../test/text-editor/textEditorViewerFixtures";

import { type TextEditorLexicalRaw } from "./editorModel";
import { $createAccessibleLinkNode, AccessibleLinkNode } from "./nodes/AccessibleLinkNode";
import { TextEditorLexicalViewer } from "./TextEditorLexicalViewer";

describe("TextEditorLexicalViewer", () => {
	it("показывает HTML-подобный текст как текст без исполняемых элементов и editor controls", () => {
		const text = '<img src=x onerror="alert(1)"><script>alert(2)</script> & текст';
		const raw = createTextEditorViewerRaw([createTextEditorViewerElement("paragraph", [createTextEditorViewerText(text)])]);
		const { container } = render(<TextEditorLexicalViewer raw={raw} />);
		const viewer = container.querySelector('[data-text-editor-viewer="ready"]');

		expect(viewer?.textContent).toBe(text);
		expect(container.querySelector("script, img, iframe, [onerror]")).toBeNull();
		expect(container.querySelector('[contenteditable], [role="textbox"], [role="toolbar"], button, input, textarea')).toBeNull();
	});

	it("сохраняет семантику всех поддержанных inline formats и их сочетаний", () => {
		const formats = [
			{ bit: IS_BOLD, selector: "strong", value: "bold" },
			{ bit: IS_ITALIC, selector: "em", value: "italic" },
			{ bit: IS_UNDERLINE, selector: "u", value: "underline" },
			{ bit: IS_STRIKETHROUGH, selector: "s", value: "strike" },
			{ bit: IS_CODE, selector: "code", value: "code" },
			{ bit: IS_HIGHLIGHT, selector: "mark", value: "highlight" },
			{ bit: IS_SUBSCRIPT, selector: "sub", value: "subscript" },
			{ bit: IS_SUPERSCRIPT, selector: "sup", value: "superscript" }
		];
		const raw = createTextEditorViewerRaw([
			...formats.map(({ bit, value }) => createTextEditorViewerElement("paragraph", [createTextEditorViewerText(value, bit)])),
			createTextEditorViewerElement("paragraph", [
				createTextEditorViewerText("combined", IS_BOLD | IS_ITALIC | IS_UNDERLINE | IS_STRIKETHROUGH)
			])
		]);
		const { container } = render(<TextEditorLexicalViewer raw={raw} />);

		// Здесь теги — проверяемая семантика документа, а не техническая структура контейнеров.
		for (const { selector, value } of formats) {
			expect([...container.querySelectorAll(selector)].some((element) => element.textContent === value)).toBe(true);
		}
		for (const selector of ["strong", "em", "u", "s"]) {
			expect([...container.querySelectorAll(selector)].some((element) => element.textContent === "combined")).toBe(true);
		}
	});

	it("сохраняет заголовки, цитату, перенос строки и направление текста", () => {
		const raw = createTextEditorViewerRaw([
			...Array.from({ length: 6 }, (_, index) =>
				createTextEditorViewerElement("heading", [createTextEditorViewerText(`heading-${index + 1}`)], { tag: `h${index + 1}` })
			),
			createTextEditorViewerElement("quote", [createTextEditorViewerText("quotation")]),
			createTextEditorViewerElement(
				"paragraph",
				[createTextEditorViewerText("До"), { type: "linebreak", version: 1 }, createTextEditorViewerText("После")],
				{ direction: "rtl" }
			)
		]);
		const { container } = render(<TextEditorLexicalViewer raw={raw} />);

		for (let level = 1; level <= 6; level += 1) expect(container.querySelector(`h${level}`)?.textContent).toBe(`heading-${level}`);
		expect(container.querySelector("blockquote")?.textContent).toBe("quotation");
		expect(container.querySelector("p[dir=rtl]")?.textContent).toBe("ДоПосле");
		expect(container.querySelector("p[dir=rtl] br")).not.toBeNull();
	});

	it("сохраняет нумерацию и вложенный список без потери пунктов", () => {
		const nested = createTextEditorViewerElement(
			"list",
			[createTextEditorViewerElement("listitem", [createTextEditorViewerText("nested")], { value: 1 })],
			{ listType: "bullet", tag: "ul", start: 1 }
		);
		const raw = createTextEditorViewerRaw([
			createTextEditorViewerElement(
				"list",
				[
					createTextEditorViewerElement("listitem", [createTextEditorViewerText("first")], { value: 4 }),
					createTextEditorViewerElement("listitem", [nested], { value: 5 }),
					createTextEditorViewerElement("listitem", [createTextEditorViewerText("last")], { value: 7 })
				],
				{ listType: "number", tag: "ol", start: 4 }
			)
		]);
		const { container } = render(<TextEditorLexicalViewer raw={raw} />);

		expect(container.querySelector("ol")?.getAttribute("start")).toBe("4");
		expect(container.querySelector('ol > li[value="4"]')?.textContent).toBe("first");
		expect(container.querySelector('ol > li[value="7"]')?.textContent).toBe("last");
		expect(container.querySelector("ol ul li")?.textContent).toBe("nested");
		expect(container.querySelector('li[data-nested-list="true"] > ul')?.textContent).toBe("nested");
		// Лишний видимый marker обёртки проверяется браузером: jsdom не рассчитывает ::marker.
	});

	it("читает JSON, сформированный настоящими узлами текущего редактора", () => {
		const editor = createEditor({
			namespace: "viewer-serialization-test",
			nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, AccessibleLinkNode],
			onError: (error) => {
				throw error;
			}
		});
		editor.update(
			() => {
				const link = $createAccessibleLinkNode("https://example.org/", { target: "_blank", ariaLabel: "Источник" });
				link.append($createTextNode("link"));
				$getRoot().append(
					$createHeadingNode("h2").append($createTextNode("heading")),
					$createQuoteNode().append($createTextNode("quotation")),
					$createParagraphNode().append($createTextNode("bold").toggleFormat("bold"), link),
					$createListNode("number", 4).append($createListItemNode(4).append($createTextNode("numbered")))
				);
			},
			{ discrete: true }
		);
		const raw: TextEditorLexicalRaw = { format: "lexical", version: 1, editorState: { ...editor.getEditorState().toJSON() } };
		const { container } = render(<TextEditorLexicalViewer raw={raw} />);

		expect(container.querySelector('[data-text-editor-viewer="ready"]')).not.toBeNull();
		expect(container.querySelector("h2")?.textContent).toBe("heading");
		expect(container.querySelector("blockquote")?.textContent).toBe("quotation");
		expect(container.querySelector("strong")?.textContent).toBe("bold");
		expect(container.querySelector("a")?.getAttribute("aria-label")).toBe("Источник");
		expect(container.querySelector("a")?.getAttribute("rel")).toBe("noopener noreferrer");
		expect(container.querySelector("ol")?.getAttribute("start")).toBe("4");
		expect(container.querySelector("li")?.textContent).toBe("numbered");
	});

	it.each(["link", "accessible-link"])("показывает безопасные HTTP(S) ссылки узла %s", (type) => {
		const raw = createTextEditorViewerRaw([
			createTextEditorViewerElement("paragraph", [
				createTextEditorViewerElement(type, [createTextEditorViewerText("new-tab")], {
					url: "https://example.org/a?b=1&c=2",
					target: "_blank",
					rel: "opener",
					title: null
				}),
				createTextEditorViewerElement(type, [createTextEditorViewerText("same-tab")], {
					url: "http://example.org/",
					target: "_self",
					rel: null,
					title: null
				})
			])
		]);
		const { container } = render(<TextEditorLexicalViewer raw={raw} />);
		const links = container.querySelectorAll("a");

		expect(links).toHaveLength(2);
		expect(links[0]?.getAttribute("href")).toBe("https://example.org/a?b=1&c=2");
		expect(links[0]?.getAttribute("target")).toBe("_blank");
		expect(links[0]?.getAttribute("rel")).toBe("noopener noreferrer");
		expect(links[1]?.getAttribute("href")).toBe("http://example.org/");
		expect(links[1]?.getAttribute("target")).toBe("_self");
	});

	it("сохраняет доступное имя ссылки, не превращая его в HTML", () => {
		const label = '<img src=x onerror="alert(1)">';
		const raw = createTextEditorViewerRaw([
			createTextEditorViewerElement("paragraph", [
				createTextEditorViewerElement("accessible-link", [createTextEditorViewerText("link")], {
					url: "https://example.org",
					target: "_blank",
					rel: null,
					title: null,
					ariaLabel: label,
					qrCode: false,
					add: null,
					text: "link"
				})
			])
		]);
		const { container } = render(<TextEditorLexicalViewer raw={raw} />);

		expect(container.querySelector("a")?.getAttribute("aria-label")).toBe(label);
		expect(container.querySelector("img, [onerror]")).toBeNull();
	});

	it.each([
		{ type: "unknown-node", version: 1 },
		createTextEditorViewerElement("paragraph", [createTextEditorViewerText("inline-css")], { style: "color:red" }),
		createTextEditorViewerElement("paragraph", [
			createTextEditorViewerElement("link", [createTextEditorViewerText("unsafe-link")], {
				url: "javascript:alert(1)",
				target: "_blank",
				rel: null,
				title: null
			})
		])
	])("заменяет документ целиком при неподдержанном узле или опасном URL %#", (invalid) => {
		const raw = createTextEditorViewerRaw([
			createTextEditorViewerElement("paragraph", [createTextEditorViewerText("allowed-prefix")]),
			invalid
		]);
		const { container, rerender } = render(<TextEditorLexicalViewer raw={raw} />);
		const unsupported = container.querySelector('[data-text-editor-viewer="unsupported"]');

		expect(unsupported).not.toBeNull();
		expect(unsupported?.textContent?.length).toBeGreaterThan(0);
		expect(container.textContent).not.toContain("allowed-prefix");
		expect(container.querySelector("a")).toBeNull();

		rerender(<TextEditorLexicalViewer raw={raw} fallback={<span data-viewer-fallback="custom">custom</span>} />);
		expect(container.querySelector('[data-viewer-fallback="custom"]')?.textContent).toBe("custom");
		rerender(<TextEditorLexicalViewer raw={raw} fallback={null} />);
		expect(container.querySelector('[data-text-editor-viewer="unsupported"]')?.textContent).toBe("");
	});

	it("немедленно применяет новый immutable raw и восстанавливается после unsupported документа", () => {
		const first = createTextEditorViewerRaw([createTextEditorViewerElement("paragraph", [createTextEditorViewerText("first")])]);
		const second = createTextEditorViewerRaw([createTextEditorViewerElement("paragraph", [createTextEditorViewerText("second")])]);
		const unsupported = createTextEditorViewerRaw([{ type: "unsupported", version: 1 }]);
		const { container, rerender } = render(<TextEditorLexicalViewer raw={first} />);
		expect(container.querySelector('[data-text-editor-viewer="ready"]')?.textContent).toBe("first");

		rerender(<TextEditorLexicalViewer raw={second} />);
		expect(container.querySelector('[data-text-editor-viewer="ready"]')?.textContent).toBe("second");
		rerender(<TextEditorLexicalViewer raw={unsupported} fallback={null} />);
		expect(container.querySelector('[data-text-editor-viewer="ready"]')).toBeNull();
		rerender(<TextEditorLexicalViewer raw={first} />);
		expect(container.querySelector('[data-text-editor-viewer="ready"]')?.textContent).toBe("first");
	});

	it("гидратирует серверное дерево без замены содержимого и mismatch", async () => {
		const raw = createTextEditorViewerRaw([
			createTextEditorViewerElement("paragraph", [createTextEditorViewerText("SSR & browser", IS_BOLD | IS_ITALIC)])
		]);
		const element = <TextEditorLexicalViewer raw={raw} />;
		const container = document.createElement("div");
		container.innerHTML = renderToString(element);
		document.body.append(container);
		const existingContent = container.querySelector("strong");
		const onRecoverableError = vi.fn();
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
		const root = hydrateRoot(container, element, { onRecoverableError });

		try {
			await act(async () => undefined);
			expect(container.querySelector("strong")).toBe(existingContent);
			expect(container.querySelector('[data-text-editor-viewer="ready"]')?.textContent).toBe("SSR & browser");
			expect(onRecoverableError).not.toHaveBeenCalled();
			expect(consoleError).not.toHaveBeenCalled();
		} finally {
			await act(async () => root.unmount());
			consoleError.mockRestore();
			container.remove();
		}
	});
});
