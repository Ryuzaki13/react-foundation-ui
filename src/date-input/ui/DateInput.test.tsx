// @vitest-environment jsdom

import { act, type ReactNode, useState } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SingleDateInput } from "./DateInput";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;

async function renderNode(node: ReactNode) {
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);

	await act(async () => {
		root!.render(node);
	});
}

function setNativeInputValue(input: HTMLInputElement, value: string) {
	const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
	valueSetter?.call(input, value);
	input.dispatchEvent(new Event("input", { bubbles: true }));
}

function ControlledSingleDateInput({ datePreset, onCommit }: { datePreset?: string; onCommit: (value: Date | null) => void }) {
	const [value, setValue] = useState<Date | null>(new Date(2026, 2, 3, 12, 30, 0));

	const handleChange = (nextValue: Date | null) => {
		onCommit(nextValue);
		setValue(nextValue);
	};

	return <SingleDateInput label="Дата" datePreset={datePreset} value={value} onChange={handleChange} />;
}

function ExternallyControlledSingleDateInput() {
	const [value, setValue] = useState<Date | null>(new Date(2026, 2, 3));

	return (
		<>
			<SingleDateInput label="Дата" value={value} onChange={setValue} />
			<button type="button" onClick={() => setValue(new Date(2027, 3, 4))}>
				Внешнее значение
			</button>
		</>
	);
}

afterEach(async () => {
	vi.useRealTimers();

	if (root) {
		await act(async () => {
			root?.unmount();
		});
		root = null;
	}

	container?.remove();
	container = null;
	document.body.innerHTML = "";
});

describe("SingleDateInput", () => {
	it("выводит новое controlled value без синхронизирующего effect", async () => {
		await renderNode(<ExternallyControlledSingleDateInput />);

		const input = container?.querySelector("input[type='text']") as HTMLInputElement;
		expect(input.value).toBe("03.03.2026");

		await act(async () => {
			(container?.querySelector('button[aria-label="Открыть календарь"]') as HTMLButtonElement).click();
		});
		expect(document.querySelector('[data-action="calendar-switch-view"]')?.textContent).toContain("март");

		await act(async () => {
			Array.from(container?.querySelectorAll<HTMLButtonElement>("button") ?? [])
				.find((button) => button.textContent === "Внешнее значение")
				?.click();
		});

		expect(input.value).toBe("04.04.2027");
		expect(document.querySelector('[data-action="calendar-switch-view"]')?.textContent).toContain("апрель");
	});

	it("не вызывает onChange при первом blur без изменения значения", async () => {
		const handleCommit = vi.fn();
		await renderNode(<ControlledSingleDateInput onCommit={handleCommit} />);

		const input = container?.querySelector("input[type='text']") as HTMLInputElement;

		await act(async () => {
			input.focus();
			input.blur();
		});

		expect(handleCommit).not.toHaveBeenCalled();
	});

	it("вызывает onChange при blur после ручного изменения даты", async () => {
		const handleCommit = vi.fn();
		await renderNode(<ControlledSingleDateInput onCommit={handleCommit} />);

		const input = container?.querySelector("input[type='text']") as HTMLInputElement;

		await act(async () => {
			input.focus();
			setNativeInputValue(input, "04.03.2026");
			input.blur();
		});

		expect(handleCommit).toHaveBeenCalledTimes(1);
		expect(handleCommit).toHaveBeenCalledWith(new Date(2026, 2, 4, 0, 0, 0));
	});

	it("парсит ручной ввод через day+month пресет", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0));

		const handleCommit = vi.fn();
		await renderNode(<ControlledSingleDateInput datePreset="month-long" onCommit={handleCommit} />);

		const input = container?.querySelector("input[type='text']") as HTMLInputElement;

		await act(async () => {
			input.focus();
			setNativeInputValue(input, "25 июня");
			input.blur();
		});

		expect(handleCommit).toHaveBeenCalledTimes(1);
		expect(handleCommit).toHaveBeenCalledWith(new Date(2026, 5, 25, 0, 0, 0));
	});
});
