import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GridContainer } from "./GridContainer";
import { GridItem } from "./GridItem";

vi.mock("@ryuzaki13/react-foundation-lib/media", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@ryuzaki13/react-foundation-lib/media")>();

	return {
		...actual,
		useMatchMedia: () => ({
			activeBreakpoint: "laptop",
			matches: { mobile: false, tablet: false, laptop: true }
		})
	};
});

describe("grid accessibility props", () => {
	it("прокидывает стандартные HTML и ARIA атрибуты, не передавая layout-пропсы в DOM", () => {
		const onKeyDown = vi.fn();

		render(
			<GridContainer
				as="main"
				id="grid-container"
				role="main"
				aria-label="Grid region"
				tabIndex={-1}
				data-testid="grid-container"
				onKeyDown={onKeyDown}
				templateColumns="1fr 1fr">
				<GridItem as="article" role="article" aria-labelledby="grid-item-title" data-testid="grid-item" column="1 / 3">
					<span id="grid-item-title">Элемент</span>
				</GridItem>
			</GridContainer>
		);

		const container = screen.getByTestId("grid-container");
		const item = screen.getByTestId("grid-item");

		expect(container.tagName).toBe("MAIN");
		expect(container.id).toBe("grid-container");
		expect(container.getAttribute("role")).toBe("main");
		expect(container.getAttribute("aria-label")).toBe("Grid region");
		expect(container.getAttribute("tabindex")).toBe("-1");
		expect(container.hasAttribute("templatecolumns")).toBe(false);

		fireEvent.keyDown(container, { key: "Enter" });
		expect(onKeyDown).toHaveBeenCalledOnce();

		expect(item.tagName).toBe("ARTICLE");
		expect(item.getAttribute("role")).toBe("article");
		expect(item.getAttribute("aria-labelledby")).toBe("grid-item-title");
		expect(item.hasAttribute("column")).toBe(false);
	});
});
