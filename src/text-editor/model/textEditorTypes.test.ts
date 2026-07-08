import { describe, expect, it } from "vitest";

import { DEFAULT_TOOLBAR_STATE } from "./textEditorTypes";

describe("DEFAULT_TOOLBAR_STATE", () => {
	it("содержит ожидаемый baseline для toolbar", () => {
		expect(DEFAULT_TOOLBAR_STATE.blockType).toBe("unstyled");
		expect(DEFAULT_TOOLBAR_STATE.isTextUnselected).toBe(true);
		expect(DEFAULT_TOOLBAR_STATE.activeAlignment).toBeNull();
		expect(DEFAULT_TOOLBAR_STATE.activeInlineStyles).toEqual({
			BOLD: false,
			ITALIC: false,
			UNDERLINE: false,
			STRIKETHROUGH: false,
			HIGHLIGHT: false,
			CODE: false
		});
	});
});
