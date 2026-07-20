// @vitest-environment jsdom

import { act, useState } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TreeMultiSelect } from "./TreeMultiSelect";

import type { TreeMultiSelectValue, TreeSelectNode } from "./types";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
window.HTMLElement.prototype.scrollIntoView = () => undefined;
window.matchMedia = (query: string): MediaQueryList => ({
	matches: false,
	media: query,
	onchange: null,
	addListener: () => undefined,
	removeListener: () => undefined,
	addEventListener: () => undefined,
	removeEventListener: () => undefined,
	dispatchEvent: () => false
});

const NODES: TreeSelectNode[] = [
	{
		id: "DIV:01",
		codeKey: "DIV",
		value: "01",
		label: "Дивизион 1",
		searchText: "01 Дивизион 1",
		children: [
			{
				id: "DIV:01/BR:001",
				codeKey: "BR",
				value: "001",
				label: "Филиал 1",
				searchText: "001 Филиал 1"
			},
			{
				id: "DIV:01/BR:002",
				codeKey: "BR",
				value: "002",
				label: "Филиал 2",
				searchText: "002 Филиал 2"
			}
		]
	},
	{
		id: "DIV:02",
		codeKey: "DIV",
		value: "02",
		label: "Дивизион 2",
		searchText: "02 Дивизион 2"
	}
];

function Harness({
	initialValue,
	nodes = NODES,
	label = "Оргструктура"
}: {
	initialValue: TreeMultiSelectValue;
	nodes?: TreeSelectNode[];
	label?: string | null;
}) {
	const [value, setValue] = useState(initialValue);

	return (
		<>
			<TreeMultiSelect label={label} nodes={nodes} value={value} onChange={setValue} optionsLayout="columns" />
			<output data-testid="value">{JSON.stringify(value)}</output>
		</>
	);
}

let container: HTMLDivElement | null = null;
let root: Root | null = null;

async function renderHarness(initialValue: TreeMultiSelectValue, nodes = NODES, label: string | null = "Оргструктура") {
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);

	await act(async () => root?.render(<Harness initialValue={initialValue} nodes={nodes} label={label} />));

	const toggleButton = container.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement;
	await act(async () => toggleButton.click());
}

afterEach(async () => {
	if (root) {
		await act(async () => root?.unmount());
	}

	container?.remove();
	container = null;
	root = null;
	document.body.innerHTML = "";
});

describe("TreeMultiSelect columns layout", () => {
	it("сразу показывает все уровни чекбоксами без экспандеров", async () => {
		await renderHarness({ DIV: ["01"] });

		const options = Array.from(document.querySelectorAll<HTMLElement>('[data-ui="tree-select-option"]'));
		const checkBoxes = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));

		expect(options).toHaveLength(4);
		expect(checkBoxes).toHaveLength(4);
		expect(document.querySelector('[data-ui="tree-select-expander"]')).toBeNull();
		expect(checkBoxes[0]?.checked).toBe(true);
		expect(checkBoxes[1]?.checked).toBe(true);
		expect(document.querySelector('[role="dialog"]')).toBeTruthy();
		expect(document.querySelector('[role="listbox"]')).toBeNull();
		expect(checkBoxes.every((checkBox) => checkBox.tabIndex === 0 && checkBox.getAttribute("aria-hidden") === null)).toBe(true);

		await vi.waitFor(() => {
			expect((document.querySelector('[role="dialog"]') as HTMLElement).style.getPropertyValue("--tree-column-count")).not.toBe("");
		});
	});

	it("показывает mixed-состояние parent при выборе одного descendant", async () => {
		await renderHarness({ BR: ["001"] });

		const checkBoxes = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
		expect(checkBoxes[0]?.indeterminate).toBe(true);
		expect(checkBoxes[0]?.getAttribute("aria-checked")).toBe("mixed");
		expect(checkBoxes[1]?.checked).toBe(true);
	});

	it("выбирает и снимает всё без закрытия popover", async () => {
		await renderHarness({});

		const selectAllButton = document.querySelector('[data-action="select-all"]') as HTMLButtonElement;
		const deselectAllButton = document.querySelector('[data-action="deselect-all"]') as HTMLButtonElement;

		await act(async () => selectAllButton.click());
		expect(container?.querySelector('[data-testid="value"]')?.textContent).toBe('{"DIV":["01","02"]}');
		expect(document.querySelector('[role="dialog"]')).toBeTruthy();

		await act(async () => deselectAllButton.click());
		expect(container?.querySelector('[data-testid="value"]')?.textContent).toBe("{}");
		expect(document.querySelector('[role="dialog"]')).toBeTruthy();
	});

	it("переводит Tab с combobox на toolbar и оставляет checkbox доступными", async () => {
		await renderHarness({});

		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;
		await act(async () => {
			input.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
		});

		expect(document.activeElement).toBe(document.querySelector('[data-action="select-all"]'));
		expect(document.querySelector('input[aria-label="Выбрать Дивизион 1"]')).toBeTruthy();
	});

	it("задаёт dialog доступное имя из placeholder без видимого label", async () => {
		await renderHarness({}, NODES, null);

		expect(document.querySelector('[role="dialog"]')?.getAttribute("aria-label")).toBe("Выберите значения");
	});

	it("не включает disabled-опции в массовый выбор", async () => {
		const nodesWithDisabled: TreeSelectNode[] = [
			{
				...NODES[0],
				children: [NODES[0].children![0], { ...NODES[0].children![1], disabled: true }]
			},
			{ ...NODES[1], disabled: true }
		];
		await renderHarness({}, nodesWithDisabled);

		const disabledOptions = Array.from(document.querySelectorAll<HTMLElement>('[data-ui="tree-select-option"][aria-disabled="true"]'));
		const disabledCheckBoxes = disabledOptions.map((option) => option.querySelector('input[type="checkbox"]') as HTMLInputElement);
		expect(disabledOptions).toHaveLength(2);
		expect(disabledCheckBoxes.every((checkBox) => checkBox.disabled)).toBe(true);

		await act(async () => (document.querySelector('[data-action="select-all"]') as HTMLButtonElement).click());
		expect(container?.querySelector('[data-testid="value"]')?.textContent).toBe('{"BR":["001"]}');
	});
});
