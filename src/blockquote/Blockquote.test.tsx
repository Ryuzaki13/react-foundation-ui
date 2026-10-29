import { createRef } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Blockquote } from "./index";

describe("Blockquote", () => {
	it("сохраняет нативную семантику цитаты, источник и доступ к DOM через ref", () => {
		const ref = createRef<HTMLQuoteElement>();
		const source = "https://example.com/source";

		render(
			<Blockquote ref={ref} cite={source} aria-describedby="source">
				<p>Содержимое цитаты</p>
			</Blockquote>
		);

		const quote = screen.getByRole("blockquote");

		expect(ref.current).toBe(quote);
		expect(quote.getAttribute("cite")).toBe(source);
		expect(quote.getAttribute("aria-describedby")).toBe("source");
		expect(quote.getAttribute("role")).toBeNull();
		expect(quote.getAttribute("aria-live")).toBeNull();
	});

	it("позволяет потребителю задать озвучивание и обработчик на самой цитате", () => {
		const onClick = vi.fn();

		render(
			<Blockquote tone="success" role="status" aria-live="polite" aria-atomic onClick={onClick}>
				Изменения сохранены
			</Blockquote>
		);

		const quote = screen.getByRole("status");

		fireEvent.click(quote);

		expect(quote.getAttribute("aria-live")).toBe("polite");
		expect(quote.getAttribute("aria-atomic")).toBe("true");
		expect(onClick).toHaveBeenCalledOnce();
	});
});
