import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FloatingPopover } from "./FloatingPopover";
import { FloatingPopoverModalFixture } from "./test-fixtures/FloatingPopoverModalFixture";

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
	document.getElementById("modal-root")?.remove();
});

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
		const tooltip = screen.getByRole("tooltip");
		const reference = screen.getByTestId("trigger").closest("[aria-describedby]");
		expect(reference).not.toBeNull();
		expect(reference?.getAttribute("aria-describedby")).toBe(tooltip.id);
		expect(reference?.hasAttribute("aria-expanded")).toBe(false);
		expect(reference?.hasAttribute("aria-haspopup")).toBe(false);

		await user.tab();

		expect(document.activeElement).toBe(screen.getByTestId("next-focus-target"));
		expect(screen.queryByRole("tooltip")).toBeNull();
	});

	it("игнорирует совместимый mouseenter от touch, сохраняя действие trigger", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();
		render(
			<FloatingPopover tooltip content={<span />} openDelay={0}>
				<button data-testid="trigger" onClick={onClick} />
			</FloatingPopover>
		);
		const trigger = screen.getByTestId("trigger");

		await user.pointer({ keys: "[TouchA>]", target: trigger });
		// Мобильный браузер может послать mouse-событие после touch-события.
		// Доставляем событие reference без зависимости от расположения wrapper.
		fireEvent.mouseEnter(trigger, { bubbles: true });
		expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();
		await user.pointer({ keys: "[/TouchA]" });
		expect(onClick).toHaveBeenCalledTimes(1);
		expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();

		// На устройстве с несколькими способами ввода настоящая мышь продолжает работать.
		await user.unhover(trigger);
		await user.hover(trigger);
		expect(await screen.findByRole("tooltip")).toBeInstanceOf(HTMLElement);
	});

	it("закрывает открытую подсказку при активации и допускает новое наведение", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();
		render(
			<FloatingPopover tooltip content={<span />} openDelay={0} closeDelay={0}>
				<button data-testid="trigger" onClick={onClick} />
			</FloatingPopover>
		);
		const trigger = screen.getByTestId("trigger");
		await user.hover(trigger);
		expect(await screen.findByRole("tooltip")).toBeInstanceOf(HTMLElement);

		await user.click(trigger);
		expect(onClick).toHaveBeenCalledTimes(1);
		expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();

		await user.unhover(trigger);
		await user.hover(trigger);
		expect(await screen.findByRole("tooltip")).toBeInstanceOf(HTMLElement);
	});

	it("отменяет отложенное hover-открытие при нажатии до окончания openDelay", () => {
		vi.useFakeTimers();
		render(
			<FloatingPopover tooltip content={<span />} openDelay={200}>
				<button data-testid="trigger" />
			</FloatingPopover>
		);
		const trigger = screen.getByTestId("trigger");
		fireEvent.mouseEnter(trigger, { bubbles: true });
		expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();

		fireEvent.click(trigger);
		act(() => {
			vi.advanceTimersByTime(200);
		});
		expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();
	});

	it.each(["{Escape}", "{Enter}", " "])("закрывает tooltip с клавиатуры по %s", async (key) => {
		const user = userEvent.setup();
		const onClick = vi.fn();
		render(
			<FloatingPopover tooltip content={<span />}>
				<button onClick={onClick} />
			</FloatingPopover>
		);
		await user.tab();
		expect(screen.getByRole("tooltip")).toBeInstanceOf(HTMLElement);

		await user.keyboard(key);
		expect(onClick).toHaveBeenCalledTimes(key === "{Escape}" ? 0 : 1);
		expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();
	});

	it("сохраняет открытое содержимое при нажатии на trigger вне режима tooltip", async () => {
		const user = userEvent.setup();
		render(
			<FloatingPopover content={<span />} openDelay={0}>
				<button data-testid="trigger" />
			</FloatingPopover>
		);
		const trigger = screen.getByTestId("trigger");
		await user.hover(trigger);
		const panel = await screen.findByRole("tooltip");

		await user.click(trigger);
		expect(screen.getByRole("tooltip")).toBe(panel);
	});

	it("не оставляет Button.title поверх Modal после touch-активации", async () => {
		vi.stubGlobal("scrollTo", vi.fn());
		const user = userEvent.setup();
		render(<FloatingPopoverModalFixture />);
		const trigger = screen.getByTestId("modal-trigger");

		await user.pointer({ keys: "[TouchA>]", target: trigger });
		fireEvent.mouseEnter(trigger, { bubbles: true });
		await user.pointer({ keys: "[/TouchA]" });
		const dialog = await screen.findByRole("dialog");
		expect(dialog.contains(document.activeElement)).toBe(true);
		expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();
	});
});
