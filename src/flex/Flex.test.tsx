import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FlexCenter } from "./FlexCenter";
import { FlexContainer } from "./FlexContainer";
import { FlexItem } from "./FlexItem";
import { FlexSpacer } from "./FlexSpacer";
import { PredefinedFlex } from "./PredefinedFlex";

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
