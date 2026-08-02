// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import uiStyles from "../ui.module.scss";

import { Button } from "./Button";

/**
 * Цвета вычисляются браузером из CSS-переменных, поэтому здесь закреплён публичный
 * contract выбора brand-схемы, а визуальные состояния проверяются в Storybook.
 */
describe("Button brand scheme", () => {
	it("по умолчанию применяет solid brand-тон и безопасный button type", () => {
		render(<Button tone="brand">Сохранить</Button>);

		const button = screen.getByRole("button", { name: "Сохранить" });

		expect(button).toBeInstanceOf(HTMLButtonElement);
		expect(button.getAttribute("type")).toBe("button");
		expect(button.classList.contains(uiStyles.uiToneBrand)).toBe(true);
		expect(button.classList.contains(uiStyles.uiAppearanceSolid)).toBe(true);
	});

	it("разрешает brand-варианты и отдаёт tone с appearance приоритет над variant", () => {
		const { rerender } = render(<Button variant="brandOutline">Предпросмотр</Button>);
		const button = screen.getByRole("button", { name: "Предпросмотр" });

		expect(button.classList.contains(uiStyles.uiToneBrand)).toBe(true);
		expect(button.classList.contains(uiStyles.uiAppearanceOutline)).toBe(true);

		rerender(
			<Button variant="error" tone="brand" appearance="ghost">
				Предпросмотр
			</Button>
		);

		expect(button.classList.contains(uiStyles.uiToneBrand)).toBe(true);
		expect(button.classList.contains(uiStyles.uiAppearanceGhost)).toBe(true);
		expect(button.classList.contains(uiStyles.uiToneError)).toBe(false);
	});

	it("сохраняет доступное имя и disabled-state у icon-only brand-кнопки", () => {
		render(<Button aria-label="Открыть уведомления" disabled icon={<span />} tone="brand" />);

		const button = screen.getByRole("button", { name: "Открыть уведомления" });

		expect(button).toBeInstanceOf(HTMLButtonElement);
		expect((button as HTMLButtonElement).disabled).toBe(true);
		expect(button.classList.contains(uiStyles.uiToneBrand)).toBe(true);
	});
});
