// @vitest-environment jsdom

import { act } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TimeDialog } from "./TimeDialog";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function setNativeInputValue(input: HTMLInputElement, value: string) {
	const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
	valueSetter?.call(input, value);
	input.dispatchEvent(new Event("input", { bubbles: true }));
}

afterEach(async () => {
	if (root) {
		await act(async () => root?.unmount());
	}

	container?.remove();
	container = null;
	root = null;
	document.body.innerHTML = "";
});

describe("TimeDialog", () => {
	it("инициализирует одну dialog-session и сохраняет правую границу диапазона", async () => {
		const onConfirm = vi.fn();
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);

		await act(async () => {
			root?.render(
				<TimeDialog onClose={vi.fn()} onConfirm={onConfirm} initialState={{ mode: "range-time", from: "09:00", to: "17:00" }} />
			);
		});

		const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="text"]'));
		expect(inputs.map((input) => input.value)).toEqual(["09:00", "17:00"]);

		await act(async () => setNativeInputValue(inputs[1], "18:00"));
		const confirmButton = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find((button) =>
			button.textContent?.includes("Подтвердить")
		);
		await act(async () => confirmButton?.click());

		expect(onConfirm).toHaveBeenCalledWith("time", "09:00/18:00", { datetime: "09:00/18:00" });
	});
});
