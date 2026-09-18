// @vitest-environment jsdom

import React, { act, useState } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MultiSelect } from "./MultiSelect";

import type { CollectionItem } from "@ryuzaki13/react-foundation-lib/odata-service";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
window.matchMedia ??= () =>
	({
		matches: false,
		media: "",
		onchange: null,
		addListener: () => undefined,
		removeListener: () => undefined,
		addEventListener: () => undefined,
		removeEventListener: () => undefined,
		dispatchEvent: () => false
	}) as MediaQueryList;
window.HTMLElement.prototype.scrollIntoView = () => undefined;

const ITEMS = [
	{ code: "01", text: "Альфа" },
	{ code: "02", text: "Бета" }
];

function MultiSelectHarness() {
	const [value, setValue] = useState<CollectionItem[]>([]);

	return (
		<MultiSelect label="Справочник" placeholder="Поиск" codeKey="code" textKey="text" items={ITEMS} value={value} onChange={setValue} />
	);
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

describe("MultiSelect", () => {
	it("показывает количество выбранных элементов", async () => {
		await renderNode(
			<MultiSelect
				label="Справочник"
				placeholder="Поиск"
				codeKey="code"
				textKey="text"
				items={ITEMS}
				value={ITEMS}
				onChange={() => undefined}
			/>
		);

		expect(container?.textContent).toContain("2 элемента");
	});

	it("сохраняет ссылки mutable-массивов в опубликованных legacy callback-контекстах", async () => {
		const value = [ITEMS[0]!];
		let renderSelectedItems: CollectionItem[] | undefined;
		let renderCommittedItems: CollectionItem[] | undefined;
		let disableSelectedItems: CollectionItem[] | undefined;
		let disableCommittedItems: CollectionItem[] | undefined;

		await renderNode(
			<MultiSelect
				label="Справочник"
				codeKey="code"
				textKey="text"
				items={ITEMS}
				value={value}
				onChange={() => undefined}
				renderToken={(context) => {
					renderSelectedItems = context.selectedItems;
					renderCommittedItems = context.committedSelectedItems;
					return context.selectedItems[0]?.text;
				}}
				getOptionDisabled={(_, context) => {
					disableSelectedItems = context.selectedItems;
					disableCommittedItems = context.committedSelectedItems;
					return false;
				}}
			/>
		);

		expect(renderSelectedItems).toBe(value);
		expect(renderCommittedItems).toBe(value);

		await act(async () => {
			(container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement).click();
		});

		expect(disableSelectedItems).toBe(value);
		expect(disableCommittedItems).toBe(value);
	});

	it("сохраняет корректную работу шеврона и фокус input", async () => {
		await renderNode(<MultiSelectHarness />);

		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;

		await act(async () => {
			input.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(document.querySelectorAll('[role="row"]')).toHaveLength(0);

		const openButton = container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement;

		await act(async () => {
			openButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(document.querySelectorAll('[role="row"]')).toHaveLength(2);
		expect(document.activeElement).toBe(input);

		const closeButton = document.querySelector('button[aria-label="Закрыть список"]') as HTMLButtonElement;

		await act(async () => {
			closeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(input.getAttribute("aria-expanded")).toBe("false");
		expect(document.activeElement).toBe(input);
	});

	it("разделяет checkbox чернового выбора и кнопку немедленного выбора в строке grid", async () => {
		await renderNode(<MultiSelectHarness />);

		const openButton = container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement;

		await act(async () => {
			openButton.click();
		});

		const grid = document.querySelector('[role="grid"]') as HTMLDivElement;
		const row = grid.querySelector('[role="row"]') as HTMLDivElement;
		const checkBox = row.querySelector('input[type="checkbox"]') as HTMLInputElement;
		const optionButton = row.querySelector('button[aria-label^="Выбрать только"]') as HTMLButtonElement;

		expect(grid.getAttribute("aria-multiselectable")).toBe("true");
		expect(row.querySelectorAll('[role="gridcell"]')).toHaveLength(2);
		expect(checkBox.checked).toBe(false);
		expect(optionButton.textContent).toContain("Альфа");
		expect(optionButton.textContent).toContain("01");

		await act(async () => {
			checkBox.click();
		});

		expect(row.getAttribute("aria-selected")).toBe("true");
		expect(checkBox.checked).toBe(true);
		expect(container?.querySelector('input[role="combobox"]')?.getAttribute("aria-expanded")).toBe("true");

		await act(async () => {
			optionButton.click();
		});

		expect(container?.querySelector('input[role="combobox"]')?.getAttribute("aria-expanded")).toBe("false");
	});

	it("кнопка строки выбирает только одну опцию и сразу применяет значение", async () => {
		const onChange = vi.fn<(value: CollectionItem[]) => void>();
		await renderNode(<MultiSelect label="Справочник" codeKey="code" textKey="text" items={ITEMS} value={[]} onChange={onChange} />);

		await act(async () => {
			(container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement).click();
		});

		const betaRow = Array.from(document.querySelectorAll<HTMLElement>('[role="row"]')).find((row) => row.textContent?.includes("Бета"));

		await act(async () => {
			(betaRow?.querySelector('button[aria-label^="Выбрать только"]') as HTMLButtonElement).click();
		});

		expect(container?.querySelector('input[role="combobox"]')?.getAttribute("aria-expanded")).toBe("false");
		expect(onChange).toHaveBeenCalledWith([{ code: "02", text: "Бета" }]);
	});

	it("Ctrl+Space меняет черновик, а Enter применяет только активную строку", async () => {
		const onChange = vi.fn<(value: CollectionItem[]) => void>();
		await renderNode(<MultiSelect label="Справочник" codeKey="code" textKey="text" items={ITEMS} value={[]} onChange={onChange} />);

		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;

		await act(async () => {
			(container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement).click();
		});

		await act(async () => {
			input.dispatchEvent(new KeyboardEvent("keydown", { key: " ", code: "Space", ctrlKey: true, bubbles: true }));
		});

		expect(document.querySelector('[role="row"]')?.getAttribute("aria-selected")).toBe("true");
		expect(input.getAttribute("aria-expanded")).toBe("true");
		expect(onChange).not.toHaveBeenCalled();

		await act(async () => {
			input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
		});

		await act(async () => {
			input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
		});

		expect(input.getAttribute("aria-expanded")).toBe("false");
		expect(onChange).toHaveBeenCalledWith([{ code: "02", text: "Бета" }]);
	});

	it("фильтрует видимые варианты по введенному запросу", async () => {
		await renderNode(<MultiSelectHarness />);

		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;
		const openButton = container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement;

		await act(async () => {
			openButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(document.querySelectorAll('[role="row"]')).toHaveLength(2);

		await act(async () => {
			const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
			valueSetter?.call(input, "Бе");
			input.dispatchEvent(new Event("input", { bubbles: true }));
		});

		const rows = Array.from(document.querySelectorAll<HTMLElement>('[role="row"]'));
		expect(rows).toHaveLength(1);
		expect(rows[0]?.textContent).toContain("Бета");
	});

	it("сохраняет codeKey как identity при независимом отображаемом code из renderItem", async () => {
		const items = [
			{ id: "group-1", label: "Первая группа", displayCode: "23-ИС" },
			{ id: "group-2", label: "Вторая группа", displayCode: "24-ИС" }
		];
		const onChange = vi.fn<(value: CollectionItem[]) => void>();

		await renderNode(
			<MultiSelect
				label="Группы"
				codeKey="id"
				textKey="label"
				items={items}
				value={[]}
				onChange={onChange}
				renderItem={(item) => ({ text: item.label ?? "", code: item.displayCode })}
			/>
		);

		await act(async () => {
			(container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement).click();
		});

		const firstRow = document.querySelector<HTMLElement>('[role="row"]');
		expect(firstRow?.textContent).toContain("Первая группа");
		expect(firstRow?.textContent).toContain("23-ИС");
		expect(firstRow?.textContent).not.toContain("group-1");

		await act(async () => {
			firstRow?.querySelector<HTMLInputElement>('input[type="checkbox"]')?.click();
		});

		await act(async () => {
			(document.querySelector('button[aria-label="Закрыть список"]') as HTMLButtonElement).click();
		});

		expect(onChange).toHaveBeenCalledWith([items[0]]);
	});

	it("скрывает code визуально, но сохраняет legacy-поиск по нему", async () => {
		await renderNode(
			<MultiSelect label="Справочник" codeKey="code" textKey="text" hideCode items={ITEMS} value={[]} onChange={() => undefined} />
		);

		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;
		await act(async () => {
			(container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement).click();
		});
		await act(async () => {
			const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
			valueSetter?.call(input, "02");
			input.dispatchEvent(new Event("input", { bubbles: true }));
		});

		const rows = Array.from(document.querySelectorAll<HTMLElement>('[role="row"]'));
		expect(rows).toHaveLength(1);
		expect(rows[0]?.textContent).toContain("Бета");
		expect(rows[0]?.textContent).not.toContain("02");
	});

	it("показывает code в token, но не подставляет его вместо отсутствующего legacy-текста строки", async () => {
		const item = { code: "01" };

		await renderNode(
			<MultiSelect
				label="Справочник"
				codeKey="code"
				textKey="text"
				hideCode
				items={[item]}
				value={[item]}
				onChange={() => undefined}
			/>
		);
		expect(container?.textContent).toContain("01");

		await act(async () => {
			(container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement).click();
		});

		expect(document.querySelector('[role="row"]')?.textContent).not.toContain("01");
	});

	it("передаёт исходную ссылку value в onClose, если выбор не менялся", async () => {
		const value = [ITEMS[0]];
		const onClose = vi.fn<(nextValue: CollectionItem[]) => void>();

		await renderNode(
			<MultiSelect
				label="Справочник"
				codeKey="code"
				textKey="text"
				items={ITEMS}
				value={value}
				onChange={() => undefined}
				onClose={onClose}
			/>
		);

		await act(async () => {
			(container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement).click();
		});

		await act(async () => {
			(document.querySelector('button[aria-label="Закрыть список"]') as HTMLButtonElement).click();
		});

		expect(onClose).toHaveBeenCalledTimes(1);
		expect(onClose.mock.calls[0]?.[0]).toBe(value);
	});

	it("оставляет отключенные варианты видимыми и не выбирает их массовым действием", async () => {
		const handleChange = vi.fn<(value: CollectionItem[]) => void>();

		await renderNode(
			<MultiSelect
				label="Справочник"
				placeholder="Поиск"
				codeKey="code"
				textKey="text"
				items={ITEMS}
				value={[]}
				getOptionDisabled={(item) => item.code === "02"}
				onChange={handleChange}
			/>
		);

		const openButton = container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement;

		await act(async () => {
			openButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		const rows = Array.from(document.querySelectorAll<HTMLElement>('[role="row"]'));
		expect(rows).toHaveLength(2);
		expect(rows[1]?.getAttribute("aria-disabled")).toBe("true");
		expect(rows[1]).toBeInstanceOf(HTMLDivElement);
		expect(rows[1]?.querySelector<HTMLInputElement>('input[type="checkbox"]')?.disabled).toBe(true);
		expect(rows[1]?.querySelector<HTMLButtonElement>('button[aria-label^="Выбрать только"]')?.disabled).toBe(true);

		const selectAllButton = document.querySelector('button[data-action="select-all"]') as HTMLButtonElement;
		expect(selectAllButton.closest('[role="grid"]')).toBeNull();
		expect(document.querySelector('[role="separator"][aria-orientation="horizontal"]')).toBeTruthy();

		await act(async () => {
			selectAllButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		const closeButton = document.querySelector('button[aria-label="Закрыть список"]') as HTMLButtonElement;

		await act(async () => {
			closeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(handleChange).toHaveBeenCalledTimes(1);
		expect(handleChange).toHaveBeenCalledWith([{ code: "01", text: "Альфа" }]);
	});

	it("пересчитывает disabled-состояние по черновому выбору до закрытия списка", async () => {
		const items = [
			{ code: "01", text: "Выручка", unit: "руб" },
			{ code: "02", text: "Вес", unit: "тн" },
			{ code: "03", text: "План", unit: "руб" }
		];

		await renderNode(
			<MultiSelect
				label="Показатели"
				placeholder="Поиск"
				codeKey="code"
				textKey="text"
				items={items}
				value={[]}
				getOptionDisabled={(item, context) => {
					if (context.selectedKeys.has(item.code)) return false;
					const selectedUnit = context.selectedItems[0]?.unit;
					return Boolean(selectedUnit && item.unit !== selectedUnit);
				}}
				onChange={() => undefined}
			/>
		);

		const openButton = container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement;

		await act(async () => {
			openButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		const firstCheckBox = document.querySelectorAll<HTMLInputElement>('[role="row"] input[type="checkbox"]')[0];
		expect(firstCheckBox).toBeDefined();

		await act(async () => {
			firstCheckBox?.click();
		});

		const rows = Array.from(document.querySelectorAll<HTMLElement>('[role="row"]'));
		expect(rows[0]?.getAttribute("aria-disabled")).toBeNull();
		expect(rows[1]?.getAttribute("aria-disabled")).toBe("true");
		expect(rows[2]?.getAttribute("aria-disabled")).toBeNull();
	});
});
