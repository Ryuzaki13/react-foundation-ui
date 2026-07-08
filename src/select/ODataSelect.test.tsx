/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
// @vitest-environment jsdom

import React, { act } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

type MockItem = {
	ZDIV: string;
	ZDIV_TXT: string;
	ZCFO1: string;
	ZCFO1_TXT: string;
	VSTEL: string;
	VSTEL_TXT: string;
	KUNNR: string;
	KUNNR_TXT: string;
};

const ITEMS: MockItem[] = [
	{
		ZDIV: "1000",
		ZDIV_TXT: "Металл",
		ZCFO1: "0202",
		ZCFO1_TXT: "Екатеринбург",
		VSTEL: "1158",
		VSTEL_TXT: "Склад ЕКБ-1",
		KUNNR: "0001000010",
		KUNNR_TXT: "СтройСнаб"
	},
	{
		ZDIV: "1000",
		ZDIV_TXT: "Металл",
		ZCFO1: "0204",
		ZCFO1_TXT: "Челябинск",
		VSTEL: "1180",
		VSTEL_TXT: "Склад ЧЛБ",
		KUNNR: "0001000020",
		KUNNR_TXT: "ПромСервис"
	},
	{
		ZDIV: "2000",
		ZDIV_TXT: "Машиностроение",
		ZCFO1: "0301",
		ZCFO1_TXT: "Тюмень",
		VSTEL: "2100",
		VSTEL_TXT: "Склад ТМН",
		KUNNR: "0001000030",
		KUNNR_TXT: "ТюменьЛогистик"
	},
	{
		ZDIV: "2000",
		ZDIV_TXT: "Машиностроение",
		ZCFO1: "0302",
		ZCFO1_TXT: "Пермь",
		VSTEL: "2110",
		VSTEL_TXT: "Склад ПРМ",
		KUNNR: "0001000050",
		KUNNR_TXT: "ПермьКомплект"
	}
];

const TEXT_KEYS: Record<string, keyof MockItem> = {
	ZDIV: "ZDIV_TXT",
	ZCFO1: "ZCFO1_TXT",
	VSTEL: "VSTEL_TXT",
	KUNNR: "KUNNR_TXT"
};

let lastMultiSelectProps: Record<string, unknown> | null = null;
let lastSelectProps: Record<string, unknown> | null = null;

vi.mock("@ryuzaki13/react-foundation-api/odata", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@ryuzaki13/react-foundation-api/odata")>();

	return {
		...actual,
		useODataCollectionModel: (model: {
			codeKey: string;
			maxVisibleItems?: number;
			minSearchCodeLength?: number;
			minSearchTextLength?: number;
			searchDebounceDelay?: number;
		}) => ({
			maxVisibleItems: 100,
			minSearchCodeLength: 1,
			minSearchTextLength: 1,
			searchDebounceDelay: 0,
			...model
		}),
		useODataCollection: ({ odata, model }: { odata: { target?: string }; model: { codeKey: string } }) => {
			const isLoading = odata.target === "Loading";
			const isError = odata.target === "Error";
			const data = React.useMemo(() => {
				if (isLoading || isError) {
					return undefined;
				}

				return {
					items: ITEMS,
					keyPairs: Object.entries(TEXT_KEYS).map(([key, textKey]) => ({ key, textKey })),
					separated: {
						ZDIV: ITEMS,
						ZCFO1: ITEMS,
						VSTEL: ITEMS,
						KUNNR: ITEMS
					},
					keyPairsMap: TEXT_KEYS,
					chain: [
						{ codeKey: "ZDIV", count: 2 },
						{ codeKey: "ZCFO1", count: 4 },
						{ codeKey: "VSTEL", count: 4 },
						{ codeKey: "KUNNR", count: 4 }
					]
				};
			}, [isError, isLoading]);
			const codeKey = model.codeKey;
			const textKey = data?.keyPairsMap[codeKey] ?? "";
			const separatedMap = data?.separated as Partial<Record<string, MockItem[]>> | undefined;
			const separatedItems = separatedMap?.[codeKey] ?? [];
			const [filteredItems, setFilteredItems] = React.useState<MockItem[] | undefined>();

			const findSourceItemsByKeys = React.useCallback((key: keyof MockItem, keys: string[]) => {
				const keySet = new Set(keys);
				return ITEMS.filter((item) => keySet.has(String(item[key])));
			}, []);

			const getItems = React.useCallback(
				(predicate?: (codeValue: string, textValue: string) => boolean, currentSelectedKeys?: readonly MockItem[]) => {
					if (!data) {
						return [];
					}

					const selectedKeys = new Set((currentSelectedKeys ?? []).map((item) => String(item[codeKey as keyof MockItem])));
					const filteredKeys = filteredItems
						? new Set(filteredItems.map((item) => String(item[codeKey as keyof MockItem])))
						: undefined;

					return separatedItems.filter((item: MockItem) => {
						const itemKey = String(item[codeKey as keyof MockItem]);
						const itemText = textKey ? String(item[textKey] ?? "") : "";

						if (selectedKeys.has(itemKey)) {
							return false;
						}

						if (filteredKeys && !filteredKeys.has(itemKey)) {
							return false;
						}

						return predicate ? predicate(itemKey, itemText) : true;
					});
				},
				[codeKey, data, filteredItems, separatedItems, textKey]
			);

			return {
				data,
				textKey,
				isLoading,
				isError,
				getItems,
				separatedItems,
				findSourceItemsByKeys,
				setFilteredItems,
				debounce: (_key: string, fn: () => void) => fn(),
				getCacheStats: () => ({})
			};
		}
	};
});

