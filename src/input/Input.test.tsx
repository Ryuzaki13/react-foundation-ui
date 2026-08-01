// @vitest-environment jsdom

import { act, useState } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import { InputNumber } from "./Input";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function InputNumberHarness() {
	const [value, setValue] = useState<number | undefined>(12);

	return (
		<>
			<InputNumber label="Количество" value={value} onChange={setValue} />
			<output data-testid="value">{String(value)}</output>
			<button type="button" onClick={() => setValue(42.5)}>
				Внешнее значение
			</button>
		</>
	);
}

async function renderHarness() {
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);

	await act(async () => {
		root?.render(<InputNumberHarness />);
	});
}

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
});

describe("InputNumber", () => {
	it("сохраняет DOM-draft при вводе и синхронизируется с новым controlled value", async () => {
		await renderHarness();

		const input = container?.querySelector('input[type="number"]') as HTMLInputElement;
		expect(input.value).toBe("12");

		await act(async () => setNativeInputValue(input, "17.50"));
		expect(input.value).toBe("17.50");
		expect(container?.querySelector('[data-testid="value"]')?.textContent).toBe("17.5");

		await act(async () => {
			(container?.querySelector("button") as HTMLButtonElement).click();
		});
		expect(input.value).toBe("42.5");
	});
});
