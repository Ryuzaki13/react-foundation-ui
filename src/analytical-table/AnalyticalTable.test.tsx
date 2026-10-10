import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AnalyticalTable } from "./AnalyticalTable";
import { testColumns, testSnapshot } from "./test-fixtures/analyticalTableTestData";
import { installAnalyticalGeometry } from "./test-fixtures/installAnalyticalGeometry";
import { type AnalyticalTableProps } from "./types/props";

beforeEach(() => installAnalyticalGeometry());
afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

function cell(container: HTMLElement, row: string, column: string) {
	const element = container.querySelector<HTMLElement>(`td[data-analytical-row-id="${row}"][data-analytical-column-id="${column}"]`);
	if (!element) throw new Error(`Не найдена ячейка ${row}/${column}`);
	return element;
}
function action(container: HTMLElement, name: string, column?: string) {
	const element = container.querySelector<HTMLElement>(`[data-action="${name}"]${column ? `[data-column-id="${column}"]` : ""}`);
	if (!element) throw new Error(`Не найдена команда ${name}/${column}`);
	return element;
}
const options: AnalyticalTableProps = {
	snapshot: testSnapshot,
	columns: testColumns,
	initialViewportHeight: 216,
	rowHeight: 36,
	overscan: 1
};

describe("AnalyticalTable SSR and native structure", () => {
	it("рендерит начальное окно и гидратируется без восстановления DOM", async () => {
		const browserDocument = document;
		vi.stubGlobal("document", undefined);
		const html = renderToString(<AnalyticalTable {...options} defaultState={{ expandedRowIds: ["a"] }} />);
		vi.stubGlobal("document", browserDocument);
		expect(html).toContain("Альфа");
		expect(html).toContain("Деталь");
		const container = document.createElement("div");
		container.innerHTML = html;
		document.body.append(container);
		const table = container.querySelector("table");
		const recover = vi.fn();
		const error = vi.spyOn(console, "error");
		let root: ReturnType<typeof hydrateRoot>;
		await act(async () => {
			root = hydrateRoot(container, <AnalyticalTable {...options} defaultState={{ expandedRowIds: ["a"] }} />, {
				onRecoverableError: recover
			});
		});
		expect(container.querySelector("table")).toBe(table);
		expect(recover).not.toHaveBeenCalled();
		expect(error.mock.calls.flat().join(" ")).not.toMatch(/hydration|cannot be a child|cannot contain/i);
		expect(Array.from(table!.children).map((child) => child.tagName)).toEqual(["COLGROUP", "THEAD", "TBODY", "TFOOT"]);
		await act(async () => root!.unmount());
		container.remove();
	});
	it("служебные колонки отделены, totals label занимает dimensions до первой меры", async () => {
		const { container } = render(<AnalyticalTable {...options} rowSelectionMode="multi" grandTotalsLabel="Итого по видимым строкам" />);
		await screen.findByText("Альфа");
		expect(container.querySelectorAll("colgroup col")).toHaveLength(testColumns.length + 2);
		expect(container.querySelector("tfoot td")?.getAttribute("colspan")).toBe("4");
		expect(container.querySelector('[data-total-column-id="amount"]')?.textContent).toBe("30 руб.");
	});
	it("показывает несколько уровней шапки и сворачивает родительскую группу", async () => {
		const groups = [
			{
				id: "all",
				label: "Показатели",
				columnIds: ["margin"],
				collapsedColumnId: "margin",
				children: [{ id: "fact", label: "Факт", columnIds: ["amount", "cost"] }]
			}
		];
		const { container } = render(<AnalyticalTable {...options} columnGroups={groups} />);
		expect(container.querySelectorAll("thead tr")).toHaveLength(3);
		fireEvent.click(container.querySelector('[data-column-group-id="all"]')!);
		expect(container.querySelector('th[data-column-id="amount"]')).toBeNull();
		expect(container.querySelector('th[data-column-id="margin"]')).not.toBeNull();
	});
});

