// @vitest-environment jsdom

import { fireEvent, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TabsBox } from "./TabsBox";
import { TabsLayout } from "./TabsLayout";

const items = [
	{ id: "first", title: "Первая", content: <div>Содержимое первой</div> },
	{ id: "disabled", title: "Недоступная", disabled: true, content: <div>Недоступное содержимое</div> },
	{ id: "third", title: "Третья", content: <div>Содержимое третьей</div> }
];

window.HTMLElement.prototype.scrollTo = () => undefined;

afterEach(() => {
	document.body.innerHTML = "";
});

describe("Tabs", () => {
	it("связывает каждую вкладку с постоянно присутствующей панелью", () => {
		const { getByRole } = render(<TabsBox items={items} defaultValue="first" mountStrategy="unmount" />);
		const tabList = getByRole("tablist", { name: "Вкладки" });
		const tabs = within(tabList).getAllByRole("tab");

		expect(tabs).toHaveLength(items.length);
		expect(tabs.every((tab) => tab.parentElement === tabList)).toBe(true);

		for (const tab of tabs) {
			const panelId = tab.getAttribute("aria-controls");
			const panel = panelId ? document.getElementById(panelId) : null;

			expect(panel?.getAttribute("role")).toBe("tabpanel");
			expect(panel?.getAttribute("aria-labelledby")).toBe(tab.id);
		}

		const panels = document.querySelectorAll<HTMLElement>('[role="tabpanel"]');
		expect(panels).toHaveLength(items.length);
		expect(panels[0]?.hidden).toBe(false);
		expect(panels[0]?.tabIndex).toBe(0);
		expect(panels[1]?.hidden).toBe(true);
		expect(panels[1]?.tabIndex).toBe(-1);
		expect(panels[1]?.textContent).toBe("");
	});

	it("в automatic-режиме пропускает disabled-вкладку и активирует следующую стрелкой", () => {
		const onValueChange = vi.fn<(value: string) => void>();
		const { getByRole } = render(<TabsBox items={items} defaultValue="first" onValueChange={onValueChange} aria-label="Разделы" />);
		const tabs = within(getByRole("tablist", { name: "Разделы" })).getAllByRole("tab");

		tabs[0]?.focus();
		fireEvent.keyDown(tabs[0] as HTMLElement, { key: "ArrowRight" });

		expect(document.activeElement).toBe(tabs[2]);
		expect(tabs[0]?.getAttribute("aria-selected")).toBe("false");
		expect(tabs[2]?.getAttribute("aria-selected")).toBe("true");
		expect(onValueChange).toHaveBeenCalledOnce();
		expect(onValueChange).toHaveBeenCalledWith("third");
	});

	it("в manual-режиме перемещает фокус стрелкой и активирует вкладку через Enter", async () => {
		const user = userEvent.setup();
		const onValueChange = vi.fn<(value: string) => void>();
		const { getByRole } = render(
			<TabsBox items={items} defaultValue="first" onValueChange={onValueChange} activationMode="manual" aria-label="Разделы" />
		);
		const tabs = within(getByRole("tablist", { name: "Разделы" })).getAllByRole("tab");

		tabs[0]?.focus();
		fireEvent.keyDown(tabs[0] as HTMLElement, { key: "ArrowRight" });

		expect(document.activeElement).toBe(tabs[2]);
		expect(tabs[0]?.getAttribute("aria-selected")).toBe("true");
		expect(onValueChange).not.toHaveBeenCalled();

		await user.keyboard("{Enter}");

		expect(tabs[2]?.getAttribute("aria-selected")).toBe("true");
		expect(onValueChange).toHaveBeenCalledWith("third");
	});

	it("сохраняет ARIA-связи и lazy-содержимое в TabsLayout", async () => {
		const user = userEvent.setup();
		const { getByRole } = render(
			<TabsLayout defaultValue="details" aria-label="Карточка">
				<TabsLayout.Tab id="details" title="Детали">
					<TabsLayout.Content>Детали документа</TabsLayout.Content>
				</TabsLayout.Tab>
				<TabsLayout.Tab id="history" title="История">
					<TabsLayout.Content>История документа</TabsLayout.Content>
				</TabsLayout.Tab>
			</TabsLayout>
		);
		const tabs = within(getByRole("tablist", { name: "Карточка" })).getAllByRole("tab");
		const historyPanelId = tabs[1]?.getAttribute("aria-controls");
		const historyPanel = historyPanelId ? document.getElementById(historyPanelId) : null;

		expect(historyPanel?.hidden).toBe(true);
		expect(historyPanel?.textContent).toBe("");

		await user.click(tabs[1] as HTMLElement);
		expect(historyPanel?.hidden).toBe(false);
		expect(historyPanel?.textContent).toContain("История документа");

		await user.click(tabs[0] as HTMLElement);
		expect(historyPanel?.hidden).toBe(true);
		expect(historyPanel?.textContent).toContain("История документа");
	});
});
