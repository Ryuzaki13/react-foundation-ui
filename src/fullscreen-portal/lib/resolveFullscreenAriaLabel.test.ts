import { describe, expect, it } from "vitest";

import { resolveFullscreenAriaLabel } from "./resolveFullscreenAriaLabel";

describe("доступное имя fullscreen", () => {
	it("объединяет непустой заголовок и описание", () => {
		expect(resolveFullscreenAriaLabel("  Панель  ", "Описание")).toBe("Панель. Описание");
	});
	it("использует описание без пустого заголовка", () => {
		expect(resolveFullscreenAriaLabel("  ", "Описание")).toBe("Описание");
	});
});
