import { act } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FlexCenter } from "./FlexCenter";
import { FlexContainer } from "./FlexContainer";
import { FlexItem } from "./FlexItem";
import { FlexSpacer } from "./FlexSpacer";
import { PredefinedFlex } from "./PredefinedFlex";

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("flex accessibility props", () => {
	it("прокидывает стандартные HTML и ARIA атрибуты, не передавая layout-пропсы в DOM", () => {
		const onClick = vi.fn();

		render(
			<>
				<FlexContainer
					as="section"
					id="flex-container"
					role="region"
					aria-label="Flex region"
					tabIndex={0}
					data-testid="flex-container"
					onClick={onClick}
					row>
					Содержимое
				</FlexContainer>
				<FlexItem as="article" role="article" aria-label="Flex item" data-testid="flex-item" grow>
					Элемент
				</FlexItem>
				<PredefinedFlex role="group" aria-label="Predefined flex" data-testid="predefined-flex">
					Группа
				</PredefinedFlex>
				<FlexCenter role="status" aria-live="polite" data-testid="flex-center">
					Статус
				</FlexCenter>
				<FlexSpacer role="presentation" aria-hidden="true" data-testid="flex-spacer" />
			</>
		);

		const container = screen.getByTestId("flex-container");

		expect(container.tagName).toBe("SECTION");
		expect(container.id).toBe("flex-container");
		expect(container.getAttribute("role")).toBe("region");
		expect(container.getAttribute("aria-label")).toBe("Flex region");
		expect(container.getAttribute("tabindex")).toBe("0");
		expect(container.hasAttribute("row")).toBe(false);

		fireEvent.click(container);
		expect(onClick).toHaveBeenCalledOnce();

		expect(screen.getByTestId("flex-item").getAttribute("aria-label")).toBe("Flex item");
		expect(screen.getByTestId("flex-item").hasAttribute("grow")).toBe(false);
		expect(screen.getByTestId("predefined-flex").getAttribute("role")).toBe("group");
		expect(screen.getByTestId("flex-center").getAttribute("aria-live")).toBe("polite");
		expect(screen.getByTestId("flex-spacer").getAttribute("aria-hidden")).toBe("true");
		expect(screen.getByTestId("flex-spacer").hasAttribute("flex1")).toBe(false);
	});
});

describe("flex SSR", () => {
	it("формирует responsive-классы без чтения viewport", () => {
		const matchMedia = vi.fn(() => {
			throw new Error("matchMedia не должен вызываться при render");
		});
		vi.stubGlobal("matchMedia", matchMedia);

		const markup = renderToString(
			<FlexContainer
				column={{ mobile: true, tablet: false }}
				row={{ mobile: false, tablet: true }}
				gap={{ mobile: "sm", tablet: "lg" }}>
				<FlexItem flex1={{ mobile: true, tablet: false }} alignSelf={{ mobile: "stretch", tablet: "center" }}>
					Элемент
				</FlexItem>
			</FlexContainer>
		);

		expect(matchMedia).not.toHaveBeenCalled();
		expect(markup).toContain("columnMobile");
		expect(markup).toContain("rowTablet");
		expect(markup).toContain("rowLaptop");
		expect(markup).toContain("gapSmMobile");
		expect(markup).toContain("gapLgTablet");
		expect(markup).toContain("flex1Mobile");
		expect(markup).toContain("alignSelfCenterLaptop");
	});

	it("гидратирует тот же responsive markup без рассинхронизации", async () => {
		const element = <FlexContainer column={{ mobile: true, tablet: false }}>Содержимое</FlexContainer>;
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
