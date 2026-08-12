// @vitest-environment jsdom

import React, { act, useState } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MultiSelect } from "./MultiSelect";

import type { CollectionItem } from "@ryuzaki13/react-foundation-lib/odata";

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

	it("сохраняет корректную работу шеврона и фокус input", async () => {
		await renderNode(<MultiSelectHarness />);

		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;

		await act(async () => {
			input.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(document.querySelectorAll('[role="option"]')).toHaveLength(0);

		const openButton = container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement;

		await act(async () => {
			openButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(document.querySelectorAll('[role="option"]')).toHaveLength(2);
		expect(document.activeElement).toBe(input);

		const closeButton = document.querySelector('button[aria-label="Закрыть список"]') as HTMLButtonElement;

		await act(async () => {
			closeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(input.getAttribute("aria-expanded")).toBe("false");
		expect(document.activeElement).toBe(input);
	});

	it("собирает checkbox, текст и код внутри единого OptionButton", async () => {
		await renderNode(<MultiSelectHarness />);

		const openButton = container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement;

		await act(async () => {
			openButton.click();
		});

		const option = document.querySelector('[role="option"]') as HTMLButtonElement;
		const [slot, text, code] = Array.from(option.children);
		const checkBox = slot?.querySelector('[data-ui="check-box-indicator"]') as HTMLSpanElement;

		expect(option.tagName).toBe("BUTTON");
		expect(option.children).toHaveLength(3);
		expect(checkBox.tagName).toBe("SPAN");
		expect(checkBox.getAttribute("data-state")).toBe("unchecked");
		expect(checkBox.getAttribute("aria-hidden")).toBe("true");
		expect(text?.textContent).toBe("Альфа");
		expect(text?.getAttribute("data-search-text")).toBe("Альфа");
		expect(code?.textContent).toBe("01");

		await act(async () => {
			option.click();
		});

		expect(option.getAttribute("aria-selected")).toBe("true");
		expect(checkBox.getAttribute("data-state")).toBe("checked");
		expect(container?.querySelector('input[role="combobox"]')?.getAttribute("aria-expanded")).toBe("true");
	});

	it("фильтрует видимые варианты по введенному запросу", async () => {
		await renderNode(<MultiSelectHarness />);

		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;
		const openButton = container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement;

		await act(async () => {
			openButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(document.querySelectorAll('[role="option"]')).toHaveLength(2);

		await act(async () => {
			const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
			valueSetter?.call(input, "Бе");
			input.dispatchEvent(new Event("input", { bubbles: true }));
		});

		const options = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
		expect(options).toHaveLength(1);
		expect(options[0]?.textContent).toContain("Бета");
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

		const options = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
		expect(options).toHaveLength(2);
		expect(options[1]?.getAttribute("aria-disabled")).toBe("true");
		expect(options[1]).toBeInstanceOf(HTMLButtonElement);
		expect((options[1] as HTMLButtonElement | undefined)?.disabled).toBe(true);
		expect(options[1]?.querySelector('[data-ui="check-box-indicator"]')).not.toBeNull();

		const selectAllButton = document.querySelector('button[data-action="select-all"]') as HTMLButtonElement;

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

		const firstOption = document.querySelectorAll<HTMLButtonElement>('[role="option"]')[0];
		expect(firstOption).toBeDefined();

		await act(async () => {
			firstOption?.click();
		});

		const options = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
		expect(options[0]?.getAttribute("aria-disabled")).toBeNull();
		expect(options[1]?.getAttribute("aria-disabled")).toBe("true");
		expect(options[2]?.getAttribute("aria-disabled")).toBeNull();
	});
});
