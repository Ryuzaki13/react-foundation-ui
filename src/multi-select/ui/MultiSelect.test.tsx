// @vitest-environment jsdom

import React, { act } from "react";

import userEvent from "@testing-library/user-event";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MultiSelect } from "./MultiSelect";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
window.HTMLElement.prototype.scrollIntoView = () => undefined;

type CatalogOption = {
	id: string;
	label: string;
	displayCode: string;
	group?: string;
	searchAliases: readonly string[];
	unit: "руб" | "тн";
};

const OPTIONS: CatalogOption[] = [
	{
		id: "internal-001",
		label: "Альфа",
		displayCode: "DUP",
		group: "Коммерческий блок",
		searchAliases: ["первый"],
		unit: "руб"
	},
	{
		id: "internal-002",
		label: "Бета",
		displayCode: "DUP",
		group: "Коммерческий блок",
		searchAliases: ["второй"],
		unit: "тн"
	},
	{
		id: "internal-003",
		label: "Гамма",
		displayCode: "OPS",
		group: "Операционный блок",
		searchAliases: ["третий"],
		unit: "руб"
	}
];

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

async function openOptions() {
	const openButton = container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement;

	await act(async () => {
		openButton.click();
	});
}

async function closeOptions() {
	const closeButton = document.querySelector('button[aria-label="Закрыть список"]') as HTMLButtonElement;

	await act(async () => {
		closeButton.click();
	});
}

