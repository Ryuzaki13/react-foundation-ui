import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Dialog } from "./Dialog";
import styles from "./Dialog.module.scss";

beforeEach(() => {
	vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

afterEach(() => {
	cleanup();
	document.getElementById("dialog-root")?.remove();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("Dialog", () => {
	it("привязывает overlay к visual viewport и освобождает document lock", () => {
		const viewport = Object.assign(new EventTarget(), { width: 390, height: 330, offsetTop: 115, offsetLeft: 0 });
		vi.stubGlobal("visualViewport", viewport);
		const view = render(
			<Dialog title="" description="" open onClose={() => undefined}>
				Содержимое
			</Dialog>
		);
		const overlay = screen.getByRole("dialog").parentElement;
		expect(overlay?.style.getPropertyValue("--visual-viewport-height")).toBe("330px");
		expect(overlay?.style.getPropertyValue("--visual-viewport-top")).toBe("115px");
		expect(document.body.style.position).toBe("fixed");
		view.unmount();
		expect(document.body.style.position).toBe("");
	});
	it("применяет тот же размерный пресет ширины, что и Modal", () => {
		render(
			<Dialog title="Проверка размера" description="Описание" open onClose={() => undefined} size="lg" minWidth={640}>
				Содержимое
			</Dialog>
		);

		const dialog = screen.getByRole("dialog", { name: "Проверка размера" });

		expect(dialog.style.minWidth).toBe("");
		expect(dialog.style.getPropertyValue("--dialog-min-width")).toBe("640px");
		expect(dialog.classList.contains(styles.sized)).toBe(true);
		expect(dialog.classList.contains(styles.lg)).toBe(true);
		expect(dialog.classList.contains("scrollableY")).toBe(true);
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
