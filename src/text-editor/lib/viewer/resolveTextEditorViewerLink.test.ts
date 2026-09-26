import { describe, expect, it } from "vitest";

import { resolveTextEditorViewerLink } from "./resolveTextEditorViewerLink";

describe("безопасный URL viewer", () => {
	it("канонизирует абсолютный HTTP(S), не вводя предметный запрет localhost", () => {
		expect(resolveTextEditorViewerLink("HTTPS://EXAMPLE.ORG/путь?q=1#часть")).toBe(
			"https://example.org/%D0%BF%D1%83%D1%82%D1%8C?q=1#%D1%87%D0%B0%D1%81%D1%82%D1%8C"
		);
		expect(resolveTextEditorViewerLink("http://localhost:6006/example")).toBe("http://localhost:6006/example");
	});

	it.each([
		null,
		undefined,
		{},
		"",
		"https://user:password@example.org/",
		"https://user@example.org/",
		"javascript:alert(1)",
		"data:text/html,<script>alert(1)</script>",
		"mailto:user@example.org",
		"tel:+123456789",
		"/relative",
		"//example.org/path",
		"#fragment",
		"https://",
		" https://example.org",
		"https://example.org/with space",
		"https://example.org/\n",
		"java\tscript:alert(1)",
		"https://example.org/\u0000",
		"https://example.org/\u007f"
	])("не создаёт navigable URL из %j", (input) => {
		expect(resolveTextEditorViewerLink(input)).toBeNull();
	});
});
