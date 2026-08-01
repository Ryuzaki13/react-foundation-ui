// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InteractiveComponents } from "./InteractiveComponents.stories";

Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
	configurable: true,
	value: () => undefined
});

describe("InteractiveComponents story", () => {
	it("renders the complete controls grid", () => {
		render(<InteractiveComponents />);

		for (const cardTitle of ["Button", "ContextMenu", "PresetRangeDateInput"]) {
			expect(screen.getByText(cardTitle)).toBeTruthy();
		}
	});
});