vi.mock("./Select", () => ({
	Select: function MockSelect(props: Record<string, any>) {
		lastSelectProps = props;

		return (
			<div
				data-testid="select"
				data-placeholder={props.placeholder ?? ""}
				data-disabled={String(Boolean(props.disabled))}
				data-loading={String(props.loadingState ?? "")}
				data-error={String(props.errorState ?? "")}
				data-empty={String(props.emptyState ?? "")}
				data-searchable={String(Boolean(props.searchable))}
				data-query={String(props.query ?? "")}>
				<input
					data-testid="select-input"
					value={String(props.query ?? "")}
					onChange={(event) => props.onQuery?.(event.currentTarget.value)}
					readOnly={!props.searchable}
				/>
				<div data-testid="select-header">{props.renderPopupHeader}</div>
				<div data-testid="select-options">
					{props.options.map((option: unknown, index: number) => (
						<button
							key={String(props.getOptionKey(option))}
							type="button"
							data-testid={`select-option-${index}`}
							data-code={String(props.getOptionCode?.(option) ?? "")}
							onClick={() => props.onChange(option)}>
							{String(props.getOptionLabel(option))}
						</button>
					))}
				</div>
			</div>
		);
	}
}));

vi.mock("../multi-select/ui/MultiSelect", () => ({
	MultiSelect: function MockMultiSelect(props: Record<string, any>) {
		lastMultiSelectProps = props;

		return (
			<div
				data-testid="multi-select"
				data-placeholder={props.placeholder ?? ""}
				data-disabled={String(Boolean(props.disabled))}
				data-error={String(props.error ?? "")}
				data-query={String(props.query ?? "")}>
				<div data-testid="multi-select-options">
					{props.items.map((item: MockItem, index: number) => (
						<button
							key={`${item[props.codeKey as keyof MockItem]}-${index}`}
							type="button"
							data-testid={`multi-option-${index}`}
							onClick={() => props.onChange([item])}>
							{String(item[props.textKey as keyof MockItem])}
						</button>
					))}
				</div>
			</div>
		);
	}
}));

import { ODataMultiSelect } from "../multi-select/ui/ODataMultiSelect";

import { ODataSelect } from "./ODataSelect";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

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

function getOptionTexts(testIdPrefix: string) {
	return Array.from(container?.querySelectorAll(`[data-testid^="${testIdPrefix}"]`) ?? []).map((node) => node.textContent ?? "");
}

