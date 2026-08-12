// @vitest-environment jsdom

import { act } from "react";

import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";

import { PickerOptions } from "./PickerOptions";

describe("PickerOptions", () => {
	it("показывает стандартный toolbar при переданных selectionActions", async () => {
		const container = document.createElement("div");
		const root = createRoot(container);
		const onSelectAll = vi.fn();
		const onDeselectAll = vi.fn();

		await act(async () => {
			root.render(
				<PickerOptions selectionActions={{ onSelectAll, onDeselectAll }}>
					<div>Опция</div>
				</PickerOptions>
			);
		});

		const selectButton = container.querySelector<HTMLButtonElement>('[data-action="select-all"]');
		const deselectButton = container.querySelector<HTMLButtonElement>('[data-action="deselect-all"]');

		expect(selectButton).toBeTruthy();
		expect(deselectButton).toBeTruthy();

		await act(async () => {
			selectButton?.click();
			deselectButton?.click();
		});

		expect(onSelectAll).toHaveBeenCalledOnce();
		expect(onDeselectAll).toHaveBeenCalledOnce();

		await act(async () => root.unmount());
	});

	it("позволяет отключить стандартный toolbar", async () => {
		const container = document.createElement("div");
		const root = createRoot(container);

		await act(async () => {
			root.render(
				<PickerOptions toolbar={false} selectionActions={{ onSelectAll: vi.fn(), onDeselectAll: vi.fn() }}>
					<div>Опция</div>
				</PickerOptions>
			);
		});

		expect(container.querySelector('[data-action="select-all"]')).toBeNull();

		await act(async () => root.unmount());
	});
});
