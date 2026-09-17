// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Separator } from "./Separator";

describe("Separator", () => {
	it("объявляет ориентацию семантического разделителя", () => {
		const { rerender } = render(<Separator />);

		expect(screen.getByRole("separator").getAttribute("aria-orientation")).toBe("horizontal");

		rerender(<Separator orientation="vertical" />);
		expect(screen.getByRole("separator").getAttribute("aria-orientation")).toBe("vertical");
	});

	it("не оставляет separator-ARIA при явной декоративной роли", () => {
		const { container } = render(<Separator role="presentation" orientation="vertical" />);
		const separator = container.firstElementChild;

		expect(separator?.getAttribute("role")).toBe("presentation");
		expect(separator?.hasAttribute("aria-orientation")).toBe(false);
	});
});
