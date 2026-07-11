import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ImageCropper } from "./ImageCropper";

vi.mock("react-easy-crop", () => ({
	default: function CropperMock({
		crop,
		zoom,
		onCropChange,
		onZoomChange,
		onCropComplete
	}: {
		crop: { x: number; y: number };
		zoom: number;
		onCropChange: (crop: { x: number; y: number }) => void;
		onZoomChange?: (zoom: number) => void;
		onCropComplete?: (
			percentages: { x: number; y: number; width: number; height: number },
			pixels: { x: number; y: number; width: number; height: number }
		) => void;
	}) {
		return (
			<div>
				<output data-testid="crop">{`${crop.x}:${crop.y}`}</output>
				<output data-testid="zoom">{zoom}</output>
				<button type="button" onClick={() => onCropChange({ x: 10, y: 20 })}>
					Изменить crop
				</button>
				<button type="button" onClick={() => onZoomChange?.(2)}>
					Изменить zoom
				</button>
				<button
					type="button"
					onClick={() => onCropComplete?.({ x: 1, y: 2, width: 30, height: 40 }, { x: 10, y: 20, width: 300, height: 400 })}>
					Завершить crop
				</button>
			</div>
		);
	}
}));

describe("ImageCropper", () => {
	it("обновляет внутренние crop и zoom в uncontrolled-режиме", () => {
		render(<ImageCropper image="data:image/png;base64,image" defaultZoom={1.5} />);

		expect(screen.getByTestId("crop").textContent).toBe("0:0");
		expect(screen.getByTestId("zoom").textContent).toBe("1.5");

		fireEvent.click(screen.getByRole("button", { name: "Изменить crop" }));
		fireEvent.click(screen.getByRole("button", { name: "Изменить zoom" }));

		expect(screen.getByTestId("crop").textContent).toBe("10:20");
		expect(screen.getByTestId("zoom").textContent).toBe("2");
	});

	it("не подменяет controlled-значения и отдаёт pixel crop первым аргументом", () => {
		const onCropChange = vi.fn();
		const onZoomChange = vi.fn();
		const onCropComplete = vi.fn();

		render(
			<ImageCropper
				image="data:image/png;base64,image"
				crop={{ x: 3, y: 4 }}
				zoom={1.25}
				onCropChange={onCropChange}
				onZoomChange={onZoomChange}
				onCropComplete={onCropComplete}
			/>
		);

		fireEvent.click(screen.getByRole("button", { name: "Изменить crop" }));
		fireEvent.click(screen.getByRole("button", { name: "Изменить zoom" }));
		fireEvent.click(screen.getByRole("button", { name: "Завершить crop" }));

		expect(screen.getByTestId("crop").textContent).toBe("3:4");
		expect(screen.getByTestId("zoom").textContent).toBe("1.25");
		expect(onCropChange).toHaveBeenCalledWith({ x: 10, y: 20 });
		expect(onZoomChange).toHaveBeenCalledWith(2);
		expect(onCropComplete).toHaveBeenCalledWith({ x: 10, y: 20, width: 300, height: 400 }, { x: 1, y: 2, width: 30, height: 40 });
	});
});
