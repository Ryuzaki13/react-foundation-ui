import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Popover } from "./components/Popover";

describe("Popover", () => {
	it("связывает trigger с немодальным содержимым и возвращает фокус после закрытия", async () => {
		const user = userEvent.setup();

		render(
			<Popover>
				<Popover.Trigger>
					<button type="button">Открыть</button>
				</Popover.Trigger>
				<Popover.Content>
					<button type="button">Действие</button>
				</Popover.Content>
			</Popover>
		);

		const trigger = screen.getByRole("button", { name: "Открыть" });
		expect(trigger.getAttribute("aria-expanded")).toBe("false");

		await user.click(trigger);

		const contentId = trigger.getAttribute("aria-controls");
		const content = contentId ? document.getElementById(contentId) : null;
		expect(content).not.toBeNull();
		expect(content?.hasAttribute("role")).toBe(false);
		expect(content?.hasAttribute("aria-modal")).toBe(false);
		expect(trigger.getAttribute("aria-expanded")).toBe("true");
		await waitFor(() => expect(document.activeElement).toBe(content));

		await user.keyboard("{Escape}");
		await waitFor(() => expect(document.getElementById(contentId ?? "")).toBeNull());
		expect(document.activeElement).toBe(trigger);
	});

	it("передаёт явную немодальную dialog-семантику и доступное имя", async () => {
		const user = userEvent.setup();

		render(
			<Popover>
				<Popover.Trigger>
					<button type="button">Настройки</button>
				</Popover.Trigger>
				<Popover.Content role="dialog" aria-label="Настройки отображения">
					Содержимое
				</Popover.Content>
			</Popover>
		);

		await user.click(screen.getByRole("button", { name: "Настройки" }));

		const dialog = screen.getByRole("dialog", { name: "Настройки отображения" });
		expect(dialog.hasAttribute("aria-modal")).toBe(false);
	});
});
