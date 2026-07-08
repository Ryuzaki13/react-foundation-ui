// @vitest-environment jsdom

import React, { act, useState } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import type { SliderRangeValue } from "./lib";
import { Slider, SliderRange } from "./Slider";

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

function SingleSliderHarness() {
	const [value, setValue] = useState<number | undefined>(50);

	return <Slider label="Громкость" min={0} max={100} step={10} value={value} onChange={setValue} />;
}

function RangeSliderHarness() {
	const [value, setValue] = useState<SliderRangeValue | undefined>([20, 80]);

	return <SliderRange label="Диапазон" min={0} max={100} step={10} value={value} onChange={setValue} />;
}

const monthMarks = [
	{ value: 1, label: "1" },
	{ value: 3, label: "3" },
	{ value: 6, label: "6" },
	{ value: 9, label: "9" },
	{ value: 12, label: "12" },
	{ value: 18, label: "18" },
	{ value: 24, label: "24" }
] as const;

function MonthSliderHarness() {
	const [value, setValue] = useState<number | undefined>(1);

	return <Slider label="Месяцы" min={1} max={24} marks={monthMarks} marksPosition="index" value={value} onChange={setValue} />;
}

const openRangeMarks = [
	{ value: 0, label: "До", outputValue: null },
	{ value: 3, label: "3" },
	{ value: 6, label: "6" },
	{ value: 12, label: "От", outputValue: null }
] as const;

const mappedRangeMarks = [
	{ value: 0, label: "Без нижней границы", outputValue: null },
	{ value: 1, label: "1 месяц", outputValue: 30 },
	{ value: 3, label: "3 месяца", outputValue: 90 },
	{ value: 6, label: "6 месяцев", outputValue: 180 },
	{ value: 12, label: "12 месяцев", outputValue: 360 },
	{ value: 24, label: "24 месяца", outputValue: 720 },
	{ value: 25, label: "Без верхней границы", outputValue: null }
] as const;

function OpenRangeSliderHarness() {
	const [value, setValue] = useState<SliderRangeValue | undefined>([3, 6]);

	return <SliderRange label="Открытый диапазон" min={0} max={12} marks={openRangeMarks} value={value} onChange={setValue} />;
}

function MappedRangeSliderHarness() {
	const [value, setValue] = useState<SliderRangeValue | undefined>([30, 720]);

	return <SliderRange label="Период" min={0} max={25} marks={mappedRangeMarks} marksPosition="index" value={value} onChange={setValue} />;
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

describe("Slider", () => {
	it("поддерживает drag и клавиатурную навигацию для single-value режима", async () => {
		await renderNode(<SingleSliderHarness />);

		const track = container?.querySelector('[data-slot="track"]') as HTMLDivElement;
		const thumb = container?.querySelector('[role="slider"]') as HTMLButtonElement;
		setTrackRect(track, 0, 100);

		await act(async () => {
			dispatchPointer(thumb, "pointerdown", { clientX: 50 });
			dispatchPointer(window, "pointermove", { clientX: 82 });
			dispatchPointer(window, "pointerup", { clientX: 82 });
		});

		expect(thumb.getAttribute("aria-valuenow")).toBe("80");

		await act(async () => {
			thumb.dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown", bubbles: true }));
		});
		expect(thumb.getAttribute("aria-valuenow")).toBe("0");

		await act(async () => {
			thumb.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
		});
		expect(thumb.getAttribute("aria-valuenow")).toBe("100");

		await act(async () => {
			thumb.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
		});
		expect(thumb.getAttribute("aria-valuenow")).toBe("90");
	});

	it("клик по track двигает ближайший thumb в range-режиме и не даёт пересечь значения", async () => {
		await renderNode(<RangeSliderHarness />);

		const track = container?.querySelector('[data-slot="track"]') as HTMLDivElement;
		setTrackRect(track, 0, 100);

		await act(async () => {
			dispatchPointer(track, "pointerdown", { clientX: 68 });
			dispatchPointer(window, "pointerup", { clientX: 68 });
		});

		const thumbs = Array.from(container?.querySelectorAll<HTMLButtonElement>('[role="slider"]') ?? []);
		expect(thumbs[0]?.getAttribute("aria-valuenow")).toBe("20");
		expect(thumbs[1]?.getAttribute("aria-valuenow")).toBe("70");

		await act(async () => {
			thumbs[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
		});

		expect(thumbs[0]?.getAttribute("aria-valuenow")).toBe("70");
		expect(thumbs[1]?.getAttribute("aria-valuenow")).toBe("70");
	});

	it("поддерживает равномерное расположение marks через marksPosition=index", async () => {
		await renderNode(<MonthSliderHarness />);

		const track = container?.querySelector('[data-slot="track"]') as HTMLDivElement;
		const thumb = container?.querySelector('[role="slider"]') as HTMLButtonElement;
		setTrackRect(track, 0, 120);

		await act(async () => {
			dispatchPointer(track, "pointerdown", { clientX: 60 });
			dispatchPointer(window, "pointerup", { clientX: 60 });
		});

		expect(thumb.getAttribute("aria-valuenow")).toBe("9");
		expect(thumb.style.left).toBe("50%");
		expect((container?.querySelector('[data-slot="fill"]') as HTMLDivElement).style.width).toBe("50%");
	});

	it("выбирает null-границы через marks с outputValue=null", async () => {
		await renderNode(<OpenRangeSliderHarness />);

		const markButtons = Array.from(container?.querySelectorAll<HTMLButtonElement>('[data-slot="mark"]') ?? []);
		expect(markButtons).toHaveLength(4);

		await act(async () => {
			markButtons[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		const thumbs = Array.from(container?.querySelectorAll<HTMLButtonElement>('[role="slider"]') ?? []);
		expect(thumbs[0]?.getAttribute("aria-valuenow")).toBe("0");
		expect(thumbs[0]?.getAttribute("aria-valuetext")).toBe("До");
		expect(thumbs[1]?.getAttribute("aria-valuenow")).toBe("6");
	});

	it("отображает публичные outputValue на координатах mark.value", async () => {
		await renderNode(<MappedRangeSliderHarness />);

		const thumbs = Array.from(container?.querySelectorAll<HTMLButtonElement>('[role="slider"]') ?? []);
		expect(thumbs[0]?.getAttribute("aria-valuenow")).toBe("1");
		expect(thumbs[0]?.style.left).toBe("16.666666666666664%");
		expect(thumbs[1]?.getAttribute("aria-valuenow")).toBe("24");
		expect(thumbs[1]?.style.left).toBe("83.33333333333334%");
	});
});
