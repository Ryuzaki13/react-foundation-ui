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
				code: "001",
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

const ASYNC_NODES: TreeSelectNode[] = Array.from({ length: 12 }, (_, index) => ({
	id: `DIV:${index}`,
	codeKey: "DIV",
	value: String(index),
	label: `Дивизион ${index}`,
	searchText: `${index} Дивизион ${index}`
}));

function Harness({
	initialValue,
	nodes = NODES,
	label = "Оргструктура",
	placeholder,
	onChange
}: {
	initialValue: TreeMultiSelectValue;
	nodes?: TreeSelectNode[];
	label?: string | null;
	placeholder?: string;
	onChange?: (value: TreeMultiSelectValue) => void;
}) {
	const [value, setValue] = useState(initialValue);
	const handleChange = (nextValue: TreeMultiSelectValue) => {
		onChange?.(nextValue);
		setValue(nextValue);
	};

	return (
		<>
			<TreeMultiSelect
				label={label}
				placeholder={placeholder}
				nodes={nodes}
				value={value}
				onChange={handleChange}
				optionsLayout="columns"
			/>
			<output data-testid="value">{JSON.stringify(value)}</output>
		</>
	);
}

let container: HTMLDivElement | null = null;
let root: Root | null = null;

type RenderHarnessOptions = {
	initialValue: TreeMultiSelectValue;
	nodes?: TreeSelectNode[];
	label?: string | null;
	placeholder?: string;
	onChange?: (value: TreeMultiSelectValue) => void;
	open?: boolean;
};

async function renderHarness({
	initialValue,
	nodes = NODES,
	label = "Оргструктура",
	placeholder,
	onChange,
	open = true
}: RenderHarnessOptions) {
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);

	await act(async () =>
		root?.render(<Harness initialValue={initialValue} nodes={nodes} label={label} placeholder={placeholder} onChange={onChange} />)
	);

	if (open) {
		await openPopup();
	}
}

function getTriggerButton(action: "Открыть" | "Закрыть") {
	const button = container?.querySelector(`button[aria-label="${action} список"]`);

	if (!(button instanceof HTMLButtonElement)) {
		throw new Error(`Не найдена кнопка «${action} список»`);
	}

	return button;
}

async function openPopup() {
	await act(async () => getTriggerButton("Открыть").click());
}

async function closePopup() {
	await act(async () => getTriggerButton("Закрыть").click());
}

function getCheckBox(label: string) {
	const checkBox = document.querySelector(`input[type="checkbox"][aria-label="Выбрать ${label}"]`);

	if (!(checkBox instanceof HTMLInputElement)) {
		throw new Error(`Не найден checkbox узла «${label}»`);
	}

	return checkBox;
}

async function clickElement(element: HTMLElement) {
	await act(async () => element.click());
}

function getCommittedValueText() {
	return container?.querySelector('[data-testid="value"]')?.textContent;
}

function getOptionOrder() {
	return Array.from(document.querySelectorAll<HTMLElement>('[data-ui="tree-select-option"]')).map((option) => option.textContent?.trim());
}

