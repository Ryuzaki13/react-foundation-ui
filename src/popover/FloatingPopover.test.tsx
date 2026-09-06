import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FloatingPopover } from "./FloatingPopover";

describe("FloatingPopover", () => {
	it("открывает hover-подсказку при фокусе с клавиатуры и закрывает после ухода фокуса", async () => {
		const user = userEvent.setup();

		render(
			<>
				<FloatingPopover tooltip content={<span data-testid="popover-content" />}>
					<button data-testid="trigger" />
				</FloatingPopover>
				<button data-testid="next-focus-target" />
			</>
		);

		await user.tab();

		expect(document.activeElement).toBe(screen.getByTestId("trigger"));
		expect(screen.getByTestId("popover-content").closest('[role="tooltip"]')).not.toBeNull();

		await user.tab();

		expect(document.activeElement).toBe(screen.getByTestId("next-focus-target"));
		expect(screen.queryByRole("tooltip")).toBeNull();
	});
});