describe("AnalyticalTable commands", () => {
	it("раскрывает snapshot дерево и сохраняет раскрытие при обновлении", async () => {
		const { container, rerender } = render(<AnalyticalTable {...options} />);
		expect(container.querySelector('tr[data-row-id="a-child"]')).toBeNull();
		fireEvent.click(action(container, "toggle-analytical-row"));
		expect(cell(container, "a-child", "name").textContent).toBe("Деталь");
		rerender(
			<AnalyticalTable
				{...options}
				snapshot={{
					rows: testSnapshot.rows.map((row) =>
						row.id === "a-child" ? { ...row, values: { ...row.values, name: "Новая деталь" } } : row
					)
				}}
			/>
		);
		expect(cell(container, "a-child", "name").textContent).toBe("Новая деталь");
		fireEvent.click(action(container, "collapse-analytical-all"));
		expect(container.querySelector('tr[data-row-id="a-child"]')).toBeNull();
	});
	it("сортирует несколько колонок и изменяет ширину клавиатурой", () => {
		const onStateChange = vi.fn();
		const { container } = render(<AnalyticalTable {...options} onStateChange={onStateChange} />);
		fireEvent.click(action(container, "sort-analytical-column", "amount"));
		fireEvent.click(action(container, "sort-analytical-column", "name"), { shiftKey: true });
		expect(onStateChange.mock.lastCall?.[0].sorting).toEqual([
			{ id: "amount", desc: false },
			{ id: "name", desc: false }
		]);
		const resize = container.querySelector('th[data-column-id="name"] [role="separator"]')!;
		fireEvent.keyDown(resize, { key: "ArrowRight" });
		expect(onStateChange.mock.lastCall?.[0].columnWidths.name).toBe(188);
		fireEvent.keyDown(resize, { key: "Home" });
		expect(onStateChange.mock.lastCall?.[0].columnWidths.name).toBe(180);
	});
	it("меню группировки разделяет ID и имя; showAsColumn переключается из toolbar", async () => {
		const { container } = render(<AnalyticalTable {...options} />);
		fireEvent.click(action(container, "analytical-column-menu", "unit"));
		fireEvent.click(await screen.findByText("Группировать"));
		expect(container.querySelector('th[data-column-id="unit"]')).toBeNull();
		expect(container.querySelectorAll("tbody tr[data-row-id]")).toHaveLength(2);
		const group = container.querySelector('[data-action="configure-analytical-group"]')!;
		fireEvent.click(group);
		fireEvent.click(await screen.findByText("Показывать подпись в колонке"));
		expect(container.querySelector('th[data-column-id="unit"]')).not.toBeNull();
		expect(container.querySelectorAll('td[data-analytical-column-id="__analytical_tree__"]')[0].textContent).toBe("");
	});
	it("контекстное меню фильтрует по значению и toolbar сбрасывает фильтр", async () => {
		const { container } = render(<AnalyticalTable {...options} />);
		fireEvent.contextMenu(cell(container, "b", "name"));
		fireEvent.click(await screen.findByText("Фильтровать по значению"));
		expect(container.querySelector('tr[data-row-id="a"]')).toBeNull();
		fireEvent.click(action(container, "clear-analytical-filter", "name"));
		expect(container.querySelector('tr[data-row-id="a"]')).not.toBeNull();
	});
	it("сохраняет pinned geometry при скрытии и восстановлении колонки", async () => {
		const { container } = render(<AnalyticalTable {...options} />);
		fireEvent.click(action(container, "analytical-column-menu", "name"));
		fireEvent.click(await screen.findByText("Закрепить"));
		expect(container.querySelector('th[data-column-id="name"]')?.getAttribute("style")).toContain("inset-inline-start: 40px");
		fireEvent.click(action(container, "analytical-column-menu", "name"));
		fireEvent.click(await screen.findByText("Скрыть колонку"));
		expect(container.querySelector('th[data-column-id="name"]')).toBeNull();
		fireEvent.click(action(container, "configure-analytical-columns"));
		fireEvent.click(await screen.findByLabelText("Название"));
		expect(container.querySelector('th[data-column-id="name"]')).not.toBeNull();
	});
	it("refresh и export являются capability callbacks, экспорт включает невидимые дочерние строки", async () => {
		const onExport = vi.fn();
		const onRefresh = vi.fn();
		const { container } = render(<AnalyticalTable {...options} onExport={onExport} onRefresh={onRefresh} />);
		fireEvent.click(action(container, "refresh-analytical-table"));
		expect(onRefresh).toHaveBeenCalledOnce();
		fireEvent.click(action(container, "export-analytical-table"));
		await waitFor(() => expect(onExport).toHaveBeenCalledOnce());
		expect(onExport.mock.calls[0][0].rows.map((row: { id: string }) => row.id)).toContain("a-child");
		expect(onExport.mock.calls[0][0].rows.at(-1).values[2]).toBe("30 руб.");
	});
});

