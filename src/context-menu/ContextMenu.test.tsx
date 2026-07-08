// @vitest-environment jsdom

import React, { act } from "react";

import { fireEvent } from "@testing-library/dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContextMenu } from "./components/ContextMenu";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

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

async function waitForMotionExit() {
	await act(async () => {
		await new Promise((resolve) => window.setTimeout(resolve, 220));
	});
}

function setTriggerRect(trigger: Element, rect: Partial<DOMRect>) {
	Object.defineProperty(trigger, "getBoundingClientRect", {
		value: () =>
			({
				left: 0,
				top: 0,
				width: 160,
				height: 80,
				right: 160,
				bottom: 80,
				x: 0,
				y: 0,
				toJSON: () => ({}),
				...rect
			}) satisfies DOMRect,
		configurable: true
	});
}

function RadialMenuHarness({ onPrimary = vi.fn(), onDisabled = vi.fn() } = {}) {
	return (
		<ContextMenu>
			<ContextMenu.Trigger>
				<button type="button" data-testid="trigger">
					Открыть меню
				</button>
			</ContextMenu.Trigger>
			<ContextMenu.RadialContent>
				<ContextMenu.RadialItem onSelect={onPrimary}>Править</ContextMenu.RadialItem>
				<ContextMenu.RadialItem>Копия</ContextMenu.RadialItem>
				<ContextMenu.RadialItem disabled onSelect={onDisabled}>
					Только чтение
				</ContextMenu.RadialItem>
			</ContextMenu.RadialContent>
		</ContextMenu>
	);
}

async function openByContextMenu(trigger: HTMLElement, point = { x: 320, y: 260 }) {
	await act(async () => {
		fireEvent.contextMenu(trigger, { clientX: point.x, clientY: point.y });
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
	vi.clearAllMocks();
});

describe("ContextMenu radial", () => {
	it("открывает радиальное меню по contextmenu, показывает команды и центральную кнопку закрытия", async () => {
		await renderNode(<RadialMenuHarness />);

		const trigger = container?.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
		await openByContextMenu(trigger);

		expect(document.body.querySelector('[role="menu"]')).not.toBeNull();
		expect(document.body.querySelectorAll('[data-menu-item="true"]')).toHaveLength(4);
		expect(document.body.querySelector('[data-disabled="true"]')?.textContent).toContain("Только чтение");
		expect(document.body.querySelector('[data-radial-close="true"]')?.textContent).toContain("Закрыть");
	});

	it("вызывает onSelect и закрывает меню при клике по активному пункту", async () => {
		const onPrimary = vi.fn();
		await renderNode(<RadialMenuHarness onPrimary={onPrimary} />);

		const trigger = container?.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
		await openByContextMenu(trigger);

		await act(async () => {
			fireEvent.click(document.body.querySelectorAll('[data-menu-item="true"]')[1] as HTMLElement);
		});
		await waitForMotionExit();

		expect(onPrimary).toHaveBeenCalledTimes(1);
		expect(document.body.querySelector('[role="menu"]')).toBeNull();
	});

	it("ставит фокус на центральную кнопку и навигируется стрелками по пунктам меню", async () => {
		await renderNode(<RadialMenuHarness />);

		const trigger = container?.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
		await openByContextMenu(trigger);

		await act(async () => {
			await new Promise((resolve) => window.requestAnimationFrame(resolve));
		});

		const items = Array.from(document.body.querySelectorAll<HTMLElement>('[data-menu-item="true"]:not([data-disabled="true"])'));
		expect(document.activeElement).toBe(document.body.querySelector('[data-radial-close="true"]'));

		await act(async () => {
			fireEvent.keyDown(document.activeElement as HTMLElement, { key: "ArrowRight" });
		});
		expect(document.activeElement).toBe(items[1]);

		await act(async () => {
			fireEvent.keyDown(document.activeElement as HTMLElement, { key: "ArrowLeft" });
		});
		expect(document.activeElement).toBe(items[0]);
	});

	it("возвращает фокус в меню при повторном contextmenu без предварительного закрытия", async () => {
		await renderNode(<RadialMenuHarness />);

		const trigger = container?.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
		await openByContextMenu(trigger, { x: 320, y: 260 });

		await act(async () => {
			await new Promise((resolve) => window.requestAnimationFrame(resolve));
		});

		expect(document.activeElement).toBe(document.body.querySelector('[data-radial-close="true"]'));
		(document.activeElement as HTMLElement).blur();
		expect(document.activeElement).toBe(document.body);

		await openByContextMenu(trigger, { x: 380, y: 320 });

		await act(async () => {
			await new Promise((resolve) => window.requestAnimationFrame(resolve));
		});

		const menu = document.body.querySelector('[role="menu"]') as HTMLElement;
		expect(menu).not.toBeNull();
		expect(document.activeElement).toBe(document.body.querySelector('[data-radial-close="true"]'));
	});

	it("не вызывает onSelect для заблокированного пункта", async () => {
		const onDisabled = vi.fn();
		await renderNode(<RadialMenuHarness onDisabled={onDisabled} />);

		const trigger = container?.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
		await openByContextMenu(trigger);

		await act(async () => {
			fireEvent.click(document.body.querySelector('[data-disabled="true"]') as HTMLElement);
		});

		expect(onDisabled).not.toHaveBeenCalled();
		expect(document.body.querySelector('[role="menu"]')).not.toBeNull();
	});

	it("закрывает радиальное меню по Escape", async () => {
		await renderNode(<RadialMenuHarness />);

		const trigger = container?.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
		await openByContextMenu(trigger);

		await act(async () => {
			fireEvent.keyDown(document, { key: "Escape" });
		});
		await waitForMotionExit();

		expect(document.body.querySelector('[role="menu"]')).toBeNull();
	});

	it("закрывает радиальное меню центральной кнопкой", async () => {
		await renderNode(<RadialMenuHarness />);

		const trigger = container?.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
		await openByContextMenu(trigger);

		await act(async () => {
			fireEvent.click(document.body.querySelector('[data-radial-close="true"]') as HTMLElement);
		});
		await waitForMotionExit();

		expect(document.body.querySelector('[role="menu"]')).toBeNull();
	});

	it("открывает радиальное меню от центра trigger-элемента при Shift+F10", async () => {
		await renderNode(<RadialMenuHarness />);

		const trigger = container?.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
		setTriggerRect(trigger, {
			left: 200,
			top: 200,
			width: 200,
			height: 100,
			right: 400,
			bottom: 300,
			x: 200,
			y: 200
		});

		await act(async () => {
			fireEvent.keyDown(trigger, { key: "F10", shiftKey: true });
		});

		const menu = document.body.querySelector('[role="menu"]') as HTMLElement;
		expect(menu).not.toBeNull();
		expect(menu.style.left).toBe("192px");
		expect(menu.style.top).toBe("142px");
	});
});
