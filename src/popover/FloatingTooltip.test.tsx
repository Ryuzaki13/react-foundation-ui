// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FloatingTooltip } from "./FloatingTooltip";

describe("FloatingTooltip", () => {
	it("объявляет координатную подсказку через роль tooltip", () => {
		render(
			<FloatingTooltip x={20} y={30}>
				Подсказка
			</FloatingTooltip>
		);

		expect(screen.getByRole("tooltip").textContent).toContain("Подсказка");
	});
});