function findInnermostElementWithText(text: string) {
	return Array.from(container?.querySelectorAll<HTMLElement>("*") ?? []).find(
		(element) =>
			element.textContent?.trim() === text && !Array.from(element.children).some((child) => child.textContent?.trim() === text)
	);
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
		await renderHarness({ initialValue: { DIV: ["01"] } });

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
		await renderHarness({ initialValue: { BR: ["001"] } });

		const checkBoxes = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
		expect(checkBoxes[0]?.indeterminate).toBe(true);
		expect(checkBoxes[0]?.getAttribute("aria-checked")).toBe("mixed");
		expect(checkBoxes[1]?.checked).toBe(true);
	});

	it("держит выбор checkbox в черновике и публикует его только при закрытии", async () => {
		const onChange = vi.fn<(value: TreeMultiSelectValue) => void>();
		await renderHarness({ initialValue: {}, onChange });

		const branchCheckBox = getCheckBox("Филиал 1");
		await clickElement(branchCheckBox);

		expect(branchCheckBox.checked).toBe(true);
		expect(getCommittedValueText()).toBe("{}");
		expect(onChange).not.toHaveBeenCalled();
		expect(document.querySelector('[role="dialog"]')).toBeTruthy();
		expect(findInnermostElementWithText("Филиал 1")).toBeTruthy();

		await closePopup();

		expect(getCommittedValueText()).toBe('{"BR":["001"]}');
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenLastCalledWith({ BR: ["001"] });
	});

	it("держит массовые действия в черновике до закрытия popover", async () => {
		const onChange = vi.fn<(value: TreeMultiSelectValue) => void>();
		await renderHarness({ initialValue: {}, onChange });

		const selectAllButton = document.querySelector('[data-action="select-all"]') as HTMLButtonElement;
		const deselectAllButton = document.querySelector('[data-action="deselect-all"]') as HTMLButtonElement;

		await clickElement(selectAllButton);
		expect(
			Array.from(document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')).every((checkBox) => checkBox.checked)
		).toBe(true);
		expect(getCommittedValueText()).toBe("{}");
		expect(onChange).not.toHaveBeenCalled();
		expect(document.querySelector('[role="dialog"]')).toBeTruthy();

		await clickElement(deselectAllButton);
		expect(
			Array.from(document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')).every((checkBox) => !checkBox.checked)
		).toBe(true);
		expect(getCommittedValueText()).toBe("{}");
		expect(onChange).not.toHaveBeenCalled();
		expect(document.querySelector('[role="dialog"]')).toBeTruthy();

		await clickElement(selectAllButton);
		await closePopup();

		expect(getCommittedValueText()).toBe('{"DIV":["01","02"]}');
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenLastCalledWith({ DIV: ["01", "02"] });
	});

	it("не публикует черновик, возвращённый к исходному выбору", async () => {
		const onChange = vi.fn<(value: TreeMultiSelectValue) => void>();
		await renderHarness({ initialValue: {}, onChange });

		const branchCheckBox = getCheckBox("Филиал 1");
		await clickElement(branchCheckBox);
		await clickElement(branchCheckBox);

		expect(branchCheckBox.checked).toBe(false);
		expect(getCommittedValueText()).toBe("{}");
		expect(onChange).not.toHaveBeenCalled();

		await closePopup();

		expect(getCommittedValueText()).toBe("{}");
		expect(onChange).not.toHaveBeenCalled();
	});

	it("публикует черновик при закрытии по Escape", async () => {
		const onChange = vi.fn<(value: TreeMultiSelectValue) => void>();
		await renderHarness({ initialValue: {}, onChange });

		const branchCheckBox = getCheckBox("Филиал 1");
		await clickElement(branchCheckBox);
		branchCheckBox.focus();

		await act(async () => {
			branchCheckBox.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
		});

		expect((container?.querySelector('input[role="combobox"]') as HTMLInputElement).getAttribute("aria-expanded")).toBe("false");
		expect(getCommittedValueText()).toBe('{"BR":["001"]}');
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenLastCalledWith({ BR: ["001"] });
	});

	it("после повторного открытия сохраняет порядок опций и checked-состояние", async () => {
		await renderHarness({ initialValue: {} });

		const initialOrder = getOptionOrder();
		await clickElement(getCheckBox("Филиал 1"));
		await closePopup();
		await openPopup();

		expect(getOptionOrder()).toEqual(initialOrder);
		expect(getCheckBox("Филиал 1").checked).toBe(true);
	});

	it("показывает label единственного выбранного элемента перед кнопкой очистки", async () => {
		await renderHarness({ initialValue: { BR: ["001"] }, open: false });

		const token = findInnermostElementWithText("Филиал 1");
		const clearButton = container?.querySelector('button[aria-label="Очистить выбор"]');

		expect(token).toBeTruthy();
		expect(clearButton).toBeInstanceOf(HTMLButtonElement);
		expect(token?.compareDocumentPosition(clearButton as Node) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
		expect(container?.textContent).not.toContain("Филиал 1 · 001");
	});

	it("показывает точный счётчик для нескольких выбранных элементов", async () => {
		await renderHarness({ initialValue: { BR: ["001"], DIV: ["02"] }, open: false });

		expect(findInnermostElementWithText("2 элементов")).toBeTruthy();
		expect(container?.textContent).not.toContain("Выбрано 2 узл.");
	});

	it("показывает настроенный placeholder только до выбора и сохраняет доступное имя поля", async () => {
		await renderHarness({ initialValue: {}, label: null, placeholder: "Оргструктура", open: false });

		const emptyInput = container?.querySelector('input[role="combobox"]');
		expect(emptyInput?.getAttribute("placeholder")).toBe("Оргструктура");
		expect(emptyInput?.getAttribute("aria-label")).toBe("Оргструктура");

		await act(async () =>
			root?.render(<Harness key="selected" initialValue={{ BR: ["001"] }} label={null} placeholder="Оргструктура" />)
		);

		const selectedInput = container?.querySelector('input[role="combobox"]');
		expect(selectedInput?.getAttribute("placeholder")).toBeNull();
		expect(selectedInput?.getAttribute("aria-label")).toBe("Оргструктура");
		expect(findInnermostElementWithText("Филиал 1")).toBeTruthy();
	});

	it("очищает открытый черновик через X и публикует очистку только после закрытия", async () => {
		const onChange = vi.fn<(value: TreeMultiSelectValue) => void>();
		await renderHarness({ initialValue: { BR: ["001"] }, onChange });

		const clearButton = container?.querySelector('button[aria-label="Очистить выбор"]');
		expect(clearButton).toBeInstanceOf(HTMLButtonElement);
		await clickElement(clearButton as HTMLButtonElement);

		expect(getCheckBox("Филиал 1").checked).toBe(false);
		expect(getCommittedValueText()).toBe('{"BR":["001"]}');
		expect(onChange).not.toHaveBeenCalled();
		expect(document.querySelector('[role="dialog"]')).toBeTruthy();

		await closePopup();

		expect(getCommittedValueText()).toBe("{}");
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenLastCalledWith({});
	});

	it("сразу очищает committed value через X при закрытом popover", async () => {
		const onChange = vi.fn<(value: TreeMultiSelectValue) => void>();
		await renderHarness({ initialValue: { BR: ["001"] }, onChange, open: false });

		const clearButton = container?.querySelector('button[aria-label="Очистить выбор"]');
		expect(clearButton).toBeInstanceOf(HTMLButtonElement);
		await clickElement(clearButton as HTMLButtonElement);

		expect(getCommittedValueText()).toBe("{}");
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenLastCalledWith({});
		expect(container?.querySelector('input[role="combobox"]')?.getAttribute("aria-expanded")).toBe("false");
	});

	it("переводит Tab с combobox на toolbar и оставляет checkbox доступными", async () => {
		await renderHarness({ initialValue: {} });

		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;
		await act(async () => {
			input.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
		});

		expect(document.activeElement).toBe(document.querySelector('[data-action="select-all"]'));
		expect(document.querySelector('input[aria-label="Выбрать Дивизион 1"]')).toBeTruthy();
	});

	it("задаёт dialog доступное имя из placeholder без видимого label", async () => {
		await renderHarness({ initialValue: {}, label: null });

		expect(document.querySelector('[role="dialog"]')?.getAttribute("aria-label")).toBe("Выберите значения");
	});

	it("пересчитывает сетку после асинхронного появления опций в открытом popup", async () => {
		await renderHarness({ initialValue: {}, nodes: [] });
		const dialog = document.querySelector('[role="dialog"]') as HTMLElement;

		await vi.waitFor(() => {
			expect(dialog.style.getPropertyValue("--tree-row-count")).toBe("1");
		});

		await act(async () => root?.render(<Harness initialValue={{}} nodes={ASYNC_NODES} />));

		await vi.waitFor(() => {
			expect(document.querySelectorAll('[data-ui="tree-select-option"]')).toHaveLength(ASYNC_NODES.length);
			expect(dialog.style.getPropertyValue("--tree-row-count")).not.toBe("1");
		});
	});

	it("не включает disabled-опции в массовый черновик и публикует его только после закрытия", async () => {
		const nodesWithDisabled: TreeSelectNode[] = [
			{
				...NODES[0],
				children: [NODES[0].children![0], { ...NODES[0].children![1], disabled: true }]
			},
			{ ...NODES[1], disabled: true }
		];
		const onChange = vi.fn<(value: TreeMultiSelectValue) => void>();
		await renderHarness({ initialValue: {}, nodes: nodesWithDisabled, onChange });

		const disabledOptions = Array.from(document.querySelectorAll<HTMLElement>('[data-ui="tree-select-option"][aria-disabled="true"]'));
		const disabledCheckBoxes = disabledOptions.map((option) => option.querySelector('input[type="checkbox"]') as HTMLInputElement);
		expect(disabledOptions).toHaveLength(2);
		expect(disabledCheckBoxes.every((checkBox) => checkBox.disabled)).toBe(true);

		await clickElement(document.querySelector('[data-action="select-all"]') as HTMLButtonElement);
		expect(getCheckBox("Филиал 1").checked).toBe(true);
		expect(disabledCheckBoxes.every((checkBox) => !checkBox.checked)).toBe(true);
		expect(getCommittedValueText()).toBe("{}");
		expect(onChange).not.toHaveBeenCalled();

		await closePopup();

		expect(getCommittedValueText()).toBe('{"BR":["001"]}');
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenLastCalledWith({ BR: ["001"] });
	});
});
