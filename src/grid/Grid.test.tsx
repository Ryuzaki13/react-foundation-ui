import { act } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GridContainer } from "./GridContainer";
import { GridItem } from "./GridItem";

afterEach(() => {
	vi.unstubAllGlobals();
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

describe("grid SSR", () => {
	it("передаёт в SSR markup все responsive CSS-значения без чтения viewport", () => {
		const matchMedia = vi.fn(() => {
			throw new Error("matchMedia не должен вызываться при render");
		});
		vi.stubGlobal("matchMedia", matchMedia);

		const markup = renderToString(
			<GridContainer
				templateColumns={{ mobile: "1fr", tablet: "repeat(2, 1fr)", laptop: "repeat(3, 1fr)" }}
				areas={{ mobile: '"header" "main"', tablet: '"header header" "main main"' }}
				gap={{ mobile: "sm", tablet: "lg" }}>
				<GridItem area={{ mobile: "header", tablet: "main" }} column={{ mobile: "1", tablet: "1 / 3" }}>
					Элемент
				</GridItem>
			</GridContainer>
		);

		expect(matchMedia).not.toHaveBeenCalled();
		expect(markup).toContain("responsiveTemplateColumns");
		expect(markup).toContain("--foundation-grid-template-columns-mobile:1fr");
		expect(markup).toContain("--foundation-grid-template-columns-tablet:repeat(2, 1fr)");
		expect(markup).toContain("--foundation-grid-template-columns-laptop:repeat(3, 1fr)");
		expect(markup).toContain("gapSmMobile");
		expect(markup).toContain("gapLgTablet");
		expect(markup).toContain("responsiveArea");
		expect(markup).toContain("--foundation-grid-column-laptop:1 / 3");
	});

	it("гидратирует responsive template и placement без рассинхронизации", async () => {
		const element = (
			<GridContainer templateColumns={{ mobile: "1fr", tablet: "1fr 1fr" }}>
				<GridItem column={{ mobile: "1", tablet: "1 / 3" }}>Содержимое</GridItem>
			</GridContainer>
		);
		const container = document.createElement("div");
		container.innerHTML = renderToString(element);
		document.body.append(container);
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

		const root = hydrateRoot(container, element);
		await act(async () => undefined);

		expect(consoleError).not.toHaveBeenCalled();
		await act(async () => root.unmount());
		consoleError.mockRestore();
		container.remove();
	});
});
