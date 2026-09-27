import { useEffect } from "react";

import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Dialog } from "../dialog";

import { ModalManagerProvider } from "./ModalManagerProvider";
import { useModalManager } from "./useModalManager";

function ModalRegistration({ open }: { open: boolean }) {
	const { openModal, closeModal } = useModalManager();

	useEffect(() => {
		if (!open) return;

		openModal("test-modal");

		return () => closeModal("test-modal");
	}, [closeModal, open, openModal]);

	return null;
}

beforeEach(() => {
	vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

afterEach(() => {
	cleanup();
	document.body.removeAttribute("style");
	document.documentElement.removeAttribute("style");
	document.getElementById("app-root")?.remove();
	document.getElementById("dialog-root")?.remove();
	vi.restoreAllMocks();
});

describe("ModalManagerProvider", () => {
	it("вложенный Dialog не снимает lock открытой Modal", async () => {
		vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
		const view = render(
			<ModalManagerProvider>
				<ModalRegistration open />
				<Dialog title="" description="" open onClose={() => undefined}>
					Содержимое
				</Dialog>
			</ModalManagerProvider>
		);
		await waitFor(() => expect(document.body.style.position).toBe("fixed"));
		view.rerender(
			<ModalManagerProvider>
				<ModalRegistration open />
			</ModalManagerProvider>
		);
		expect(document.body.style.position).toBe("fixed");
		expect(window.scrollTo).not.toHaveBeenCalled();
		view.unmount();
		expect(document.body.style.position).toBe("");
		expect(window.scrollTo).toHaveBeenCalledOnce();
	});

	it("unmount активного provider восстанавливает существующие styles и inert", async () => {
		vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
		document.body.style.position = "relative";
		const appRoot = document.body.appendChild(document.createElement("div"));
		appRoot.id = "app-root";
		appRoot.setAttribute("inert", "");
		const view = render(
			<ModalManagerProvider>
				<ModalRegistration open />
			</ModalManagerProvider>
		);
		await waitFor(() => expect(appRoot.getAttribute("inert")).toBe("true"));
		view.unmount();
		expect(appRoot.getAttribute("inert")).toBe("");
		expect(document.body.style.position).toBe("relative");
	});

	it("компенсирует ширину скрытого скроллбара при включенном пропсе", async () => {
		vi.spyOn(window, "innerWidth", "get").mockReturnValue(1200);
		vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(1180);
		vi.spyOn(window, "scrollTo").mockImplementation(() => {});

		const view = render(
			<ModalManagerProvider compensateScrollbar>
				<ModalRegistration open />
			</ModalManagerProvider>
		);

		await waitFor(() => expect(document.body.style.paddingRight).toBe("20px"));

		view.rerender(
			<ModalManagerProvider compensateScrollbar>
				<ModalRegistration open={false} />
			</ModalManagerProvider>
		);

		await waitFor(() => expect(document.body.style.paddingRight).toBe(""));
	});

	it("не добавляет компенсацию по умолчанию", async () => {
		vi.spyOn(window, "innerWidth", "get").mockReturnValue(1200);
		vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(1180);

		render(
			<ModalManagerProvider>
				<ModalRegistration open />
			</ModalManagerProvider>
		);

		await waitFor(() => expect(document.body.style.position).toBe("fixed"));
		expect(document.body.style.paddingRight).toBe("");
	});
});
