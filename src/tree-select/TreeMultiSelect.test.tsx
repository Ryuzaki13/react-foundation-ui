// @vitest-environment jsdom

import { act, useState } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as treeColumnsLayoutModel from "./model/resolveBalancedTreeColumnsLayout";
import { TreeMultiSelect } from "./TreeMultiSelect";
import styles from "./TreeSelect.module.scss";

import type { TreeMultiSelectOptionsLayout, TreeMultiSelectValue, TreeSelectNode } from "./types";

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
		code: "01",
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

/** Один сериализуемый predicate, показанный в двух физических ветвях. */
const DUPLICATE_VALUE_NODES: TreeSelectNode[] = [
	{
		id: "GROUP:02/ZPRODH01:A",
		codeKey: "ZPRODH01",
		value: "A",
		label: "Группа A (02)",
		searchText: "A Группа A 02"
	},
	{
		id: "GROUP:other/ZPRODH01:A",
		codeKey: "ZPRODH01",
		value: "A",
		label: "Группа A (Остальные)",
		searchText: "A Группа A Остальные"
	}
];

/** Общий predicate нельзя выбрать, если одно из его визуальных вхождений запрещено. */
const DUPLICATE_DISABLED_VALUE_NODES: TreeSelectNode[] = [
	{
		id: "GROUP:01/VALUE:X",
		codeKey: "VALUE",
		value: "X",
		label: "Разрешённый X",
		searchText: "Разрешённый X"
	},
	{
		id: "GROUP:02/VALUE:X",
		codeKey: "VALUE",
		value: "X",
		label: "Запрещённый X",
		searchText: "Запрещённый X",
		disabled: true
	}
];

/** Выбранный parent можно безопасно разложить при снятии unsafe duplicate-leaf. */
const SELECTED_PARENT_WITH_DUPLICATE_DISABLED_LEAF_NODES: TreeSelectNode[] = [
	{
		id: "PARENT:P",
		codeKey: "PARENT",
		value: "P",
		label: "Родитель P",
		searchText: "Родитель P",
		children: [
			{
				id: "PARENT:P/VALUE:X",
				codeKey: "VALUE",
				value: "X",
				label: "Разрешённый X",
				searchText: "Разрешённый X"
			},
			{
				id: "PARENT:P/VALUE:Y",
				codeKey: "VALUE",
				value: "Y",
				label: "Разрешённый Y",
				searchText: "Разрешённый Y"
			}
		]
	},
	{
		id: "PARENT:OTHER/VALUE:X",
		codeKey: "VALUE",
		value: "X",
		label: "Запрещённый X",
		searchText: "Запрещённый X",
		disabled: true
	}
];

/** Derived-full группа должна оставаться доступной для снятия unsafe predicates. */
const DERIVED_FULL_UNSAFE_GROUP_NODES: TreeSelectNode[] = [
	{
		id: "GROUP:selected",
		codeKey: "GROUP",
		value: "selected",
		label: "Виртуальная группа",
		searchText: "Виртуальная группа",
		selectionBehavior: "descendants",
		children: [
			{
				id: "GROUP:selected/VALUE:X",
				codeKey: "VALUE",
				value: "X",
				label: "Разрешённый X",
				searchText: "Разрешённый X"
			},
			{
				id: "GROUP:selected/VALUE:Y",
				codeKey: "VALUE",
				value: "Y",
				label: "Разрешённый Y",
				searchText: "Разрешённый Y"
			}
		]
	},
	{
		id: "GROUP:disabled/VALUE:X",
		codeKey: "VALUE",
		value: "X",
		label: "Запрещённый X",
		searchText: "Запрещённый X",
		disabled: true
	},
	{
		id: "GROUP:disabled/VALUE:Y",
		codeKey: "VALUE",
		value: "Y",
		label: "Запрещённый Y",
		searchText: "Запрещённый Y",
		disabled: true
	}
];

const ASYNC_NODES: TreeSelectNode[] = Array.from({ length: 12 }, (_, index) => ({
	id: `DIV:${index}`,
	codeKey: "DIV",
	value: String(index),
	label: `Дивизион ${index}`,
	searchText: `${index} Дивизион ${index}`
}));

function createStructureRoot(rootIndex: number, childCount: number): TreeSelectNode {
	const rootCode = `R${rootIndex}`;

	return {
		id: `ROOT:${rootCode}`,
		codeKey: "ROOT",
		value: rootCode,
		label: `Корень ${rootIndex}`,
		searchText: `${rootCode} Корень ${rootIndex}`,
		children: Array.from({ length: childCount }, (_, childIndex) => ({
			id: `ROOT:${rootCode}/CHILD:${childIndex}`,
			codeKey: "CHILD",
			value: `${rootCode}-${childIndex}`,
			label: `Элемент ${rootIndex}.${childIndex}`,
			searchText: `${rootCode}-${childIndex} Элемент ${rootIndex}.${childIndex}`
		}))
	};
}

