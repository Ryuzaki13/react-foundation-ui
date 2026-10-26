// @vitest-environment jsdom

import { createRef, type SyntheticEvent } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

/**
 * Проверяем контракт действия и доступности. Цветовые состояния представлены
 * в Storybook, поэтому функциональные тесты не зависят от состава CSS-классов.
 */
describe("Button", () => {
	it("передаёт ref и по умолчанию не отправляет форму", () => {
		const buttonRef = createRef<HTMLButtonElement>();
		const onSubmit = vi.fn();

		render(
			<form
				onSubmit={(event) => {
					event.preventDefault();
					onSubmit();
				}}>
				<Button ref={buttonRef} tone="accent">
					Действие
				</Button>
			</form>
		);

		const button = screen.getByRole("button");
		expect(buttonRef.current).toBe(button);
		expect(button).toHaveProperty("type", "button");

		fireEvent.click(button);
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it.each(["submit", "reset"] as const)("поддерживает явный тип %s и действие формы", (type) => {
		const onFormAction = vi.fn();
		const preventDefault = (event: SyntheticEvent<HTMLFormElement>) => {
			event.preventDefault();
			onFormAction(event.type);
		};

		render(
			<form onSubmit={preventDefault} onReset={preventDefault}>
				<Button type={type}>Действие</Button>
			</form>
		);

		const button = screen.getByRole("button");
		expect(button).toHaveProperty("type", type);
		fireEvent.click(button);
		expect(onFormAction).toHaveBeenCalledExactlyOnceWith(type);
	});

	it("вызывает onClick только у доступной кнопки", () => {
		const onClick = vi.fn();
		const { rerender } = render(
			<Button onClick={onClick} tone="accent" appearance="outline">
				Действие
			</Button>
		);

		fireEvent.click(screen.getByRole("button"));
		expect(onClick).toHaveBeenCalledTimes(1);

		rerender(
			<Button disabled onClick={onClick} tone="accent" appearance="ghost">
				Действие
			</Button>
		);
		const button = screen.getByRole("button");
		expect(button).toHaveProperty("disabled", true);
		fireEvent.click(button);
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it.each([
		{ ariaLabel: "Название действия", title: undefined, expectedName: "Название действия" },
		{ ariaLabel: undefined, title: "Подсказка действия", expectedName: "Подсказка действия" },
		{ ariaLabel: "Название действия", title: "Подсказка действия", expectedName: "Название действия" }
	])("задаёт доступное имя icon-only кнопки из переданных props: $expectedName", ({ ariaLabel, title, expectedName }) => {
		render(<Button aria-label={ariaLabel} title={title} icon={<span role="img" />} />);

		// Имя задано потребителем; проверяем его приоритет над декоративной иконкой.
		expect(screen.getByRole("button", { name: expectedName }).getAttribute("aria-label")).toBe(expectedName);
		expect(screen.getByRole("img", { hidden: true })).toBeInstanceOf(HTMLElement);
		expect(screen.queryByRole("img")).toBeNull();
	});

	it("сохраняет участие кнопки с title в родительской grid-раскладке и её ref", async () => {
		const user = userEvent.setup();
		const buttonRef = createRef<HTMLButtonElement>();
		const onClick = vi.fn();
		render(
			<div data-testid="button-grid" style={{ display: "grid", gridTemplateColumns: "16rem" }}>
				<Button ref={buttonRef} title="Описание действия" onClick={onClick} style={{ gridColumn: "1 / -1" }}>
					Действие
				</Button>
			</div>
		);
		const button = screen.getByRole("button");
		// Непосредственное участие в Grid — требование этого исправления;
		// фактическое растяжение дополнительно проверяется в настоящем браузере.
		expect(button.parentElement).toBe(screen.getByTestId("button-grid"));
		expect(buttonRef.current).toBe(button);
		await user.tab();
		const tooltip = screen.getByRole("tooltip");
		expect(button.getAttribute("aria-describedby")).toBe(tooltip.id);
		await user.keyboard("{Enter}");
		expect(onClick).toHaveBeenCalledTimes(1);
		expect(screen.queryByRole("tooltip")).toBeNull();
	});

	it("сохраняет native disabled с title и допускает hover-подсказку без активации", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();
		render(
			<>
				<Button data-testid="disabled-trigger" disabled title="Причина недоступности" onClick={onClick} />
				<button type="button" data-testid="next-focus-target" />
			</>
		);
		const button = screen.getByTestId("disabled-trigger");
		expect(button).toHaveProperty("disabled", true);
		expect(button.hasAttribute("aria-disabled")).toBe(false);
		await user.hover(button);
		const tooltip = await screen.findByRole("tooltip");
		expect(button.getAttribute("aria-describedby")).toBe(tooltip.id);
		await user.click(button);
		expect(onClick).not.toHaveBeenCalled();
		await user.unhover(button);
		await user.tab();
		expect(document.activeElement).toBe(screen.getByTestId("next-focus-target"));
	});
});
