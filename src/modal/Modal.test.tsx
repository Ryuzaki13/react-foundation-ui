import { useState } from "react";

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Button } from "../button";

import { Modal, ModalContent, ModalFooter } from "./Modal";
import { ModalManagerProvider } from "./ModalManagerProvider";

beforeEach(() => {
	vi.stubGlobal("scrollTo", vi.fn());
	vi.stubGlobal(
		"matchMedia",
		vi.fn().mockReturnValue({
			matches: false,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		})
	);
});

afterEach(() => {
	vi.unstubAllGlobals();
	document.getElementById("modal-root")?.remove();
	document.getElementById("app-root")?.remove();
});

function ControlledModal() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<ModalManagerProvider>
			<Button onClick={() => setIsOpen(true)}>Открыть</Button>
			<Modal isOpen={isOpen} title="Проверка анимации" onClose={() => setIsOpen(false)}>
				<ModalContent>Содержимое</ModalContent>
				<ModalFooter>
					<Button onClick={() => setIsOpen(false)}>Закрыть</Button>
				</ModalFooter>
			</Modal>
		</ModalManagerProvider>
	);
}

describe("Modal", () => {
	it("сохраняет dialog до завершения exit-анимации и возвращает фокус", async () => {
		const appRoot = document.createElement("div");
		appRoot.id = "app-root";
		document.body.append(appRoot);
		render(<ControlledModal />, { container: appRoot });

		const trigger = screen.getByRole("button", { name: "Открыть" });
		trigger.focus();
		act(() => fireEvent.click(trigger));

		const dialog = await screen.findByRole("dialog", { name: "Проверка анимации" });

		act(() => fireEvent.click(screen.getByRole("button", { name: "Закрыть" })));

		expect(screen.getByRole("dialog", { name: "Проверка анимации" })).toBe(dialog);
		await waitFor(() => expect(screen.queryByRole("dialog", { name: "Проверка анимации" })).toBeNull());
		await waitFor(() => expect(document.activeElement).toBe(trigger));
	});
});
