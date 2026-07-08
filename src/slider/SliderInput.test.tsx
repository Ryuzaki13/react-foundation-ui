// @vitest-environment jsdom

import React, { act, useState } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SliderInput, SliderRangeInput } from "./SliderInput";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

if (!window.PointerEvent) {
	class PointerEventPolyfill extends MouseEvent {
		pointerId: number;

		constructor(type: string, params: PointerEventInit = {}) {
			super(type, params);
			this.pointerId = params.pointerId ?? 1;
		}
	}

	Object.assign(window, {
		PointerEvent: PointerEventPolyfill
	});
}

HTMLElement.prototype.setPointerCapture ??= () => undefined;
HTMLElement.prototype.releasePointerCapture ??= () => undefined;

function dispatchPointer(target: EventTarget, type: string, init: PointerEventInit = {}) {
	const event = new window.PointerEvent(type, { bubbles: true, pointerId: 1, ...init });
	target.dispatchEvent(event);
}

function setNativeInputValue(input: HTMLInputElement, value: string) {
	const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
	valueSetter?.call(input, value);
	input.dispatchEvent(new Event("input", { bubbles: true }));
}

function setTrackRect(trackElement: Element, left: number, width: number) {
	Object.defineProperty(trackElement, "getBoundingClientRect", {
		value: () =>
			({
				left,
				width,
				right: left + width,
				top: 0,
				bottom: 20,
				height: 20,
				x: left,
				y: 0,
				toJSON: () => ({})
			}) satisfies DOMRect,
		configurable: true
	});
}

function SliderInputHarness() {
	const [value, setValue] = useState<number | undefined>(12);

	return <SliderInput label="Порог" min={0} max={100} step={0.5} value={value} onChange={setValue} />;
}

function SliderRangeInputHarness() {
	const [value, setValue] = useState<[number | null, number | null] | undefined>([20, 80]);

	return <SliderRangeInput label="Период" min={0} max={100} step={10} value={value} onChange={setValue} />;
}

const monthToDayMarks = [
	{ value: 0, label: "Любой минимум", outputValue: null },
	{ value: 1, label: "1 мес.", outputValue: 30 },
	{ value: 3, label: "3 мес.", outputValue: 90 },
	{ value: 6, label: "6 мес.", outputValue: 180 },
	{ value: 12, label: "12 мес.", outputValue: 360 },
	{ value: 25, label: "Любой максимум", outputValue: null }
] as const;

const riskMarks = [
	{ value: 0, label: "0", readonlyLabel: "без рисков" },
	{ value: 1, label: "1", readonlyLabel: "низкий риск" },
	{ value: 2, label: "2", readonlyLabel: "средний риск" },
	{ value: 3, label: "3", readonlyLabel: "высокий риск" }
] as const;

function SliderRangeReadonlyTextHarness() {
	const [value, setValue] = useState<[number | null, number | null] | undefined>([null, 180]);

	return (
		<>
			<SliderRangeInput
				label="Период"
				min={0}
				max={25}
				marks={monthToDayMarks}
				marksPosition="index"
				value={value}
				onChange={setValue}
				readonlyValueText
				placeholder="Любой срок"
			/>
			<button type="button" onClick={() => setValue([90, null])}>
				start-open-end
			</button>
			<button type="button" onClick={() => setValue([180, 180])}>
				equal
			</button>
			<button type="button" onClick={() => setValue([90, 180])}>
				closed
			</button>
			<button type="button" onClick={() => setValue([null, null])}>
				open
			</button>
		</>
	);
}

function SliderRangeReadonlyLabelHarness() {
	const [value, setValue] = useState<[number | null, number | null] | undefined>([1, 3]);

	return <SliderRangeInput label="Риски" min={0} max={3} marks={riskMarks} value={value} onChange={setValue} readonlyValueText />;
}

function SliderRangeDelayedCommitHarness({ onCommit }: { onCommit: (value: [number | null, number | null]) => void }) {
	const [value, setValue] = useState<[number | null, number | null] | undefined>([20, 80]);

	const handleChange = (nextValue: [number | null, number | null]) => {
		onCommit(nextValue);
		setValue(nextValue);
	};

	return <SliderRangeInput label="Период" min={0} max={100} step={10} value={value} onChange={handleChange} />;
}

let container: HTMLDivElement | null = null;
let root: Root | null = null;

async function renderNode(node: React.ReactNode) {
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);

	await act(async () => {
		root!.render(node);
	});
}

