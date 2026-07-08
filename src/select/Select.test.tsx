// @vitest-environment jsdom

import React, { act, useState } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Select } from "./Select";
import { SerializableSelect } from "./SerializableSelect";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Option = {
	id: number;
	label: string;
};

const OPTIONS: Option[] = [
	{ id: 1, label: "Альфа" },
	{ id: 2, label: "Бета" },
	{ id: 3, label: "Гамма" }
];

function ControlledSelectHarness() {
	const [value, setValue] = useState<Option | undefined>(OPTIONS[0]);

	return (
		<Select
			label="Статус"
			placeholder="Выберите значение"
			options={OPTIONS}
			value={value}
			onChange={setValue}
			getOptionKey={(option) => option.id}
			getOptionLabel={(option) => option.label}
		/>
	);
}

function ClearableSelectHarness() {
	const [value, setValue] = useState<Option | undefined>(OPTIONS[0]);

	return (
		<Select
			label="Статус"
			placeholder="Выберите значение"
			clearable
			options={OPTIONS}
			value={value}
			onChange={setValue}
			getOptionKey={(option) => option.id}
			getOptionLabel={(option) => option.label}
		/>
	);
}

function SearchableSelectHarness() {
	const [value, setValue] = useState<Option | undefined>(OPTIONS[0]);
	const [query, setQuery] = useState("");

	return (
		<Select
			label="Статус"
			placeholder="Поиск"
			searchable
			query={query}
			onQuery={setQuery}
			options={OPTIONS}
			value={value}
			onChange={setValue}
			getOptionKey={(option) => option.id}
			getOptionLabel={(option) => option.label}
		/>
	);
}

function ClearableSearchableSelectHarness() {
	const [value, setValue] = useState<Option | undefined>(OPTIONS[0]);
	const [query, setQuery] = useState("");

	return (
		<Select
			label="Статус"
			placeholder="Поиск"
			clearable
			searchable
			query={query}
			onQuery={setQuery}
			options={OPTIONS}
			value={value}
			onChange={setValue}
			getOptionKey={(option) => option.id}
			getOptionLabel={(option) => option.label}
		/>
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

describe("Select", () => {
	it("рендерит readonly input-trigger и позволяет выбрать option клавиатурой и кликом", async () => {
		await renderNode(<ControlledSelectHarness />);

		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;
		expect(input).toBeTruthy();
		expect(input.readOnly).toBe(true);
		expect(input.value).toBe("Альфа");

		await act(async () => {
			input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
		});

		const options = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
		expect(options.map((option) => option.textContent?.trim())).toEqual(["Альфа", "Бета", "Гамма"]);

		await act(async () => {
			options[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(input.value).toBe("Бета");
	});

	it("в display режиме шеврон открывает и закрывает popup", async () => {
		await renderNode(<ControlledSelectHarness />);

		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;
		const openButton = container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement;

		await act(async () => {
			openButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(input.getAttribute("aria-expanded")).toBe("true");
		expect(document.querySelectorAll('[role="option"]')).toHaveLength(3);

		const closeButton = document.querySelector('button[aria-label="Закрыть список"]') as HTMLButtonElement;

		await act(async () => {
			closeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(input.getAttribute("aria-expanded")).toBe("false");
	});

	it("не показывает кнопку очистки без clearable", async () => {
		await renderNode(<ControlledSelectHarness />);

		expect(container?.querySelector('button[aria-label="Очистить выбор"]')).toBeNull();
	});

	it("очищает выбранное значение в clearable display режиме и не открывает popup", async () => {
		await renderNode(<ClearableSelectHarness />);

		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;
		const clearButton = container?.querySelector('button[aria-label="Очистить выбор"]') as HTMLButtonElement;
		expect(clearButton).toBeTruthy();

		await act(async () => {
			clearButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(input.value).toBe("");
		expect(input.placeholder).toBe("Выберите значение");
		expect(input.getAttribute("aria-expanded")).toBe("false");
		expect(document.querySelectorAll('[role="option"]')).toHaveLength(0);
		expect(container?.querySelector('button[aria-label="Очистить выбор"]')).toBeNull();
	});

	it("в searchable режиме использует input как trigger и сбрасывает query при закрытии", async () => {
		await renderNode(<SearchableSelectHarness />);

		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;
		expect(input.value).toBe("Альфа");

		await act(async () => {
			input.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(document.querySelectorAll('[role="option"]')).toHaveLength(0);

		const toggleButton = container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement;

		await act(async () => {
			toggleButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(document.querySelectorAll('[role="option"]')).toHaveLength(3);
		expect(document.activeElement).toBe(input);

		await act(async () => {
			const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
			valueSetter?.call(input, "Бе");
			input.dispatchEvent(new Event("input", { bubbles: true }));
		});

		expect(input.value).toBe("Бе");
		expect(Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).map((option) => option.textContent?.trim())).toEqual([
			"Бета"
		]);

		const closeButton = document.querySelector('button[aria-label="Закрыть список"]') as HTMLButtonElement;

		await act(async () => {
			closeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(input.value).toBe("Альфа");
		expect(input.getAttribute("aria-expanded")).toBe("false");
		expect(document.activeElement).toBe(input);
	});

	it("в clearable searchable режиме очищает value и query", async () => {
		await renderNode(<ClearableSearchableSelectHarness />);

		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;
		const toggleButton = container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement;

		await act(async () => {
			toggleButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		await act(async () => {
			const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
			valueSetter?.call(input, "Бе");
			input.dispatchEvent(new Event("input", { bubbles: true }));
		});

		expect(input.value).toBe("Бе");

		const clearButton = container?.querySelector('button[aria-label="Очистить выбор"]') as HTMLButtonElement;

		await act(async () => {
			clearButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(input.value).toBe("");
		expect(input.placeholder).toBe("Поиск");
		expect(input.getAttribute("aria-expanded")).toBe("false");
	});

	it("SerializableSelect при очистке возвращает undefined", async () => {
		const onChange = vi.fn();

		await renderNode(
			<SerializableSelect
				label="Статус"
				placeholder="Выберите значение"
				clearable
				options={[
					{ key: "active", text: "Активен" },
					{ key: "inactive", text: "Неактивен" }
				]}
				optionKey="key"
				optionLabel="text"
				value="active"
				onChange={onChange}
			/>
		);

		const clearButton = container?.querySelector('button[aria-label="Очистить выбор"]') as HTMLButtonElement;

		await act(async () => {
			clearButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(onChange).toHaveBeenCalledWith(undefined);
	});
});
