import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Dialog } from "./Dialog";

afterEach(() => {
	document.getElementById("dialog-root")?.remove();
});

describe("Dialog", () => {
	it("передаёт минимальную ширину через ограничиваемую панелью CSS-переменную", () => {
		render(
			<Dialog title="Проверка размера" description="Описание" open onClose={() => undefined} minWidth={640}>
				Содержимое
			</Dialog>
		);

		const dialog = screen.getByRole("dialog", { name: "Проверка размера" });

		expect(dialog.style.minWidth).toBe("");
		expect(dialog.style.getPropertyValue("--dialog-min-width")).toBe("640px");
		expect(dialog.classList.contains("scrollable")).toBe(true);
		expect(dialog.classList.contains("overscroll")).toBe(true);
	});

	it("оставляет начальный фокус на панели, чтобы длинный контент открывался с заголовка", async () => {
		render(
			<Dialog title="Проверка фокуса" description="Описание" open onClose={() => undefined}>
				<button type="button">Кнопка в конце содержимого</button>
			</Dialog>
		);

		const dialog = screen.getByRole("dialog", { name: "Проверка фокуса" });

		await waitFor(() => expect(document.activeElement).toBe(dialog));
	});

	it("закрывается только при нажатии на backdrop, а не на содержимое", () => {
		const onClose = vi.fn();
		render(
			<Dialog title="Проверка backdrop" description="Описание" open onClose={onClose}>
				Содержимое
			</Dialog>
		);

		const dialog = screen.getByRole("dialog", { name: "Проверка backdrop" });
		const backdrop = dialog.parentElement;

		fireEvent.mouseDown(dialog);
		expect(onClose).not.toHaveBeenCalled();

		if (!backdrop) {
			throw new Error("Backdrop диалога не найден");
		}

		fireEvent.mouseDown(backdrop);
		expect(onClose).toHaveBeenCalledOnce();
	});
});