afterEach(async () => {
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

describe("SliderInput", () => {
	it("коммитит ручной ввод на blur и на Enter", async () => {
		await renderNode(<SliderInputHarness />);

		const input = container?.querySelector("input[type='text']") as HTMLInputElement;

		await act(async () => {
			input.focus();
			setNativeInputValue(input, "17,4");
			input.blur();
		});
		expect(input.value).toBe("17.5");

		await act(async () => {
			setNativeInputValue(input, "101");
			input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
		});
		expect(input.value).toBe("100");
	});

	it("откатывает невалидный draft и управляет popover через шеврон", async () => {
		await renderNode(<SliderInputHarness />);

		const input = container?.querySelector("input[type='text']") as HTMLInputElement;
		const openButton = container?.querySelector('button[aria-label="Открыть слайдер"]') as HTMLButtonElement;

		await act(async () => {
			input.focus();
			setNativeInputValue(input, "abc");
			input.blur();
		});
		expect(input.value).toBe("12");

		await act(async () => {
			openButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});
		expect(document.querySelectorAll('[role="slider"]')).toHaveLength(1);

		const closeButton = document.querySelector('button[aria-label="Закрыть слайдер"]') as HTMLButtonElement;

		await act(async () => {
			closeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});
		expect(document.querySelectorAll('[role="slider"]')).toHaveLength(0);
	});

	it("синхронизирует текстовое поле при изменении значения в popover slider", async () => {
		await renderNode(<SliderInputHarness />);

		const input = container?.querySelector("input[type='text']") as HTMLInputElement;
		const openButton = container?.querySelector('button[aria-label="Открыть слайдер"]') as HTMLButtonElement;

		await act(async () => {
			openButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		const track = document.querySelector('[data-slot="track"]') as HTMLDivElement;
		setTrackRect(track, 0, 100);

		await act(async () => {
			dispatchPointer(track, "pointerdown", { clientX: 89 });
			dispatchPointer(window, "pointerup", { clientX: 89 });
		});

		expect(input.value).toBe("89");
	});

	it("коммитит range-сегменты, сортирует finite значения и поддерживает пустоту как null", async () => {
		await renderNode(<SliderRangeInputHarness />);

		const startInput = container?.querySelector('input[aria-label="Начало диапазона"]') as HTMLInputElement;
		const endInput = container?.querySelector('input[aria-label="Конец диапазона"]') as HTMLInputElement;

		await act(async () => {
			startInput.focus();
			setNativeInputValue(startInput, "90");
			startInput.blur();
		});
		expect(startInput.value).toBe("80");
		expect(endInput.value).toBe("90");

		await act(async () => {
			startInput.focus();
			setNativeInputValue(startInput, "");
			startInput.blur();
		});
		expect(startInput.value).toBe("-∞");
		expect(endInput.value).toBe("90");
	});

	it("откатывает невалидный range draft и синхронизируется с popover slider", async () => {
		await renderNode(<SliderRangeInputHarness />);

		const startInput = container?.querySelector('input[aria-label="Начало диапазона"]') as HTMLInputElement;
		const endInput = container?.querySelector('input[aria-label="Конец диапазона"]') as HTMLInputElement;
		const openButton = container?.querySelector('button[aria-label="Открыть слайдер"]') as HTMLButtonElement;

		await act(async () => {
			startInput.focus();
			setNativeInputValue(startInput, "abc");
			startInput.blur();
		});
		expect(startInput.value).toBe("20");
		expect(endInput.value).toBe("80");

		await act(async () => {
			openButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		const track = document.querySelector('[data-slot="track"]') as HTMLDivElement;
		setTrackRect(track, 0, 100);

		await act(async () => {
			dispatchPointer(track, "pointerdown", { clientX: 10 });
			dispatchPointer(window, "pointerup", { clientX: 10 });
		});

		expect(startInput.value).toBe("10");
		expect(endInput.value).toBe("80");
	});

	it("коммитит изменение range из popover только при закрытии", async () => {
		const onCommit = vi.fn();
		await renderNode(<SliderRangeDelayedCommitHarness onCommit={onCommit} />);

		const startInput = container?.querySelector('input[aria-label="Начало диапазона"]') as HTMLInputElement;
		const openButton = container?.querySelector('button[aria-label="Открыть слайдер"]') as HTMLButtonElement;

		await act(async () => {
			openButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		const track = document.querySelector('[data-slot="track"]') as HTMLDivElement;
		setTrackRect(track, 0, 100);

		await act(async () => {
			dispatchPointer(track, "pointerdown", { clientX: 10 });
			dispatchPointer(window, "pointerup", { clientX: 10 });
		});

		expect(startInput.value).toBe("10");
		expect(onCommit).not.toHaveBeenCalled();

		const closeButton = document.querySelector('button[aria-label="Закрыть слайдер"]') as HTMLButtonElement;
		await act(async () => {
			closeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(onCommit).toHaveBeenCalledTimes(1);
		expect(onCommit).toHaveBeenLastCalledWith([10, 80]);
	});

	it("показывает текстовое значение range вместо ручного ввода", async () => {
		await renderNode(<SliderRangeReadonlyTextHarness />);

		expect(container?.textContent).toContain("Меньше 6 мес.");
		expect(container?.querySelector('input[aria-label="Начало диапазона"]')).toBeNull();

		await act(async () => {
			findButtonByText("start-open-end")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});
		expect(container?.textContent).toContain("Больше 3 мес.");

		await act(async () => {
			findButtonByText("equal")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});
		expect(container?.textContent).toContain("Равно 6 мес.");

		await act(async () => {
			findButtonByText("closed")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});
		expect(container?.textContent).toContain("От 3 мес. до 6 мес.");

		await act(async () => {
			findButtonByText("open")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});
		expect(container?.textContent).toContain("Любой срок");
	});

	it("для readonlyValueText использует readonlyLabel вместо подписи mark на шкале", async () => {
		await renderNode(<SliderRangeReadonlyLabelHarness />);

		expect(container?.textContent).toContain("От низкий риск до высокий риск");
		expect(container?.textContent).not.toContain("От 1 до 3");
	});
});

function findButtonByText(text: string) {
	return Array.from(container?.querySelectorAll<HTMLButtonElement>("button") ?? []).find((button) => button.textContent === text);
}