const FIRST_SAME_COUNT_STRUCTURE = [createStructureRoot(1, 3), createStructureRoot(2, 3)];
const SECOND_SAME_COUNT_STRUCTURE = [createStructureRoot(1, 1), createStructureRoot(2, 5)];

function Harness({
	initialValue,
	nodes = NODES,
	label = "Оргструктура",
	placeholder,
	onChange,
	optionsLayout = "columns",
	defaultExpandedCodeKeys
}: {
	initialValue: TreeMultiSelectValue;
	nodes?: TreeSelectNode[];
	label?: string | null;
	placeholder?: string;
	onChange?: (value: TreeMultiSelectValue) => void;
	optionsLayout?: TreeMultiSelectOptionsLayout;
	defaultExpandedCodeKeys?: readonly string[];
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
				optionsLayout={optionsLayout}
				defaultExpandedCodeKeys={defaultExpandedCodeKeys}
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
	optionsLayout?: TreeMultiSelectOptionsLayout;
	defaultExpandedCodeKeys?: readonly string[];
	open?: boolean;
};

async function renderHarness({
	initialValue,
	nodes = NODES,
	label = "Оргструктура",
	placeholder,
	onChange,
	optionsLayout = "columns",
	defaultExpandedCodeKeys,
	open = true
}: RenderHarnessOptions) {
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);

	await act(async () =>
		root?.render(
			<Harness
				initialValue={initialValue}
				nodes={nodes}
				label={label}
				placeholder={placeholder}
				onChange={onChange}
				optionsLayout={optionsLayout}
				defaultExpandedCodeKeys={defaultExpandedCodeKeys}
			/>
		)
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

async function setInputValue(input: HTMLInputElement, value: string) {
	await act(async () => {
		const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
		valueSetter?.call(input, value);
		input.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

async function pressKey(element: HTMLElement, key: string) {
	await act(async () => {
		element.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
	});
}

function getCommittedValueText() {
	return container?.querySelector('[data-testid="value"]')?.textContent;
}

function getOptionOrder() {
	return Array.from(document.querySelectorAll<HTMLElement>('[data-ui="tree-select-option"]')).map((option) => option.textContent?.trim());
}

function getOptionByText(text: string) {
	const option = Array.from(document.querySelectorAll<HTMLElement>('[data-ui="tree-select-option"]')).find((item) =>
		item.textContent?.includes(text)
	);

	if (!option) {
		throw new Error(`Не найдена option-строка «${text}»`);
	}

	return option;
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
	vi.restoreAllMocks();
});

describe("TreeMultiSelect columns layout", () => {
	it("сразу показывает все уровни чекбоксами без экспандеров", async () => {
		await renderHarness({ initialValue: { DIV: ["01"] }, defaultExpandedCodeKeys: [] });

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
			const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
			const columnCount = Number(dialog.style.getPropertyValue("--tree-column-count"));
			const rowCount = Number(dialog.style.getPropertyValue("--tree-row-count"));
			const occupiedCells = new Set<string>();

			expect(dialog.firstElementChild?.classList.contains(styles.treeColumnsPopupLayout)).toBe(true);
			expect(dialog.firstElementChild?.lastElementChild?.classList.contains("scrollable")).toBe(true);
			expect(dialog.style.maxHeight).toMatch(/px$/);
			expect(columnCount).toBeGreaterThanOrEqual(1);
			expect(rowCount).toBeGreaterThanOrEqual(1);

			options.forEach((option, index) => {
				const column = Number(dialog.style.getPropertyValue(`--tree-option-${index}-column`));
				const row = Number(dialog.style.getPropertyValue(`--tree-option-${index}-row`));

				expect(column).toBeGreaterThanOrEqual(1);
				expect(column).toBeLessThanOrEqual(columnCount);
				expect(row).toBeGreaterThanOrEqual(1);
				expect(row).toBeLessThanOrEqual(rowCount);
				expect(option.style.getPropertyValue("--tree-option-column")).toBe(`var(--tree-option-${index}-column, auto)`);
				expect(option.style.getPropertyValue("--tree-option-row")).toBe(`var(--tree-option-${index}-row, auto)`);
				expect(option.id).toContain(`-option-${index}`);
				occupiedCells.add(`${column}:${row}`);
			});

			expect(occupiedCells.size).toBe(options.length);
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

	it("кнопка текста выбирает только один узел и сразу закрывает popup", async () => {
		const onChange = vi.fn<(value: TreeMultiSelectValue) => void>();
		await renderHarness({ initialValue: { DIV: ["02"] }, onChange });

		const branchOption = getOptionByText("Филиал 1");
		const optionButton = branchOption.querySelector(":scope > button");
		if (!(optionButton instanceof HTMLButtonElement)) {
			throw new Error("Не найдена кнопка текста узла «Филиал 1»");
		}

		await clickElement(optionButton);

		expect(container?.querySelector('input[role="combobox"]')?.getAttribute("aria-expanded")).toBe("false");
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

	it("показывает label единственного выбранного элемента и кнопку очистки", async () => {
		await renderHarness({ initialValue: { BR: ["001"] }, open: false });

		const token = findInnermostElementWithText("Филиал 1");
		const clearButton = container?.querySelector('button[aria-label="Очистить выбор"]');

		expect(token).toBeTruthy();
		expect(clearButton).toBeInstanceOf(HTMLButtonElement);
		expect(container?.textContent).not.toContain("Филиал 1 · 001");
	});

	it("показывает точный счётчик для нескольких выбранных элементов", async () => {
		await renderHarness({ initialValue: { BR: ["001"], DIV: ["02"] }, open: false });

		expect(findInnermostElementWithText("2 элемента")).toBeTruthy();
		expect(container?.textContent).not.toContain("Выбрано 2 узл.");
	});

	it("считает повторные визуальные узлы как один выбранный server predicate", async () => {
		await renderHarness({ initialValue: { ZPRODH01: ["A"] }, nodes: DUPLICATE_VALUE_NODES, open: false });

		expect(findInnermostElementWithText("Группа A (02)")).toBeTruthy();
		expect(container?.textContent).not.toContain("2 элемента");
	});

	it("помечает enabled-дубль недоступным, когда общий predicate затрагивает disabled-узел", async () => {
		await renderHarness({ initialValue: {}, nodes: DUPLICATE_DISABLED_VALUE_NODES });

		const enabledDuplicateOption = getOptionByText("Разрешённый X");
		expect(enabledDuplicateOption.getAttribute("aria-disabled")).toBe("true");
		expect(getCheckBox("Разрешённый X").disabled).toBe(true);
	});

	it("оставляет выбранный unsafe predicate доступным для явного снятия", async () => {
		const onChange = vi.fn<(value: TreeMultiSelectValue) => void>();
		await renderHarness({ initialValue: { VALUE: ["X"] }, nodes: DUPLICATE_DISABLED_VALUE_NODES, onChange });

		const enabledDuplicateCheckBox = getCheckBox("Разрешённый X");
		expect(enabledDuplicateCheckBox.disabled).toBe(false);
		await clickElement(enabledDuplicateCheckBox);
		await closePopup();

		expect(getCommittedValueText()).toBe("{}");
		expect(onChange).toHaveBeenLastCalledWith({});
	});

	it("оставляет unsafe leaf активным для частичного снятия выбранного parent", async () => {
		const onChange = vi.fn<(value: TreeMultiSelectValue) => void>();
		await renderHarness({
			initialValue: { PARENT: ["P"] },
			nodes: SELECTED_PARENT_WITH_DUPLICATE_DISABLED_LEAF_NODES,
			onChange
		});

		const unsafeLeafCheckBox = getCheckBox("Разрешённый X");
		expect(unsafeLeafCheckBox.disabled).toBe(false);
		await clickElement(unsafeLeafCheckBox);
		await closePopup();

		expect(getCommittedValueText()).toBe('{"VALUE":["Y"]}');
		expect(onChange).toHaveBeenLastCalledWith({ VALUE: ["Y"] });
	});

	it("оставляет derived-full виртуальную группу доступной для снятия unsafe predicates", async () => {
		const onChange = vi.fn<(value: TreeMultiSelectValue) => void>();
		await renderHarness({ initialValue: { VALUE: ["X", "Y"] }, nodes: DERIVED_FULL_UNSAFE_GROUP_NODES, onChange });

		const groupCheckBox = getCheckBox("Виртуальная группа");
		expect(groupCheckBox.disabled).toBe(false);
		await clickElement(groupCheckBox);
		await closePopup();

		expect(getCommittedValueText()).toBe("{}");
		expect(onChange).toHaveBeenLastCalledWith({});
	});

	it("показывает настроенный placeholder только до выбора и сохраняет доступное имя поля", async () => {
		await renderHarness({ initialValue: {}, label: null, placeholder: "Оргструктура", open: false });

		const emptyInput = container?.querySelector('input[role="combobox"]');
		expect(emptyInput?.getAttribute("placeholder")).toBe("Оргструктура <4>");
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

	it("пересчитывает Floating UI при изменении структуры с прежним числом options", async () => {
		const resolverSpy = vi.spyOn(treeColumnsLayoutModel, "resolveBalancedTreeColumnsLayout");
		await renderHarness({ initialValue: {}, nodes: FIRST_SAME_COUNT_STRUCTURE });

		await vi.waitFor(() => {
			expect(resolverSpy).toHaveBeenCalled();
		});
		const initialCallCount = resolverSpy.mock.calls.length;
		const initialSignature = resolverSpy.mock.calls.at(-1)?.[0].descriptor.signature;

		await act(async () => root?.render(<Harness initialValue={{}} nodes={SECOND_SAME_COUNT_STRUCTURE} />));

		await vi.waitFor(() => {
			expect(resolverSpy.mock.calls.length).toBeGreaterThan(initialCallCount);
		});
		expect(resolverSpy.mock.calls.at(-1)?.[0].descriptor.signature).not.toBe(initialSignature);
		expect(document.querySelectorAll('[data-ui="tree-select-option"]')).toHaveLength(8);
	});

	it("сохраняет поиск и DOM preorder при explicit columns placement", async () => {
		await renderHarness({ initialValue: {} });
		const initialOrder = getOptionOrder();
		const searchInput = container?.querySelector('input[role="combobox"]') as HTMLInputElement;

		await setInputValue(searchInput, "Филиал 1");

		expect(getOptionOrder()).toEqual(
			initialOrder.filter((optionText) => optionText?.includes("Дивизион 1") || optionText?.includes("Филиал 1"))
		);
		expect(getCheckBox("Филиал 1")).toBeInstanceOf(HTMLInputElement);

		await setInputValue(searchInput, "");

		expect(getOptionOrder()).toEqual(initialOrder);
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

describe("TreeMultiSelect tree expansion", () => {
	it("пробрасывает настройку раскрытия уровней в общий tree picker", async () => {
		await renderHarness({
			initialValue: {},
			optionsLayout: "tree",
			defaultExpandedCodeKeys: ["DIV"]
		});

		expect(getOptionOrder()).toHaveLength(4);
		expect(getOptionOrder().some((optionText) => optionText?.includes("Филиал 1"))).toBe(true);
		expect(document.querySelector('[data-ui="tree-select-expander"]')).toBeTruthy();
		const listbox = document.querySelector('[role="listbox"]') as HTMLElement;
		expect(listbox.firstElementChild?.classList.contains(styles.treeColumnsPopupLayout)).toBe(false);
	});

	it("сохраняет клавиатурную навигацию из expander и checkbox и разделяет Space с Enter", async () => {
		const onChange = vi.fn<(value: TreeMultiSelectValue) => void>();
		await renderHarness({
			initialValue: {},
			onChange,
			optionsLayout: "tree",
			defaultExpandedCodeKeys: ["DIV"]
		});

		const rootOption = getOptionByText("Дивизион 1");
		const branchOption = getOptionByText("Филиал 1");
		const rootExpander = rootOption.querySelector('[data-ui="tree-select-expander"]') as HTMLButtonElement;
		const rootCheckBox = getCheckBox("Дивизион 1");

		rootExpander.focus();
		await pressKey(rootExpander, "ArrowDown");
		expect(document.activeElement).toBe(branchOption);

		rootCheckBox.focus();
		await pressKey(rootCheckBox, "ArrowDown");
		expect(document.activeElement).toBe(branchOption);

		rootExpander.focus();
		await pressKey(rootExpander, " ");
		expect(rootCheckBox.checked).toBe(true);
		expect(rootExpander.dataset.action).toBe("collapse-tree-select-node");
		expect(document.querySelector('[role="listbox"]')).toBeTruthy();

		const branchCheckBox = getCheckBox("Филиал 1");
		branchCheckBox.focus();
		await pressKey(branchCheckBox, "Enter");

		expect(container?.querySelector('input[role="combobox"]')?.getAttribute("aria-expanded")).toBe("false");
		expect(getCommittedValueText()).toBe('{"BR":["001"]}');
		expect(onChange).toHaveBeenLastCalledWith({ BR: ["001"] });
	});

	it.each([
		{ initialValue: {} as TreeMultiSelectValue, expectedValue: { BR: ["001"] } },
		{ initialValue: { DIV: ["01"] }, expectedValue: { BR: ["002"] } }
	])("переключает через найденный parent только видимых descendants", async ({ initialValue, expectedValue }) => {
		const onChange = vi.fn<(value: TreeMultiSelectValue) => void>();
		await renderHarness({ initialValue, onChange, optionsLayout: "tree" });
		const searchInput = container?.querySelector('input[role="combobox"]') as HTMLInputElement;

		await setInputValue(searchInput, "Филиал 1");
		await clickElement(getCheckBox("Дивизион 1"));
		await closePopup();

		expect(getCommittedValueText()).toBe(JSON.stringify(expectedValue));
		expect(onChange).toHaveBeenLastCalledWith(expectedValue);
	});
});
