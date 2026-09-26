// @vitest-environment node

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
	createTextEditorViewerElement,
	createTextEditorViewerRaw,
	createTextEditorViewerText
} from "../test/text-editor/textEditorViewerFixtures";

import { TextEditorLexicalViewer } from "./TextEditorLexicalViewer";

describe("TextEditorLexicalViewer SSR без DOM", () => {
	it("отдаёт реальное содержимое без window, document и editor bootstrap", () => {
		expect(typeof window).toBe("undefined");
		expect(typeof document).toBe("undefined");
		const raw = createTextEditorViewerRaw([
			createTextEditorViewerElement("paragraph", [createTextEditorViewerText("<script>текст</script> & SSR", 1)])
		]);
		const html = renderToString(<TextEditorLexicalViewer raw={raw} />);

		// Наличие semantic content и escaping — самостоятельный SSR contract, не snapshot layout.
		expect(html).toContain('data-text-editor-viewer="ready"');
		expect(html).toContain("<strong>");
		expect(html).toContain("&lt;script&gt;текст&lt;/script&gt; &amp; SSR");
		expect(html).not.toContain("<script>");
		expect(html).not.toContain("contenteditable");
		expect(html).not.toContain('role="textbox"');
	});

	it("даёт то же безопасное fallback-состояние неподдержанному документу", () => {
		const raw = createTextEditorViewerRaw([{ type: "image", version: 1, src: "https://example.org/private.png" }]);
		const html = renderToString(<TextEditorLexicalViewer raw={raw} fallback={<span data-viewer-fallback="server" />} />);
		const empty = renderToString(<TextEditorLexicalViewer raw={raw} fallback={null} />);

		expect(html).toContain('data-text-editor-viewer="unsupported"');
		expect(html).toContain('data-viewer-fallback="server"');
		expect(html).not.toContain("<img");
		expect(html).not.toContain("private.png");
		expect(empty).toContain('data-text-editor-viewer="unsupported"');
		expect(empty).not.toContain("<span");
	});
});