afterEach(async () => {
	lastMultiSelectProps = null;
	lastSelectProps = null;

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

describe("ODataSelect", () => {
	it("сохраняет выбранную option в списке при поиске и фильтрует остальные значения", async () => {
		await renderNode(
			<ODataSelect
				label="Филиал"
				odata={{ service: "DEMO_REFERENCE_SRV", target: "DemoReferenceItems" }}
				model={{ codeKey: "ZCFO1" }}
				segment={{ placeholder: "Филиал" }}
				value="0202"
				onChange={vi.fn()}
			/>
		);

		expect(getOptionTexts("select-option-")).toEqual(["Екатеринбург", "Челябинск", "Тюмень", "Пермь"]);

		const input = container?.querySelector('[data-testid="select-input"]');

		await act(async () => {
			if (input) {
				const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
				valueSetter?.call(input, "Тюм");
				input.dispatchEvent(new Event("input", { bubbles: true }));
			}
		});

		expect(getOptionTexts("select-option-")).toEqual(["Екатеринбург", "Тюмень"]);
		expect((lastSelectProps as { searchable?: boolean } | null)?.searchable).toBe(true);
		expect(container?.querySelector('[data-testid="select-header"]')?.textContent).toBe("");
	});

	it("применяет зависимости, умеет возвращать текст и скрывает код", async () => {
		const onChange = vi.fn();

		await renderNode(
			<ODataSelect
				label="Филиал"
				odata={{ service: "S1", target: "T1" }}
				model={{ codeKey: "ZCFO1" }}
				segment={{ placeholder: "Филиал", hideCode: true, selectText: true }}
				dependencies={{ ZDIV: ["2000"] }}
				value={undefined}
				onChange={onChange}
			/>
		);

		expect(getOptionTexts("select-option-")).toEqual(["Тюмень", "Пермь"]);
		expect(
			Array.from(container?.querySelectorAll('[data-testid^="select-option-"]') ?? []).every(
				(node) => node.getAttribute("data-code") === ""
			)
		).toBe(true);

		const secondOption = container?.querySelector('[data-testid="select-option-1"]') as HTMLButtonElement;

		await act(async () => {
			secondOption.click();
		});

		expect(onChange).toHaveBeenCalledWith("Пермь");
	});

	it("рендерит loading-состояние без базового Select", async () => {
		await renderNode(
			<ODataSelect
				label="Склад"
				odata={{ service: "S1", target: "Loading" }}
				model={{ codeKey: "VSTEL" }}
				segment={{ placeholder: "Склад" }}
				value={undefined}
				onChange={vi.fn()}
			/>
		);

		expect(container?.querySelector('[data-testid="select"]')).toBeNull();
		expect(container?.textContent).toContain("Склад");
	});

	it("пробрасывает error состояние в базовый Select", async () => {
		await renderNode(
			<ODataSelect
				label="Склад"
				odata={{ service: "S1", target: "Error" }}
				model={{ codeKey: "VSTEL" }}
				segment={{ placeholder: "Склад" }}
				value={undefined}
				onChange={vi.fn()}
			/>
		);

		expect(container?.querySelector('[data-testid="select"]')?.getAttribute("data-error")).toBe("Ошибка загрузки");
	});

	it("пробрасывает clearable в базовый Select", async () => {
		await renderNode(
			<ODataSelect
				label="Склад"
				odata={{ service: "S1", target: "T1" }}
				model={{ codeKey: "VSTEL" }}
				segment={{ placeholder: "Склад" }}
				value="1158"
				onChange={vi.fn()}
				clearable
			/>
		);

		expect((lastSelectProps as { clearable?: boolean } | null)?.clearable).toBe(true);
	});
});

describe("ODataMultiSelect", () => {
	it("сохраняет mapping selectText и фильтрацию по dependencies", async () => {
		const onChange = vi.fn();

		await renderNode(
			<ODataMultiSelect
				label="Склад"
				odata={{ service: "S1", target: "T1" }}
				model={{ codeKey: "VSTEL" }}
				segment={{ placeholder: "Склад", selectText: true }}
				dependencies={{ ZDIV: ["2000"] }}
				value={[]}
				onChange={onChange}
			/>
		);

		expect(getOptionTexts("multi-option-")).toEqual(["Склад ТМН", "Склад ПРМ"]);

		const firstOption = container?.querySelector('[data-testid="multi-option-0"]') as HTMLButtonElement;

		await act(async () => {
			firstOption.click();
		});

		expect(onChange).toHaveBeenCalledWith(["Склад ТМН"]);
		expect((lastMultiSelectProps as { placeholder?: string } | null)?.placeholder).toBe("Склад <2+>");
	});
});
