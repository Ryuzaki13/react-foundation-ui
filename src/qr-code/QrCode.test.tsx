import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { encodeQrCode } from "./encodeQrCode";
import { QrCode } from "./QrCode";

vi.mock("./encodeQrCode", () => ({ encodeQrCode: vi.fn() }));

const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21"><path d="M0 0h7v7H0z"/></svg>';
const createObjectURL = vi.fn<(blob: Blob) => string>();
const revokeObjectURL = vi.fn<(url: string) => void>();

beforeEach(() => {
	vi.mocked(encodeQrCode).mockReset().mockResolvedValue({ svg });
	createObjectURL.mockReset().mockReturnValue("blob:qr-code");
	revokeObjectURL.mockReset();
	vi.stubGlobal(
		"URL",
		class extends URL {
			static createObjectURL = createObjectURL;
			static revokeObjectURL = revokeObjectURL;
		}
	);
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe("QrCode", () => {
	it("показывает доступное Blob-изображение; payload не копируется в DOM", async () => {
		const { container } = render(<QrCode value="synthetic-secret" alt="Подтверждение входа" />);
		const image = await screen.findByAltText("Подтверждение входа");
		expect(image.getAttribute("src")).toBe("blob:qr-code");
		expect(image.getAttribute("width")).toBe("256");
		expect(encodeQrCode).toHaveBeenCalledExactlyOnceWith("synthetic-secret", "M");
		expect(createObjectURL.mock.calls[0]?.[0].type).toBe("image/svg+xml");
		expect(container.innerHTML).not.toContain("synthetic-secret");
	});

	it("смена callback, alt, size и className не запускает повторное кодирование", async () => {
		const { rerender } = render(<QrCode value="same" alt="Первое описание" onError={vi.fn()} />);
		await screen.findByAltText("Первое описание");
		rerender(<QrCode value="same" alt="Новое описание" size={320} className="host-code" onError={vi.fn()} />);
		expect(screen.getByAltText("Новое описание").getAttribute("width")).toBe("320");
		expect(encodeQrCode).toHaveBeenCalledTimes(1);
		expect(revokeObjectURL).not.toHaveBeenCalled();
	});

	it("смена value немедленно убирает старый QR и отзывает его URL до нового результата", async () => {
		const { rerender, container } = render(<QrCode value="first" alt="Код" />);
		await screen.findByAltText("Код");
		vi.mocked(encodeQrCode).mockReturnValueOnce(new Promise(() => undefined));
		rerender(<QrCode value="second" alt="Код" />);
		expect(container.querySelector("img")).toBeNull();
		expect(container.querySelector('[data-state="loading"]')).not.toBeNull();
		expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith("blob:qr-code");
	});

	it("поздний результат прежнего value не создаёт URL и не заменяет актуальный код", async () => {
		let finishFirst: ((value: Awaited<ReturnType<typeof encodeQrCode>>) => void) | undefined;
		vi.mocked(encodeQrCode).mockReturnValueOnce(
			new Promise((resolve) => {
				finishFirst = resolve;
			})
		);
		const { rerender } = render(<QrCode value="first" alt="Код" />);
		rerender(<QrCode value="second" alt="Код" />);
		await screen.findByAltText("Код");
		await act(async () => finishFirst?.({ svg: "old result" }));
		expect(createObjectURL).toHaveBeenCalledTimes(1);
		expect(screen.getByAltText("Код").getAttribute("src")).toBe("blob:qr-code");
	});

	it("смена уровня коррекции скрывает предыдущий QR и запускает новую генерацию", async () => {
		const { rerender, container } = render(<QrCode value="same" alt="Код" errorCorrectionLevel="M" />);
		await screen.findByAltText("Код");
		vi.mocked(encodeQrCode).mockReturnValueOnce(new Promise(() => undefined));
		rerender(<QrCode value="same" alt="Код" errorCorrectionLevel="H" />);
		expect(container.querySelector("img")).toBeNull();
		expect(encodeQrCode).toHaveBeenLastCalledWith("same", "H");
		expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith("blob:qr-code");
	});

	it("A → B → A не показывает отозванный URL первого A", async () => {
		const { rerender, container } = render(<QrCode value="A" alt="Код" />);
		await screen.findByAltText("Код");
		vi.mocked(encodeQrCode).mockImplementation(() => new Promise(() => undefined));
		rerender(<QrCode value="B" alt="Код" />);
		rerender(<QrCode value="A" alt="Код" />);
		expect(container.querySelector("img")).toBeNull();
		expect(encodeQrCode).toHaveBeenCalledTimes(3);
	});

	it("unmount освобождает URL и запрещает создание URL поздним результатом", async () => {
		const first = render(<QrCode value="ready" alt="Код" />);
		await screen.findByAltText("Код");
		first.unmount();
		expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith("blob:qr-code");
		let finish: ((value: Awaited<ReturnType<typeof encodeQrCode>>) => void) | undefined;
		vi.mocked(encodeQrCode).mockReturnValueOnce(
			new Promise((resolve) => {
				finish = resolve;
			})
		);
		const pending = render(<QrCode value="pending" alt="Код" />);
		pending.unmount();
		await act(async () => finish?.({ svg }));
		expect(createObjectURL).toHaveBeenCalledTimes(1);
	});

	it("результат ошибки вызывает актуальный callback без повторного encode", async () => {
		let finish: ((value: Awaited<ReturnType<typeof encodeQrCode>>) => void) | undefined;
		vi.mocked(encodeQrCode).mockReturnValueOnce(
			new Promise((resolve) => {
				finish = resolve;
			})
		);
		const oldCallback = vi.fn();
		const newCallback = vi.fn();
		const { rerender } = render(<QrCode value="same" alt="Код" onError={oldCallback} />);
		rerender(<QrCode value="same" alt="Код" onError={newCallback} />);
		await act(async () => finish?.({ error: { kind: "encoding-failed" } }));
		expect(oldCallback).not.toHaveBeenCalled();
		expect(newCallback).toHaveBeenCalledExactlyOnceWith({ kind: "encoding-failed" });
		expect(encodeQrCode).toHaveBeenCalledTimes(1);
		expect(screen.getByRole("alert").textContent).toBe("Не удалось создать QR-код.");
	});

	it("не передаёт callback позднюю ошибку размонтированного запроса", async () => {
		let finish: ((value: Awaited<ReturnType<typeof encodeQrCode>>) => void) | undefined;
		vi.mocked(encodeQrCode).mockReturnValueOnce(
			new Promise((resolve) => {
				finish = resolve;
			})
		);
		const onError = vi.fn();
		const { unmount } = render(<QrCode value="pending" alt="Код" onError={onError} />);
		unmount();
		await act(async () => finish?.({ error: { kind: "unavailable" } }));
		expect(onError).not.toHaveBeenCalled();
	});

	it("ошибка Blob URL или загрузки изображения выдаёт только безопасный kind", async () => {
		const onError = vi.fn();
		createObjectURL.mockImplementationOnce(() => {
			throw new Error("sensitive vendor cause");
		});
		const first = render(<QrCode value="synthetic-secret" alt="Код" onError={onError} />);
		await screen.findByRole("alert");
		expect(onError).toHaveBeenCalledExactlyOnceWith({ kind: "unavailable" });
		first.unmount();
		onError.mockClear();
		render(<QrCode value="another" alt="Код" onError={onError} />);
		fireEvent.error(await screen.findByAltText("Код"));
		expect(onError).toHaveBeenCalledExactlyOnceWith({ kind: "unavailable" });
		expect(screen.queryByRole("img")).toBeNull();
	});

	it("SSR placeholder гидратируется без mismatch и затем показывает QR", async () => {
		const props = { value: "synthetic-secret", alt: "Код" };
		const container = document.createElement("div");
		container.innerHTML = renderToString(<QrCode {...props} />);
		document.body.append(container);
		expect(encodeQrCode).not.toHaveBeenCalled();
		expect(container.innerHTML).not.toContain(props.value);
		const consoleError = vi.spyOn(console, "error");
		render(<QrCode {...props} />, { container, hydrate: true });
		await waitFor(() => expect(container.querySelector("img")).not.toBeNull());
		expect(consoleError).not.toHaveBeenCalled();
	});
});