async function enterQuery(input: HTMLInputElement, query: string) {
	await act(async () => {
		const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
		valueSetter?.call(input, query);
		input.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

function getOptionRows() {
	return Array.from(document.querySelectorAll<HTMLElement>('[role="row"]')).filter((row) => row.querySelector('input[type="checkbox"]'));
}

function getRowByLabel(label: string) {
	return getOptionRows().find((row) => row.textContent?.includes(label));
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
	it("отделяет ошибку выбора от ошибки загрузки списка", async () => {
		await renderNode(
			<MultiSelect
				label="Каталог"
				required
				fieldError="Выберите опцию"
				error="Ошибка загрузки"
				options={OPTIONS}
				value={[]}
				onChange={vi.fn()}
				getOptionKey={(option) => option.id}
				getOptionLabel={(option) => option.label}
			/>
		);

		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;
		const fieldError = container?.querySelector('[role="alert"]');
		expect(input.getAttribute("aria-required")).toBe("true");
		expect(input.getAttribute("aria-invalid")).toBe("true");
		expect(input.getAttribute("aria-describedby")?.split(" ")).toContain(fieldError?.id);
		expect(fieldError?.textContent).toBe("Выберите опцию");
		await openOptions();
		expect(document.querySelector('[role="grid"]')?.textContent).toContain("Ошибка загрузки");
	});

	it("разделяет identity и отображаемый code и подтверждает checkbox-черновик только при закрытии", async () => {
		const committedClone = { ...OPTIONS[0]! };
		const onChange = vi.fn<(value: CatalogOption[]) => void>();

		await renderNode(
			<MultiSelect
				label="Каталог"
				options={OPTIONS}
				value={[committedClone]}
				onChange={onChange}
				getOptionKey={(option) => option.id}
				getOptionLabel={(option) => option.label}
				getOptionCode={(option) => option.displayCode}
			/>
		);

		await openOptions();

		const rows = getOptionRows();
		expect(rows).toHaveLength(3);
		expect(rows[0]?.getAttribute("aria-selected")).toBe("true");
		expect(rows[0]?.textContent).toContain("DUP");
		expect(rows[1]?.textContent).toContain("DUP");

		const betaCheckBox = rows[1]?.querySelector<HTMLInputElement>('input[type="checkbox"]');
		await act(async () => {
			betaCheckBox?.click();
		});

		expect(onChange).not.toHaveBeenCalled();

		await closeOptions();

		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledWith([committedClone, OPTIONS[1]]);
	});

	it("сохраняет фокус trigger после клика по checkbox и продолжает клавиатурную навигацию", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn<(value: CatalogOption[]) => void>();

		await renderNode(
			<MultiSelect
				label="Каталог"
				options={OPTIONS}
				value={[]}
				onChange={onChange}
				getOptionKey={(option) => option.id}
				getOptionLabel={(option) => option.label}
			/>
		);

		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;
		input.focus();
		await user.click(container?.querySelector('button[aria-label="Открыть список"]') as HTMLButtonElement);

		const betaCheckBox = getOptionRows()[1]?.querySelector<HTMLInputElement>('input[type="checkbox"]');
		if (!betaCheckBox) {
			throw new Error("Checkbox второй опции не найден");
		}
		await user.click(betaCheckBox);

		expect(document.activeElement).toBe(input);
		expect(getOptionRows()[1]?.getAttribute("aria-selected")).toBe("true");

		await user.keyboard("{ArrowDown}");
		expect(input.getAttribute("aria-activedescendant")).toBe(getOptionRows()[1]?.id);

		await user.keyboard("{Control>} {/Control}");
		expect(getOptionRows()[1]?.getAttribute("aria-selected")).toBe("false");

		await user.keyboard("{Enter}");
		expect(onChange).toHaveBeenCalledWith([OPTIONS[1]]);
		expect(input.getAttribute("aria-expanded")).toBe("false");
	});

	it("не теряет falsy option при отображении токена и keyboard toggle/activation", async () => {
		const onChange = vi.fn<(value: number[]) => void>();

		function NumberMultiSelect() {
			const [value, setValue] = React.useState<number[]>([]);

			return (
				<MultiSelect
					label="Числа"
					options={[0, 1]}
					value={value}
					onChange={(nextValue) => {
						onChange(nextValue);
						setValue(nextValue);
					}}
					getOptionKey={String}
					getOptionLabel={String}
				/>
			);
		}

		await renderNode(<NumberMultiSelect />);
		await openOptions();

		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;
		await act(async () => {
			input.dispatchEvent(new KeyboardEvent("keydown", { key: " ", code: "Space", ctrlKey: true, bubbles: true }));
		});

		expect(getOptionRows()[0]?.getAttribute("aria-selected")).toBe("true");
		expect(onChange).not.toHaveBeenCalled();

		await act(async () => {
			input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
		});

		expect(onChange).toHaveBeenCalledWith([0]);
		expect(container?.querySelector('[data-ui="picker-selected-token"]')?.textContent).toBe("0");
	});

	it("по умолчанию ищет по label, code и group, но не использует identity key", async () => {
		await renderNode(
			<MultiSelect
				label="Каталог"
				options={OPTIONS}
				value={[]}
				onChange={() => undefined}
				getOptionKey={(option) => option.id}
				getOptionLabel={(option) => option.label}
				getOptionCode={(option) => option.displayCode}
				getOptionGroup={(option) => (option.group ? { key: option.group, label: <span>{option.group}</span> } : undefined)}
			/>
		);

		await openOptions();
		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;

		await enterQuery(input, "Альфа");
		expect(getOptionRows().map((row) => row.textContent)).toEqual([expect.stringContaining("Альфа")]);

		await enterQuery(input, "OPS");
		expect(getOptionRows().map((row) => row.textContent)).toEqual([expect.stringContaining("Гамма")]);

		await enterQuery(input, "Коммерческий блок");
		expect(getOptionRows().map((row) => row.textContent)).toEqual([expect.stringContaining("Альфа"), expect.stringContaining("Бета")]);

		await enterQuery(input, "internal-001");
		expect(getOptionRows()).toHaveLength(0);
	});

	it("использует явный search text независимо от отображаемых selector-значений", async () => {
		await renderNode(
			<MultiSelect
				label="Каталог"
				options={OPTIONS}
				value={[]}
				onChange={() => undefined}
				getOptionKey={(option) => option.id}
				getOptionLabel={(option) => option.label}
				getOptionCode={(option) => option.displayCode}
				getOptionSearchText={(option) => option.searchAliases}
			/>
		);

		await openOptions();
		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;

		await enterQuery(input, "второй");
		expect(getOptionRows().map((row) => row.textContent)).toEqual([expect.stringContaining("Бета")]);

		await enterQuery(input, "Бета");
		expect(getOptionRows()).toHaveLength(0);
	});

	it("группирует committed и available секции независимо и пропускает заголовки при keyboard selection", async () => {
		const ungroupedOption: CatalogOption = {
			id: "internal-004",
			label: "Без группы",
			displayCode: "FREE",
			searchAliases: [],
			unit: "руб"
		};
		const options = [OPTIONS[0]!, OPTIONS[1]!, ungroupedOption, OPTIONS[2]!];
		const committedClone = { ...OPTIONS[0]! };
		const onChange = vi.fn<(value: CatalogOption[]) => void>();

		await renderNode(
			<MultiSelect
				label="Каталог"
				options={options}
				value={[committedClone]}
				onChange={onChange}
				getOptionKey={(option) => option.id}
				getOptionLabel={(option) => option.label}
				getOptionCode={(option) => option.displayCode}
				getOptionGroup={(option) => (option.group ? { key: option.group, label: option.group } : undefined)}
			/>
		);

		await openOptions();

		const rowGroups = Array.from(document.querySelectorAll<HTMLElement>('[role="rowgroup"]'));
		expect(rowGroups.map((group) => group.querySelector('[role="row"]')?.textContent?.trim())).toEqual([
			"Коммерческий блок",
			"Коммерческий блок",
			"Операционный блок"
		]);
		expect(getOptionRows().map((row) => row.textContent?.trim())).toEqual(["АльфаDUP", "БетаDUP", "Без группыFREE", "ГаммаOPS"]);
		expect(getRowByLabel("Без группы")?.closest('[role="rowgroup"]')).toBeNull();
		expect(document.querySelector('[role="grid"] [role="separator"]')).toBeTruthy();

		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;
		await act(async () => {
			input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
		});
		await act(async () => {
			input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
		});

		expect(onChange).toHaveBeenCalledWith([OPTIONS[1]]);
	});

	it("не оставляет separator, когда фильтр скрывает available-секцию", async () => {
		await renderNode(
			<MultiSelect
				label="Каталог"
				options={OPTIONS}
				value={[OPTIONS[0]!]}
				onChange={() => undefined}
				getOptionKey={(option) => option.id}
				getOptionLabel={(option) => option.label}
				getOptionCode={(option) => option.displayCode}
			/>
		);

		await openOptions();
		const input = container?.querySelector('input[role="combobox"]') as HTMLInputElement;
		await enterQuery(input, "Альфа");

		expect(getOptionRows()).toHaveLength(1);
		expect(document.querySelector('[role="grid"] [role="separator"]')).toBeNull();
	});

	it("пересчитывает typed disabled-context по draft и массово выбирает только совместимые опции", async () => {
		const metrics: CatalogOption[] = [
			{ id: "revenue", label: "Выручка", displayCode: "RUB", searchAliases: [], unit: "руб" },
			{ id: "weight", label: "Вес", displayCode: "TON", searchAliases: [], unit: "тн" },
			{ id: "plan", label: "План", displayCode: "PLAN", searchAliases: [], unit: "руб" }
		];
		const onChange = vi.fn<(value: CatalogOption[]) => void>();

		await renderNode(
			<MultiSelect
				label="Показатели"
				options={metrics}
				value={[]}
				onChange={onChange}
				getOptionKey={(option) => option.id}
				getOptionLabel={(option) => option.label}
				getOptionCode={(option) => option.displayCode}
				getOptionDisabled={(option, context) => {
					if (context.selectedKeys.has(option.id)) return false;
					const selectedUnit = context.selectedOptions[0]?.unit;
					return Boolean(selectedUnit && option.unit !== selectedUnit);
				}}
			/>
		);

		await openOptions();
		const revenueCheckBox = getRowByLabel("Выручка")?.querySelector<HTMLInputElement>('input[type="checkbox"]');
		await act(async () => {
			revenueCheckBox?.click();
		});

		expect(getRowByLabel("Вес")?.getAttribute("aria-disabled")).toBe("true");
		expect(getRowByLabel("План")?.getAttribute("aria-disabled")).toBeNull();

		const selectAllButton = document.querySelector('button[data-action="select-all"]') as HTMLButtonElement;
		await act(async () => {
			selectAllButton.click();
		});
		await closeOptions();

		expect(onChange).toHaveBeenCalledWith([metrics[0], metrics[2]]);
	});
});
