// @vitest-environment jsdom

import React, { act } from "react";

import { fireEvent, waitForElementToBeRemoved } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContextMenu } from "./components/ContextMenu";
import { DropdownMenu } from "./components/DropdownMenu";

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
	const menu = document.body.querySelector('[role="menu"]');
	if (!menu) return;
	await waitForElementToBeRemoved(menu);
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

function DelegatedRadialMenuHarness() {
	return (
		<ContextMenu>
			<ContextMenu.Trigger
				resolveTrigger={(eventTarget) =>
					eventTarget instanceof Element ? (eventTarget.closest<HTMLElement>('[data-context-menu-target="true"]') ?? null) : null
				}>
				<div data-testid="delegated-surface">
					<button type="button" data-testid="delegated-target" data-context-menu-target="true" />
					<span data-testid="delegated-outside" />
				</div>
			</ContextMenu.Trigger>
			<ContextMenu.RadialContent>
				<ContextMenu.RadialItem>Команда</ContextMenu.RadialItem>
			</ContextMenu.RadialContent>
		</ContextMenu>
	);
}

function DropdownMenuHarness({ onLinkSelect = vi.fn() } = {}) {
	return (
		<>
			<button type="button" data-testid="before-dropdown">
				Предыдущее действие
			</button>
			<DropdownMenu>
				<DropdownMenu.Trigger>
					<button type="button" data-testid="dropdown-trigger">
						Действия
					</button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Item disabled>Недоступно</DropdownMenu.Item>
					<DropdownMenu.Item>Редактировать</DropdownMenu.Item>
					<DropdownMenu.Item href="#copy" onSelect={onLinkSelect}>
						Копировать
					</DropdownMenu.Item>
					<DropdownMenu.Item>Удалить</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu>
			<button type="button" data-testid="after-dropdown">
				Следующее действие
			</button>
		</>
	);
}

function ContextMenuHarness() {
	return (
		<ContextMenu>
			<ContextMenu.Trigger>
				<div data-testid="context-trigger">Область документа</div>
			</ContextMenu.Trigger>
			<ContextMenu.Content>
				<ContextMenu.Item>Переименовать</ContextMenu.Item>
				<ContextMenu.Item>Удалить</ContextMenu.Item>
			</ContextMenu.Content>
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
		expect((document.activeElement as HTMLElement).tabIndex).toBe(-1);

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

	it("делегирует открытие и возврат фокуса конкретной вложенной цели", async () => {
		await renderNode(<DelegatedRadialMenuHarness />);

		const target = container?.querySelector('[data-testid="delegated-target"]') as HTMLButtonElement;
		setTriggerRect(target, { left: 200, top: 200, width: 100, height: 60, right: 300, bottom: 260, x: 200, y: 200 });
		target.focus();

		await act(async () => {
			fireEvent.keyDown(target, { key: "F10", shiftKey: true });
			await new Promise((resolve) => window.requestAnimationFrame(resolve));
		});

		expect(document.body.querySelector('[role="menu"]')).not.toBeNull();

		await act(async () => {
			fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
		});
		await waitForMotionExit();
		expect(document.activeElement).toBe(target);
	});

	it("не открывает меню вне делегированной цели", async () => {
		await renderNode(<DelegatedRadialMenuHarness />);

		const outside = container?.querySelector('[data-testid="delegated-outside"]') as HTMLElement;
		await openByContextMenu(outside);

		expect(document.body.querySelector('[role="menu"]')).toBeNull();
	});
});

describe("ContextMenu accessibility", () => {
	it("делает обычную контекстную область доступной с клавиатуры и связывает её с меню", async () => {
		await renderNode(<ContextMenuHarness />);

		const trigger = container?.querySelector('[data-testid="context-trigger"]') as HTMLElement;
		expect(trigger.tabIndex).toBe(0);
		expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
		expect(trigger.hasAttribute("aria-expanded")).toBe(false);

		trigger.focus();
		await act(async () => {
			fireEvent.keyDown(trigger, { key: "F10", shiftKey: true });
			await new Promise((resolve) => window.requestAnimationFrame(resolve));
		});

		const menu = document.body.querySelector('[role="menu"]') as HTMLElement;
		expect(trigger.getAttribute("aria-controls")).toBe(menu.id);
		expect(menu.getAttribute("aria-labelledby")).toBe(trigger.id);
		expect(document.activeElement).toBe(document.body.querySelector('[data-menu-item="true"]'));
	});

	it("возвращает фокус в обычное меню при повторном правом клике", async () => {
		await renderNode(<ContextMenuHarness />);

		const trigger = container?.querySelector('[data-testid="context-trigger"]') as HTMLElement;
		await openByContextMenu(trigger);
		await act(async () => {
			await new Promise((resolve) => window.requestAnimationFrame(resolve));
		});

		(document.activeElement as HTMLElement).blur();
		await openByContextMenu(trigger, { x: 420, y: 300 });
		await act(async () => {
			await new Promise((resolve) => window.requestAnimationFrame(resolve));
		});

		expect(document.activeElement).toBe(document.body.querySelector('[data-menu-item="true"]'));
	});
});

