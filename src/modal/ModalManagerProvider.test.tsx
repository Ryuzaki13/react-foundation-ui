import { useEffect } from "react";

import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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

afterEach(() => {
	document.body.removeAttribute("style");
	vi.restoreAllMocks();
});

describe("ModalManagerProvider", () => {
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
