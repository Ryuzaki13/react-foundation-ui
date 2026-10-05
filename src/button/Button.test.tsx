// @vitest-environment jsdom

import { createRef, type SyntheticEvent } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
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
				<Button ref={buttonRef} tone="brand">
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
			<Button onClick={onClick} tone="brand" appearance="outline">
				Действие
			</Button>
		);

		fireEvent.click(screen.getByRole("button"));
		expect(onClick).toHaveBeenCalledTimes(1);

		rerender(
			<Button disabled onClick={onClick} tone="brand" appearance="ghost">
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
});
