// @vitest-environment jsdom

import React, { act, useState } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import { TreeSelect } from "./TreeSelect";
import { TreeSelectNode, TreeSelectValue } from "./types";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
window.HTMLElement.prototype.scrollIntoView = () => {};

const NODES: TreeSelectNode[] = [
	{
		id: "DIV:01",
		codeKey: "DIV",
		value: "01",
		label: "Корень 1",
		code: "01",
		searchText: "01 Корень 1",
		children: [
			{
				id: "DIV:01/BR:001",
				codeKey: "BR",
				value: "001",
				label: "Ветка 1",
				code: "001",
				searchText: "001 Ветка 1"
			}
		]
	},
	{
		id: "DIV:02",
		codeKey: "DIV",
		value: "02",
		label: "Корень 2",
		code: "02",
		searchText: "02 Корень 2"
	}
];

function TreeSelectHarness() {
	const [value, setValue] = useState<TreeSelectValue | undefined>({ codeKey: "BR", value: "001" });

	return <TreeSelect label="Дерево" placeholder="Выберите узел" nodes={NODES} value={value} onChange={setValue} />;
}

function ClearableTreeSelectHarness() {
	const [value, setValue] = useState<TreeSelectValue | undefined>({ codeKey: "BR", value: "001" });

	return <TreeSelect label="Дерево" placeholder="Выберите узел" clearable nodes={NODES} value={value} onChange={setValue} />;
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

describe("TreeSelect", () => {
	it("использует trigger-input для поиска и сбрасывает query после закрытия", async () => {
		await renderNode(<TreeSelectHarness />);

		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;
		expect(input).toBeTruthy();
		expect(input.value).toBe("Ветка 1 · 001");

		await act(async () => {
			input.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(document.querySelectorAll('[role="option"]')).toHaveLength(0);

		const toggleButton = container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement;

		await act(async () => {
			toggleButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(document.activeElement).toBe(input);
		expect(document.querySelectorAll('[role="option"]').length).toBeGreaterThan(0);

		expect(document.querySelectorAll('input[role="combobox"]').length).toBe(1);

		await act(async () => {
			const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
			valueSetter?.call(input, "Корень 2");
			input.dispatchEvent(new Event("input", { bubbles: true }));
		});

		const options = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
		expect(options).toHaveLength(1);
		expect(options[0]?.textContent).toContain("Корень 2");

		const closeButton = document.querySelector('button[aria-label="Закрыть список"]') as HTMLButtonElement;

		await act(async () => {
			closeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(input.value).toBe("Ветка 1 · 001");
		expect(input.getAttribute("aria-expanded")).toBe("false");
		expect(document.activeElement).toBe(input);
	});

	it("не показывает кнопку очистки без clearable", async () => {
		await renderNode(<TreeSelectHarness />);

		expect(container?.querySelector('button[aria-label="Очистить выбор"]')).toBeNull();
	});

	it("очищает выбранный узел при clearable", async () => {
		await renderNode(<ClearableTreeSelectHarness />);

		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;
		const clearButton = container?.querySelector('button[aria-label="Очистить выбор"]') as HTMLButtonElement;
		expect(clearButton).toBeTruthy();

		await act(async () => {
			clearButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(input.value).toBe("");
		expect(input.placeholder).toBe("Выберите узел");
		expect(input.getAttribute("aria-expanded")).toBe("false");
		expect(container?.querySelector('button[aria-label="Очистить выбор"]')).toBeNull();
	});

	it("не помечает descendants выбранными в single-select", async () => {
		await renderNode(<TreeSelect label="Дерево" nodes={NODES} value={{ codeKey: "DIV", value: "01" }} onChange={() => undefined} />);

		await act(async () => (container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement).click());
		await act(async () => (document.querySelector('[data-ui="tree-select-expander"]') as HTMLButtonElement).click());

		const options = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
		expect(options[0]?.getAttribute("aria-selected")).toBe("true");
		expect(options[1]?.getAttribute("aria-selected")).toBe("false");
	});
});
