import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type SelectedImageData } from "./imageSelectionTypes";
import { useImageSelectionState } from "./useImageSelectionState";

function createSelectedImage(alt: string): SelectedImageData {
	const file = new File(["image"], "image.png", { type: "image/png", lastModified: 1 });

	return {
		alt,
		file: {
			mode: "data-url",
			file,
			dataUrl: "data:image/png;base64,image",
			meta: {
				name: file.name,
				mime: file.type,
				size: file.size,
				lastModified: file.lastModified
			}
		}
	};
}

describe("useImageSelectionState", () => {
	it("сразу публикует изменения uncontrolled-значения", () => {
		const onChange = vi.fn();
		const initialImage = createSelectedImage("");
		const { result } = renderHook(() => useImageSelectionState({ defaultValue: [initialImage], onChange }));

		act(() => result.current.setActiveAlt("Описание"));

		expect(result.current.value[0]?.alt).toBe("Описание");
		expect(onChange).toHaveBeenCalledWith([{ ...initialImage, alt: "Описание" }]);
	});

	it("оставляет controlled-значение источником истины", () => {
		const onChange = vi.fn();
		const controlledImage = createSelectedImage("Исходное описание");
		const { result } = renderHook(() => useImageSelectionState({ value: [controlledImage], onChange }));

		act(() => result.current.setActiveAlt("Новое описание"));

		expect(result.current.value[0]?.alt).toBe("Исходное описание");
		expect(onChange).toHaveBeenCalledWith([{ ...controlledImage, alt: "Новое описание" }]);
	});
});