describe("AnalyticalTable selection and focus", () => {
	it("none не выбирает строки; modifier selection отделён от обычного row selection", () => {
		const rows = vi.fn();
		const cells = vi.fn();
		const { container, rerender } = render(<AnalyticalTable {...options} onRowSelectionChange={rows} />);
		fireEvent.click(cell(container, "a", "name"));
		expect(rows).not.toHaveBeenCalled();
		rerender(
			<AnalyticalTable
				{...options}
				rowSelectionMode="multi"
				cellSelectionMode="multi"
				cellSelectionActivationMode="primary-modifier"
				onRowSelectionChange={rows}
				onCellSelectionChange={cells}
			/>
		);
		fireEvent.click(cell(container, "a", "name"));
		expect(rows.mock.lastCall?.[0].map((row: { id: string }) => row.id)).toEqual(["a"]);
		fireEvent.click(cell(container, "b", "name"), { ctrlKey: true });
		expect(cells.mock.lastCall?.[0]).toEqual([{ rowId: "b", columnId: "name" }]);
		expect(rows.mock.calls.filter((call) => call[0].length)).toHaveLength(1);
	});
	it("не выбирает запрещённые строки и не перехватывает интерактивные renderers", () => {
		const rows = vi.fn();
		const custom = vi.fn();
		const { container } = render(
			<AnalyticalTable
				{...options}
				columns={[...testColumns, { id: "action", render: () => <button onClick={custom}>Команда</button> }]}
				rowSelectionMode="multi"
				getRowCanSelect={(row) => row.id !== "b"}
				onRowSelectionChange={rows}
			/>
		);
		rows.mockClear();
		fireEvent.click(cell(container, "b", "name"));
		expect(rows).not.toHaveBeenCalled();
		fireEvent.click(screen.getAllByText("Команда")[0]);
		expect(custom).toHaveBeenCalledOnce();
		expect(rows).not.toHaveBeenCalled();
	});
	it("клавиатура выбирает строку/ячейку и переводит фокус стрелкой", async () => {
		const rows = vi.fn();
		const cells = vi.fn();
		const { container, rerender } = render(<AnalyticalTable {...options} rowSelectionMode="single" onRowSelectionChange={rows} />);
		fireEvent.keyDown(cell(container, "a", "name"), { key: "Enter" });
		expect(rows.mock.lastCall?.[0][0].id).toBe("a");
		rerender(<AnalyticalTable {...options} cellSelectionMode="single" onCellSelectionChange={cells} />);
		fireEvent.keyDown(cell(container, "a", "name"), { key: " " });
		expect(cells.mock.lastCall?.[0]).toEqual([{ rowId: "a", columnId: "name" }]);
		fireEvent.keyDown(cell(container, "a", "name"), { key: "ArrowDown" });
		await waitFor(() => expect(document.activeElement).toBe(cell(container, "b", "name")));
	});
	it("выбранные исчезнувшие строки и колонки не просачиваются в callback", () => {
		const callback = vi.fn();
		const { container, rerender } = render(<AnalyticalTable {...options} rowSelectionMode="multi" onRowSelectionChange={callback} />);
		fireEvent.click(cell(container, "a", "name"));
		rerender(
			<AnalyticalTable
				{...options}
				snapshot={{ rows: [testSnapshot.rows[2]] }}
				rowSelectionMode="multi"
				onRowSelectionChange={callback}
			/>
		);
		fireEvent.click(cell(container, "b", "name"));
		expect(callback.mock.lastCall?.[0].map((row: { id: string }) => row.id)).toEqual(["b"]);
	});
	it("виртуализирует 1000 строк и переносит фокус за пределы первого окна", async () => {
		const snapshot = { rows: Array.from({ length: 1000 }, (_, index) => ({ id: String(index), values: { name: `Строка ${index}` } })) };
		const { container } = render(<AnalyticalTable {...options} snapshot={snapshot} columns={[testColumns[1]]} />);
		expect(container.querySelectorAll("tbody tr[data-row-id]").length).toBeLessThan(15);
		for (let index = 0; index < 12; index++) {
			fireEvent.keyDown(cell(container, String(index), "name"), { key: "ArrowDown" });
			await waitFor(() => expect(document.activeElement?.getAttribute("data-analytical-row-id")).toBe(String(index + 1)));
		}
		expect(container.querySelectorAll("tbody tr[data-row-id]").length).toBeLessThan(15);
	});
});

