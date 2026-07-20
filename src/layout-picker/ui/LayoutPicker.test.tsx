// @vitest-environment jsdom

import { act, type ReactNode, useState } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_LAYOUT_PICKER_PRESETS, type LayoutPickerPreset } from "../lib";

import { LayoutPicker } from "./LayoutPicker";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
	configurable: true,
	value: vi.fn()
});

let container: HTMLDivElement | null = null;
let root: Root | null = null;

const TEST_LAYOUT_PICKER_PRESETS = [
	{
		id: "single-cell",
		label: "Одна ячейка",
		columns: 1,
		rows: 1,
		cells: [{ id: "cell", row: 1, column: 1 }]
	}
] as const satisfies readonly LayoutPickerPreset[];

function getRequiredElement<TElement extends Element>(element: TElement | null | undefined, message: string): TElement {
	if (!element) {
		throw new Error(message);
	}

	return element;
}

function findOptionButton(label: string): HTMLButtonElement {
	const button = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="option"]')).find((option) =>
		option.textContent?.includes(label)
	);

	return getRequiredElement(button, `Не найдена опция layout: ${label}`);
}

async function renderNode(node: ReactNode) {
	container = document.createElement("div");
	document.body.appendChild(container);
	const nextRoot = createRoot(container);
	root = nextRoot;

	await act(async () => {
		nextRoot.render(node);
	});
}

