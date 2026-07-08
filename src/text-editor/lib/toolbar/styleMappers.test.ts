import { describe, expect, it } from "vitest";

import { getHeadingBlockType, getHeadingTagByStyle, getLexicalInlineStyle } from "./styleMappers";

describe("styleMappers", () => {
	it("корректно маппит heading tag в block style", () => {
		expect(getHeadingBlockType("h3")).toBe("header-three");
		expect(getHeadingBlockType("h4")).toBe("header-four");
		expect(getHeadingBlockType("h5")).toBe("header-five");
		expect(getHeadingBlockType("h6")).toBe("header-six");
		expect(getHeadingBlockType("h1")).toBe("unstyled");
	});

	it("корректно маппит block style в heading tag", () => {
		expect(getHeadingTagByStyle("header-three")).toBe("h3");
		expect(getHeadingTagByStyle("header-four")).toBe("h4");
		expect(getHeadingTagByStyle("header-five")).toBe("h5");
		expect(getHeadingTagByStyle("header-six")).toBe("h6");
		expect(getHeadingTagByStyle("unstyled")).toBeNull();
	});

	it("корректно маппит inline style в lexical format", () => {
		expect(getLexicalInlineStyle("BOLD")).toBe("bold");
		expect(getLexicalInlineStyle("ITALIC")).toBe("italic");
		expect(getLexicalInlineStyle("UNDERLINE")).toBe("underline");
		expect(getLexicalInlineStyle("STRIKETHROUGH")).toBe("strikethrough");
		expect(getLexicalInlineStyle("HIGHLIGHT")).toBe("highlight");
		expect(getLexicalInlineStyle("CODE")).toBe("code");
		expect(getLexicalInlineStyle("UNKNOWN")).toBeNull();
	});
});
