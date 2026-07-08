import { describe, expect, it } from "vitest";

import { isLexicalTextRaw } from "./editorModel";

describe("isLexicalTextRaw", () => {
	it("возвращает true для корректного lexical raw", () => {
		const raw = {
			format: "lexical",
			version: 1,
			editorState: {
				root: {
					type: "root",
					children: []
				}
			}
		};

		expect(isLexicalTextRaw(raw)).toBe(true);
	});

	it("возвращает false для некорректных значений", () => {
		expect(isLexicalTextRaw(null)).toBe(false);
		expect(isLexicalTextRaw({})).toBe(false);
		expect(isLexicalTextRaw({ format: "draft", version: 1, editorState: {} })).toBe(false);
		expect(isLexicalTextRaw({ format: "lexical", version: 2, editorState: {} })).toBe(false);
		expect(isLexicalTextRaw({ format: "lexical", version: 1, editorState: null })).toBe(false);
	});
});