describe("horizontal keyboard visibility", () => {
	it("End прокручивает горизонтальную область до выбранной ячейки", async () => {
		const { container } = render(<AnalyticalTable {...options} defaultState={{ pinnedColumnIds: ["name"] }} />);
		const target = cell(container, "a", "margin");
		Object.defineProperty(target, "getBoundingClientRect", {
			value: () => ({
				x: 1300,
				y: 36,
				left: 1300,
				right: 1460,
				top: 36,
				bottom: 72,
				width: 160,
				height: 36,
				toJSON: () => ({})
			})
		});
		fireEvent.keyDown(cell(container, "a", "name"), { key: "End" });
		await waitFor(() => expect(document.activeElement).toBe(target));
		expect(container.querySelector("table")?.parentElement?.scrollLeft).toBeGreaterThan(0);
	});
});

describe("AnalyticalTable renderer and selection contracts", () => {
	it("разделяет data/group renderer и сохраняет tree подпись при скрытой header-group", () => {
		const data = vi.fn(() => "Data renderer");
		const group = vi.fn(() => "Group renderer");
		const { container } = render(
			<AnalyticalTable
				{...options}
				columns={[{ ...testColumns[0], render: data }, ...testColumns.slice(1), { id: "groupOnly", renderGroup: group }]}
				columnGroups={[{ id: "fields", label: "Колонки", columnIds: ["unit", "amount"], collapsedColumnId: "amount" }]}
				defaultState={{ grouping: [{ ...testColumns[0].grouping!, showAsColumn: true }], collapsedColumnGroupIds: ["fields"] }}
				renderTreeLabel={() => "Подпись группы"}
			/>
		);
		expect(data).not.toHaveBeenCalled();
		expect(group).toHaveBeenCalled();
		expect(container.querySelector('td[data-analytical-column-id="__analytical_tree__"]')?.textContent).toBe("Подпись группы");
	});
	it("очищает row selection при исчезновении, а восстановленная строка остаётся невыбранной", async () => {
		const callback = vi.fn();
		const { container, rerender } = render(<AnalyticalTable {...options} rowSelectionMode="multi" onRowSelectionChange={callback} />);
		fireEvent.click(cell(container, "a", "name"));
		rerender(
			<AnalyticalTable
				{...options}
				snapshot={{ rows: [testSnapshot.rows[2]] }}
				rowSelectionMode="multi"
				onRowSelectionChange={callback}
			/>
		);
		await waitFor(() => expect(callback.mock.lastCall?.[0]).toEqual([]));
		rerender(<AnalyticalTable {...options} rowSelectionMode="multi" onRowSelectionChange={callback} />);
		expect(container.querySelector('tr[data-row-id="a"]')?.getAttribute("aria-selected")).toBe("false");
	});
	it("cell intent переживает фильтр, clipboard исключает скрытые координаты и использует свежие значения", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal("isSecureContext", true);
		Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
		const { container, rerender } = render(<AnalyticalTable {...options} cellSelectionMode="multi" />);
		fireEvent.click(cell(container, "a", "amount"));
		fireEvent.click(cell(container, "b", "amount"));
		const changedRows = testSnapshot.rows.map((row) => (row.id === "b" ? { ...row, values: { ...row.values, amount: 99 } } : row));
		rerender(
			<AnalyticalTable
				{...options}
				snapshot={{ rows: changedRows }}
				state={{ filters: [{ id: "name", operator: "equals", value: "Бета" }] }}
				cellSelectionMode="multi"
			/>
		);
		fireEvent.contextMenu(cell(container, "b", "amount"));
		fireEvent.click(await screen.findByText("Копировать значение"));
		await waitFor(() => expect(writeText).toHaveBeenCalledWith("99 руб."));
		rerender(<AnalyticalTable {...options} snapshot={{ rows: changedRows }} state={{}} cellSelectionMode="multi" />);
		expect(cell(container, "a", "amount").getAttribute("aria-selected")).toBe("true");
		Reflect.deleteProperty(navigator, "clipboard");
	});
	it("pipeline state/icon применяется к строкам и итогам", () => {
		const amount = {
			...testColumns[2],
			formatting: {
				version: 1 as const,
				plan: {
					steps: [
						{
							id: "state",
							type: "resolveValueState" as const,
							config: {
								resolver: {
									kind: "threshold" as const,
									thresholds: [15],
									states: ["success" as const, "warning" as const]
								},
								icon: { enabled: true, showValue: true, position: "right" as const }
							}
						}
					]
				}
			}
		};
		const { container } = render(<AnalyticalTable {...options} columns={[testColumns[1], amount]} />);
		expect(cell(container, "a", "amount").querySelector("svg.lucide-circle-check")).not.toBeNull();
		expect(container.querySelector('[data-total-column-id="amount"] svg.lucide-circle-alert')).not.toBeNull();
	});
});