function ControlledLayoutPickerHarness({
	onChange,
	getPresetDisabled
}: {
	onChange?: (value: string) => void;
	getPresetDisabled?: (preset: LayoutPickerPreset) => boolean;
} = {}) {
	const [value, setValue] = useState("1x1");

	return (
		<LayoutPicker
			value={value}
			onChange={(nextValue) => {
				setValue(nextValue);
				onChange?.(nextValue);
			}}
			getPresetDisabled={getPresetDisabled}
		/>
	);
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

describe("LayoutPicker", () => {
	it("по умолчанию отображает только иконку раскладки без текста", async () => {
		await renderNode(
			<LayoutPicker
				value="single-cell"
				onChange={vi.fn<(value: string) => void>()}
				presets={TEST_LAYOUT_PICKER_PRESETS}
				placeholder="Текст выбора раскладки"
				ariaLabel="Выбрать раскладку"
			/>
		);

		const trigger = getRequiredElement(
			container?.querySelector<HTMLInputElement>('[data-ui="layout-picker-trigger"]'),
			"Не найдена кнопка LayoutPicker"
		);
		const preview = getRequiredElement(
			container?.querySelector<HTMLElement>('[data-ui="layout-picker-preview"]'),
			"Не найдено превью текущей раскладки"
		);

		expect(preview.childElementCount).toBeGreaterThan(0);
		expect(container?.querySelector('[data-ui="layout-picker-placeholder"]')).toBeNull();
		expect(container?.textContent).not.toContain("Текст выбора раскладки");
		expect(container?.textContent).not.toContain("Одна ячейка");
		expect(trigger.value).toBe("Одна ячейка");
		expect(trigger.getAttribute("aria-label")).toBe("Выбрать раскладку");
	});

	it("по showPlaceholder отображает именно переданный placeholder", async () => {
		await renderNode(
			<LayoutPicker
				value="single-cell"
				onChange={vi.fn<(value: string) => void>()}
				presets={TEST_LAYOUT_PICKER_PRESETS}
				placeholder="Выберите схему"
				showPlaceholder
			/>
		);

		const trigger = getRequiredElement(
			container?.querySelector<HTMLInputElement>('[data-ui="layout-picker-trigger"]'),
			"Не найдена кнопка LayoutPicker"
		);
		const placeholder = getRequiredElement(
			container?.querySelector<HTMLElement>('[data-ui="layout-picker-placeholder"]'),
			"Не найден текст placeholder LayoutPicker"
		);
		const overlay = getRequiredElement(placeholder.parentElement, "Не найден overlay значения LayoutPicker");

		expect(placeholder.textContent).toBe("Выберите схему");
		expect(overlay.textContent).toBe("Выберите схему");
		expect(trigger.value).toBe("Одна ячейка");
		expect(trigger.getAttribute("aria-label")).toBe("Выбрать layout. Текущее значение: Одна ячейка");
	});

	it("рендерит кнопку текущего layout и открывает popup с пресетами", async () => {
		await renderNode(<ControlledLayoutPickerHarness />);

		const trigger = getRequiredElement(
			container?.querySelector<HTMLButtonElement>('[data-ui="layout-picker-trigger"]'),
			"Не найдена кнопка LayoutPicker"
		);

		expect(trigger.type).toBe("button");
		expect(trigger.value).toBe("1x1");
		expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
		expect(trigger.getAttribute("aria-expanded")).toBe("false");

		await act(async () => {
			trigger.click();
		});

		expect(trigger.getAttribute("aria-expanded")).toBe("true");
		expect(trigger.getAttribute("aria-controls")).toBeTruthy();
		expect(document.querySelectorAll('[role="option"]')).toHaveLength(DEFAULT_LAYOUT_PICKER_PRESETS.length);
		// expect(findOptionButton("1x1").getAttribute("aria-selected")).toBe("true");
	});

	it("вызывает onChange выбранным id и закрывает popup", async () => {
		const onChange = vi.fn<(value: string) => void>();
		await renderNode(<ControlledLayoutPickerHarness onChange={onChange} />);

		const trigger = getRequiredElement(
			container?.querySelector<HTMLButtonElement>('[data-ui="layout-picker-trigger"]'),
			"Не найдена кнопка LayoutPicker"
		);

		await act(async () => {
			trigger.click();
		});

		await act(async () => {
			findOptionButton("1x2").click();
		});

		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange.mock.calls[0]?.[0]).toBe("1x2");
		expect(trigger.value).toBe("1x2");
		expect(trigger.getAttribute("aria-expanded")).toBe("false");
	});

	it("поддерживает базовые props поля: label, description и size", async () => {
		const onChange = vi.fn<(value: string) => void>();
		await renderNode(
			<LayoutPicker label="Layout панели" description="Схема размещения блоков" size="sm" value="1x1" onChange={onChange} />
		);

		const trigger = getRequiredElement(
			container?.querySelector<HTMLButtonElement>('[data-ui="layout-picker-trigger"]'),
			"Не найдена кнопка LayoutPicker"
		);
		const label = getRequiredElement(document.querySelector("label"), "Не найдена подпись LayoutPicker");
		const description = getRequiredElement(document.querySelector("p"), "Не найдено описание LayoutPicker");

		expect(label.textContent).toBe("Layout панели");
		expect(description.textContent).toBe("Схема размещения блоков");
		expect(trigger.getAttribute("aria-labelledby")).toBe(label.id);
		expect(trigger.getAttribute("aria-describedby")).toBe(description.id);
	});

	it("закрывает popup по Escape", async () => {
		await renderNode(<ControlledLayoutPickerHarness />);

		const trigger = getRequiredElement(
			container?.querySelector<HTMLButtonElement>('[data-ui="layout-picker-trigger"]'),
			"Не найдена кнопка LayoutPicker"
		);

		await act(async () => {
			trigger.click();
		});

		const listbox = getRequiredElement(document.querySelector<HTMLElement>('[role="listbox"]'), "Не найден listbox LayoutPicker");

		await act(async () => {
			listbox.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
		});

		expect(trigger.getAttribute("aria-expanded")).toBe("false");
	});

	it("позволяет выбрать пресет клавиатурой через listbox", async () => {
		await renderNode(<ControlledLayoutPickerHarness />);

		const trigger = getRequiredElement(
			container?.querySelector<HTMLButtonElement>('[data-ui="layout-picker-trigger"]'),
			"Не найдена кнопка LayoutPicker"
		);

		await act(async () => {
			trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
		});

		const listbox = getRequiredElement(document.querySelector<HTMLElement>('[role="listbox"]'), "Не найден listbox LayoutPicker");

		await act(async () => {
			listbox.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
		});

		await act(async () => {
			listbox.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
		});

		expect(trigger.value).toBe("1x2");
		expect(trigger.getAttribute("aria-expanded")).toBe("false");
	});

	it("отображает disabled-состояние опции и не выбирает ее", async () => {
		const onChange = vi.fn<(value: string) => void>();
		await renderNode(<ControlledLayoutPickerHarness onChange={onChange} getPresetDisabled={(preset) => preset.id === "1x2"} />);

		const trigger = getRequiredElement(
			container?.querySelector<HTMLButtonElement>('[data-ui="layout-picker-trigger"]'),
			"Не найдена кнопка LayoutPicker"
		);

		await act(async () => {
			trigger.click();
		});

		const disabledOption = findOptionButton("1x2");
		expect(disabledOption.disabled).toBe(true);
		expect(disabledOption.getAttribute("aria-disabled")).toBe("true");

		await act(async () => {
			disabledOption.click();
		});

		expect(onChange).not.toHaveBeenCalled();
		expect(trigger.value).toBe("1x1");
	});
});
