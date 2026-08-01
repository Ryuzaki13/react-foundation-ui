// @vitest-environment jsdom

import { act } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { List } from "./List";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;
const initialOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");
const initialOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");
const initialGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;

beforeAll(() => {
	Object.defineProperties(HTMLElement.prototype, {
		offsetHeight: { configurable: true, get: () => 240 },
		offsetWidth: { configurable: true, get: () => 400 }
	});

	HTMLElement.prototype.getBoundingClientRect = () =>
		({
			left: 0,
			top: 0,
			width: 400,
			height: 120,
			right: 400,
			bottom: 120,
			x: 0,
			y: 0,
			toJSON: () => ({})
		}) satisfies DOMRect;
});

afterAll(() => {
	if (initialOffsetHeight) {
		Object.defineProperty(HTMLElement.prototype, "offsetHeight", initialOffsetHeight);
	} else {
		Reflect.deleteProperty(HTMLElement.prototype, "offsetHeight");
	}
	if (initialOffsetWidth) {
		Object.defineProperty(HTMLElement.prototype, "offsetWidth", initialOffsetWidth);
	} else {
		Reflect.deleteProperty(HTMLElement.prototype, "offsetWidth");
	}
	HTMLElement.prototype.getBoundingClientRect = initialGetBoundingClientRect;
});

afterEach(async () => {
	if (root) {
		await act(async () => root?.unmount());
	}

	container?.remove();
	container = null;
	root = null;
});

describe("List.VirtualizedContent", () => {
	it("подписывается на scroll runtime и меняет окно видимых элементов", async () => {
		const items = Array.from({ length: 40 }, (_, index) => ({ id: String(index), label: `Элемент ${index}` }));
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);

		await act(async () => {
			root?.render(
				<List.VirtualizedContent
					items={items}
					getKey={(item) => item.id}
					render={(item) => item.label}
					hasNextPage={false}
					fetchNextPage={vi.fn()}
				/>
			);
		});

		const initialRows = Array.from(container.querySelectorAll("li"));
		expect(initialRows.length).toBeGreaterThan(0);
		expect(initialRows.length).toBeLessThan(items.length);
		expect(container.textContent).toContain("Элемент 0");

		const scrollElement = container.querySelector(".scrollable") as HTMLDivElement;
		await act(async () => {
			scrollElement.scrollTop = 1200;
			scrollElement.dispatchEvent(new Event("scroll"));
		});

		expect(container.textContent).toContain("Элемент 10");
		expect(container.textContent).not.toContain("Элемент 0");
	});
});
