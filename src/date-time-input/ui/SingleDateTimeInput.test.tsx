// @vitest-environment jsdom

import { act, useState } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import { SingleDateTimeInput } from "./SingleDateTimeInput";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function DateTimeHarness() {
	const [value, setValue] = useState<Date | null>(new Date(2026, 2, 3, 12, 30));

	return (
		<>
			<SingleDateTimeInput label="Дата и время" value={value} onChange={setValue} />
			<button type="button" onClick={() => setValue(new Date(2027, 3, 4, 9, 45))}>
				Внешнее значение
			</button>
		</>
	);
}

function getSegment(label: string) {
	return container?.querySelector(`input[aria-label="${label}"]`) as HTMLInputElement;
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

describe("SingleDateTimeInput", () => {
	it("отбрасывает незавершённые сегменты после смены controlled value", async () => {
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);

		await act(async () => root?.render(<DateTimeHarness />));
		expect(getSegment("День").value).toBe("03");

		await act(async () => setNativeInputValue(getSegment("День"), "0"));
		expect(getSegment("День").value).toBe("0");

		await act(async () => {
			Array.from(container?.querySelectorAll<HTMLButtonElement>("button") ?? [])
				.find((button) => button.textContent === "Внешнее значение")
				?.click();
		});

		expect(getSegment("День").value).toBe("04");
		expect(getSegment("Месяц").value).toBe("04");
		expect(getSegment("Год").value).toBe("2027");
		expect(getSegment("Часы").value).toBe("09");
		expect(getSegment("Минуты").value).toBe("45");
	});
});
