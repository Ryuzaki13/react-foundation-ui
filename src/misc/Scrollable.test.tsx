import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Scrollable } from "./Scrollable";

describe("Scrollable accessibility", () => {
	it("прокидывает стандартные HTML и ARIA-атрибуты на область прокрутки", () => {
		const onKeyDown = vi.fn();

		render(
			<Scrollable
				id="event-log"
				role="region"
				aria-label="Журнал событий"
				tabIndex={0}
				data-testid="scrollable"
				onKeyDown={onKeyDown}
				height={120}
				stable
				overscroll>
				Содержимое
			</Scrollable>
		);

		const scrollable = screen.getByTestId("scrollable");
		expect(scrollable.id).toBe("event-log");
		expect(scrollable.getAttribute("role")).toBe("region");
		expect(scrollable.getAttribute("aria-label")).toBe("Журнал событий");
		expect(scrollable.getAttribute("tabindex")).toBe("0");
		expect(scrollable.style.height).toBe("120px");
		expect(scrollable.classList.contains("scrollable")).toBe(true);
		expect(scrollable.classList.contains("stable")).toBe(true);
		expect(scrollable.classList.contains("overscroll")).toBe(true);
		expect(scrollable.hasAttribute("height")).toBe(false);
		expect(scrollable.hasAttribute("stable")).toBe(false);
		expect(scrollable.hasAttribute("overscroll")).toBe(false);

		fireEvent.keyDown(scrollable, { key: "PageDown" });
		expect(onKeyDown).toHaveBeenCalledOnce();
	});

	it("сохраняет нейтральную семантику и порядок фокуса по умолчанию", () => {
		render(<Scrollable data-testid="scrollable">Содержимое</Scrollable>);

		const scrollable = screen.getByTestId("scrollable");
		expect(scrollable.getAttribute("role")).toBeNull();
		expect(scrollable.getAttribute("tabindex")).toBeNull();
		expect(scrollable.getAttribute("aria-label")).toBeNull();
	});
});
