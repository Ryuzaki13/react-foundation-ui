import { cloneElement, createRef } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FloatingPopover } from "./FloatingPopover";
import { FloatingPopoverModalFixture } from "./test-fixtures/FloatingPopoverModalFixture";
import { FloatingPopoverTriggerFixture } from "./test-fixtures/FloatingPopoverTrigger.fixture.test";

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
	document.getElementById("modal-root")?.remove();
});

describe("FloatingPopover", () => {
	it.each([false, true])(
		"открывает hover-подсказку при фокусе с клавиатуры и закрывает после ухода фокуса (asChild=%s)",
		async (asChild) => {
			const user = userEvent.setup();

			render(
				<>
					<FloatingPopover asChild={asChild} tooltip content={<span data-testid="popover-content" />}>
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
		}
	);

	it.each([false, true])("игнорирует совместимый mouseenter от touch, сохраняя действие trigger (asChild=%s)", async (asChild) => {
		const user = userEvent.setup();
		const onClick = vi.fn();
		render(
			<FloatingPopover asChild={asChild} tooltip content={<span />} openDelay={0}>
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

	it.each([false, true])("закрывает открытую подсказку при активации и допускает новое наведение (asChild=%s)", async (asChild) => {
		const user = userEvent.setup();
		const onClick = vi.fn();
		render(
			<FloatingPopover asChild={asChild} tooltip content={<span />} openDelay={0} closeDelay={0}>
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

	it.each([false, true])("отменяет отложенное hover-открытие при нажатии до окончания openDelay (asChild=%s)", (asChild) => {
		vi.useFakeTimers();
		render(
			<FloatingPopover asChild={asChild} tooltip content={<span />} openDelay={200}>
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

	it("сохраняет произвольное содержимое и обёртку без asChild", async () => {
		const user = userEvent.setup();
		const { container } = render(
			<FloatingPopover tooltip content={<span />} openDelay={0}>
				Текст
				<span data-testid="wrapped-child" />
			</FloatingPopover>
		);
		const wrapper = screen.getByTestId("wrapped-child").parentElement;
		expect(wrapper).toBe(container.firstElementChild);
		expect(wrapper?.tagName).toBe("SPAN");
		await user.hover(screen.getByTestId("wrapped-child"));
		expect(await screen.findByRole("tooltip")).toBeInstanceOf(HTMLElement);
	});

	it("передаёт object ref и объединяет события пользовательского trigger с подсказкой", async () => {
		const user = userEvent.setup();
		const triggerRef = createRef<HTMLButtonElement>();
		const onClick = vi.fn();
		const onFocus = vi.fn();
		const onBlur = vi.fn();
		const onPointerDown = vi.fn();
		const { container, unmount } = render(
			<>
				<FloatingPopover asChild tooltip content={<span />}>
					<FloatingPopoverTriggerFixture
						ref={triggerRef}
						onClick={onClick}
						onFocus={onFocus}
						onBlur={onBlur}
						onPointerDown={onPointerDown}
					/>
				</FloatingPopover>
				<button type="button" data-testid="next-focus-target" />
			</>
		);
		const trigger = screen.getByTestId("custom-trigger");
		// Прямой DOM-элемент — контракт asChild, необходимый для участия в Grid/Flex.
		expect(trigger.parentElement).toBe(container);
		expect(triggerRef.current).toBe(trigger);

		await user.tab();
		expect(onFocus).toHaveBeenCalledTimes(1);
		const tooltip = screen.getByRole("tooltip");
		expect(trigger.getAttribute("aria-describedby")).toBe(tooltip.id);

		await user.click(trigger);
		expect(onClick).toHaveBeenCalledTimes(1);
		expect(onPointerDown).toHaveBeenCalledTimes(1);
		expect(screen.queryByRole("tooltip")).toBeNull();
		await user.tab();
		expect(onBlur).toHaveBeenCalledTimes(1);
		unmount();
		expect(triggerRef.current).toBeNull();
	});

	it("сохраняет React 19 cleanup callback ref при замене ref и размонтировании", () => {
		const firstCleanup = vi.fn();
		const secondCleanup = vi.fn();
		const firstRef = vi.fn((node: HTMLButtonElement | null) => {
			if (node) return firstCleanup;
		});
		const secondRef = vi.fn((node: HTMLButtonElement | null) => {
			if (node) return secondCleanup;
		});
		const { rerender, unmount } = render(
			<FloatingPopover asChild tooltip content={<span />}>
				<button type="button" ref={firstRef} />
			</FloatingPopover>
		);
		const trigger = screen.getByRole("button");
		expect(firstRef).toHaveBeenCalledExactlyOnceWith(trigger);
		expect(firstCleanup).not.toHaveBeenCalled();

		rerender(
			<FloatingPopover asChild tooltip content={<span />}>
				<button type="button" ref={secondRef} />
			</FloatingPopover>
		);
		expect(firstCleanup).toHaveBeenCalledTimes(1);
		expect(firstRef).not.toHaveBeenCalledWith(null);
		expect(secondRef).toHaveBeenCalledExactlyOnceWith(trigger);
		unmount();
		expect(firstCleanup).toHaveBeenCalledTimes(1);
		expect(secondCleanup).toHaveBeenCalledTimes(1);
		expect(secondRef).not.toHaveBeenCalledWith(null);
	});

	it("сохраняет callback ref без cleanup и очищает его после размонтирования", () => {
		const triggerRef = vi.fn<(node: HTMLButtonElement | null) => void>();
		const { unmount } = render(
			<FloatingPopover asChild tooltip content={<span />}>
				<button type="button" ref={triggerRef} />
			</FloatingPopover>
		);
		expect(triggerRef).toHaveBeenCalledExactlyOnceWith(screen.getByRole("button"));
		unmount();
		expect(triggerRef).toHaveBeenLastCalledWith(null);
		expect(triggerRef).toHaveBeenCalledTimes(2);
	});

	it("добавляет tooltip к пользовательским описаниям на самом trigger и удаляет только свой ID", async () => {
		const user = userEvent.setup();
		render(
			<>
				<span id="trigger-help" />
				<span id="trigger-detail" />
				<FloatingPopover asChild tooltip content={<span />}>
					<button type="button" aria-describedby="trigger-help trigger-detail" />
				</FloatingPopover>
			</>
		);
		const trigger = screen.getByRole("button");
		expect(trigger.getAttribute("aria-describedby")).toBe("trigger-help trigger-detail");
		await user.tab();
		const tooltip = screen.getByRole("tooltip");
		expect(trigger.getAttribute("aria-describedby")?.split(/\s+/)).toEqual(["trigger-help", "trigger-detail", tooltip.id]);
		expect(trigger.hasAttribute("aria-expanded")).toBe(false);
		expect(trigger.hasAttribute("aria-haspopup")).toBe(false);
		await user.keyboard("{Escape}");
		expect(screen.queryByRole("tooltip")).toBeNull();
		expect(trigger.getAttribute("aria-describedby")).toBe("trigger-help trigger-detail");
	});

	it.each([
		["текст", "Trigger"],
		["несколько элементов", [<button type="button" key="one" />, <button type="button" key="two" />]],
		[
			"Fragment",
			<>
				<button type="button" />
			</>
		]
	])("отклоняет %s вместо единственного trigger в режиме asChild", (_name, children) => {
		// cloneElement способен заменить children после TypeScript-проверки props.
		// Runtime-граница обязана отклонить такую неподдерживаемую композицию.
		const popover = cloneElement(
			<FloatingPopover asChild tooltip content={<span />}>
				<button type="button" />
			</FloatingPopover>,
			undefined,
			children
		);
		expect(() => render(popover)).toThrow(/asChild/);
	});
});
