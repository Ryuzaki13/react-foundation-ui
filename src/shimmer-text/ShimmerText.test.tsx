import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ShimmerText } from "./ShimmerText";

describe("ShimmerText", () => {
	it("сохраняет текст и нативные атрибуты span в SSR-разметке", () => {
		const markup = renderToStaticMarkup(
			<ShimmerText id="loading-status" aria-live="polite" className="consumer-class">
				Подготавливаем рабочую область
			</ShimmerText>
		);

		expect(markup).toContain("Подготавливаем рабочую область");
		expect(markup).toContain('id="loading-status"');
		expect(markup).toContain('aria-live="polite"');
		expect(markup).toContain("consumer-class");
	});
});
