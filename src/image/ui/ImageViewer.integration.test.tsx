import { useState } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { Button } from "../../button";
import { Modal, ModalContent, ModalManagerProvider } from "../../modal";

import { ImageViewer } from "./ImageViewer";

beforeAll(() => {
	// Foundation media hooks требуют browser API, которого нет в стандартном jsdom environment.
	Object.defineProperty(window, "matchMedia", {
		configurable: true,
		writable: true,
		value: (query: string): MediaQueryList => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => undefined,
			removeListener: () => undefined,
			addEventListener: () => undefined,
			removeEventListener: () => undefined,
			dispatchEvent: () => false
		})
	});
	Object.defineProperty(window, "scrollTo", {
		configurable: true,
		writable: true,
		value: () => undefined
	});
});

/** Реальная композиция проверяет взаимодействие двух независимых portal/focus boundaries. */
function ViewerOverModalFixture() {
	const [modalOpen, setModalOpen] = useState(false);
	const [viewerOpen, setViewerOpen] = useState(false);

	return (
		<ModalManagerProvider>
			<Button onClick={() => setModalOpen(true)}>Открыть выбор изображения</Button>
			<Modal isOpen={modalOpen} title="Выбор изображения" onClose={() => setModalOpen(false)}>
				<ModalContent>
					<Button onClick={() => setViewerOpen(true)}>Открыть предпросмотр</Button>
				</ModalContent>
			</Modal>
			<ImageViewer
				open={viewerOpen}
				images={[
					{ src: "/preview.webp", alt: "Предпросмотр", intrinsicWidth: 1600, intrinsicHeight: 900 },
					{ src: "/preview-next.webp", alt: "Следующее изображение", intrinsicWidth: 1600, intrinsicHeight: 900 }
				]}
				onClose={() => setViewerOpen(false)}
			/>
		</ModalManagerProvider>
	);
}

afterEach(() => {
	document.getElementById("modal-root")?.remove();
});

describe("ImageViewer поверх Modal", () => {
	it("изолирует нижний modal, закрывается первым по Escape и возвращает focus trigger", async () => {
		render(<ViewerOverModalFixture />);

		fireEvent.click(screen.getByRole("button", { name: "Открыть выбор изображения" }));
		await screen.findByRole("dialog", { name: "Выбор изображения" });
		const modalCloseButton = screen.getByRole("button", { name: "Закрыть модальное окно" });
		await waitFor(() => expect(document.activeElement).toBe(modalCloseButton));

		const previewTrigger = screen.getByRole("button", { name: "Открыть предпросмотр" });
		previewTrigger.focus();
		fireEvent.click(previewTrigger);

		const viewer = await screen.findByRole("dialog", { name: "Просмотр изображений" });
		const modalRoot = document.getElementById("modal-root");

		expect(modalRoot?.getAttribute("inert")).toBe("");
		expect(modalRoot?.getAttribute("aria-hidden")).toBe("true");
		const counter = viewer.querySelector<HTMLElement>(".yarl__counter");
		expect(counter?.style.top).toBe("var(--_image-viewer-top-row-height)");
		await waitFor(() => expect(viewer.contains(document.activeElement)).toBe(true));

		fireEvent.keyDown(document.activeElement ?? viewer, { key: "Escape", bubbles: true, cancelable: true });

		await waitFor(() => expect(screen.queryByRole("dialog", { name: "Просмотр изображений" })).toBeNull());
		await waitFor(() => expect(document.activeElement).toBe(previewTrigger));
		expect(modalRoot?.hasAttribute("inert")).toBe(false);
		expect(modalRoot?.hasAttribute("aria-hidden")).toBe(false);
		expect(screen.getByRole("dialog", { name: "Выбор изображения" })).not.toBeNull();

		fireEvent.keyDown(previewTrigger, { key: "Escape", bubbles: true, cancelable: true });

		await waitFor(() => expect(screen.queryByRole("dialog", { name: "Выбор изображения" })).toBeNull());
	});
});
