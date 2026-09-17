import { type Ref } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BarcodeScannerDialog } from "./BarcodeScannerDialog";

import type { IDetectedBarcode, IScannerError } from "@yudiel/react-qr-scanner";

const scannerHarness = vi.hoisted(() => ({
	onError: undefined as ((error: IScannerError) => void) | undefined,
	onScan: undefined as ((detectedCodes: IDetectedBarcode[]) => void) | undefined,
	stopTrack: vi.fn()
}));

type ScannerMockHandle = {
	getStream: () => { getTracks: () => { stop: typeof scannerHarness.stopTrack }[] };
	getVideoElement: () => null;
};

type ScannerMockProps = {
	onError?: (error: IScannerError) => void;
	onScan: (detectedCodes: IDetectedBarcode[]) => void;
	ref?: Ref<ScannerMockHandle>;
};

vi.mock("@yudiel/react-qr-scanner", async () => {
	const { useImperativeHandle } = await import("react");

	function ScannerMock({ onError, onScan, ref }: ScannerMockProps) {
		scannerHarness.onError = onError;
		scannerHarness.onScan = onScan;
		useImperativeHandle(ref, () => ({
			getStream: () => ({ getTracks: () => [{ stop: scannerHarness.stopTrack }] }),
			getVideoElement: () => null
		}));

		return <div data-testid="scanner" />;
	}

	return {
		prepareZXingModule: vi.fn(),
		Scanner: ScannerMock
	};
});

afterEach(() => {
	scannerHarness.onError = undefined;
	scannerHarness.onScan = undefined;
	scannerHarness.stopTrack.mockReset();
	document.getElementById("modal-root")?.remove();
});

describe("BarcodeScannerDialog", () => {
	it("останавливает камеру, передаёт первый код и закрывает сценарий один раз", () => {
		const onDetected = vi.fn();
		const onClose = vi.fn();
		render(<BarcodeScannerDialog onDetected={onDetected} onClose={onClose} />);

		const barcode = {
			boundingBox: { x: 0, y: 0, width: 10, height: 10 },
			cornerPoints: [],
			format: "code_128",
			rawValue: "001234567890"
		} satisfies IDetectedBarcode;

		act(() => scannerHarness.onScan?.([barcode]));
		act(() => scannerHarness.onScan?.([barcode]));

		expect(scannerHarness.stopTrack).toHaveBeenCalledTimes(1);
		expect(onDetected).toHaveBeenCalledOnce();
		expect(onDetected).toHaveBeenCalledWith({ value: barcode.rawValue, format: barcode.format });
		expect(onClose).toHaveBeenCalledOnce();
	});

	it("показывает локализованную ошибку и повторно монтирует сканер", () => {
		const onError = vi.fn();
		render(<BarcodeScannerDialog onDetected={vi.fn()} onClose={vi.fn()} onError={onError} />);

		const scannerError = {
			kind: "permission-denied",
			message: "Permission denied",
			cause: new DOMException("Permission denied", "NotAllowedError")
		} satisfies IScannerError;

		act(() => scannerHarness.onError?.(scannerError));

		expect(screen.getByRole("alert").textContent).toContain("Доступ к камере запрещён");
		expect(onError).toHaveBeenCalledWith(scannerError);
		fireEvent.click(screen.getByRole("button", { name: "Повторить" }));
		expect(screen.getByTestId("scanner")).not.toBeNull();
	});

	it("освобождает поток при закрытии модального окна", () => {
		const onClose = vi.fn();
		render(<BarcodeScannerDialog onDetected={vi.fn()} onClose={onClose} />);

		fireEvent.click(screen.getByRole("button", { name: "Закрыть модальное окно" }));

		expect(scannerHarness.stopTrack).toHaveBeenCalledOnce();
		expect(onClose).toHaveBeenCalledOnce();
	});
});
