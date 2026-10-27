// @vitest-environment node

import { createRef } from "react";

import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { TextEditorLexical, type TextEditorFocusHandle } from "./index";

describe("imperative focus и SSR", () => {
	it("не создаёт DOM редактора, callback или handle при серверном render", () => {
		expect(typeof window).toBe("undefined");
		expect(typeof document).toBe("undefined");
		const ref = createRef<TextEditorFocusHandle>();
		const onChange = vi.fn();
		const html = renderToString(
			<TextEditorLexical ref={ref} initialData={{ html: "<p>Документ</p>", raw: null }} onChange={onChange} />
		);
		expect(ref.current).toBeNull();
		expect(onChange).not.toHaveBeenCalled();
		expect(html).not.toContain("contenteditable");
	});
});