describe("DropdownMenu accessibility", () => {
	it("открывается стрелками и выбирает первый или последний доступный пункт", async () => {
		await renderNode(<DropdownMenuHarness />);

		const trigger = container?.querySelector('[data-testid="dropdown-trigger"]') as HTMLButtonElement;
		trigger.focus();
		await act(async () => {
			fireEvent.keyDown(trigger, { key: "ArrowDown" });
			await new Promise((resolve) => window.requestAnimationFrame(resolve));
		});

		let menu = document.body.querySelector('[role="menu"]') as HTMLElement;
		let items = Array.from(menu.querySelectorAll<HTMLElement>('[data-menu-item="true"]:not([data-disabled="true"])'));
		expect(trigger.getAttribute("aria-expanded")).toBe("true");
		expect(trigger.getAttribute("aria-controls")).toBe(menu.id);
		expect(menu.getAttribute("aria-labelledby")).toBe(trigger.id);
		expect(document.activeElement).toBe(items[0]);

		await act(async () => {
			fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
		});
		await waitForMotionExit();

		await act(async () => {
			fireEvent.keyDown(trigger, { key: "ArrowUp" });
			await new Promise((resolve) => window.requestAnimationFrame(resolve));
		});

		menu = document.body.querySelector('[role="menu"]') as HTMLElement;
		items = Array.from(menu.querySelectorAll<HTMLElement>('[data-menu-item="true"]:not([data-disabled="true"])'));
		expect(document.activeElement).toBe(items[items.length - 1]);
	});

	it("поддерживает поиск по первой букве и закрывается по Tab", async () => {
		const user = userEvent.setup();
		await renderNode(<DropdownMenuHarness />);

		const trigger = container?.querySelector('[data-testid="dropdown-trigger"]') as HTMLButtonElement;
		await act(async () => {
			fireEvent.click(trigger);
			await new Promise((resolve) => window.requestAnimationFrame(resolve));
		});

		await act(async () => {
			fireEvent.keyDown(document.activeElement as HTMLElement, { key: "у" });
		});
		expect(document.activeElement?.textContent).toContain("Удалить");

		await user.tab();
		await waitForMotionExit();
		expect(document.body.querySelector('[role="menu"]')).toBeNull();
		expect(document.activeElement).toBe(container?.querySelector('[data-testid="after-dropdown"]'));

		trigger.focus();
		await act(async () => {
			fireEvent.click(trigger);
			await new Promise((resolve) => window.requestAnimationFrame(resolve));
		});
		await user.tab({ shift: true });
		await waitForMotionExit();
		expect(document.activeElement).toBe(container?.querySelector('[data-testid="before-dropdown"]'));
	});

	it("активирует пункт-ссылку клавишей Space", async () => {
		const onLinkSelect = vi.fn();
		await renderNode(<DropdownMenuHarness onLinkSelect={onLinkSelect} />);

		const trigger = container?.querySelector('[data-testid="dropdown-trigger"]') as HTMLButtonElement;
		await act(async () => {
			fireEvent.click(trigger);
			await new Promise((resolve) => window.requestAnimationFrame(resolve));
		});

		const link = document.body.querySelector('a[role="menuitem"]') as HTMLAnchorElement;
		link.focus();
		await act(async () => {
			fireEvent.keyDown(link, { key: " " });
		});
		await waitForMotionExit();

		expect(onLinkSelect).toHaveBeenCalledTimes(1);
		expect(document.body.querySelector('[role="menu"]')).toBeNull();
	});
});
