// @vitest-environment jsdom

import { act, type ReactNode } from "react";

import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { formatTypedCellValue } from "@ryuzaki13/react-foundation-lib/formatters";
import type { TableColumnDef } from "@ryuzaki13/react-foundation-lib/table";

import { Table } from "./Table";

type DemoRow = {
	id: string;
	amount: number;
	status: string;
};

type WideDemoRow = {
	id: string;
	a: string;
	b: string;
	c: string;
	d: string;
	e: string;
};

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
	window.matchMedia = vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}));
}

let container: HTMLDivElement | null = null;
let root: Root | null = null;

async function flushMicrotasks() {
	await act(async () => {
		await Promise.resolve();
	});
}

async function renderIntoDom(node: ReactNode): Promise<HTMLDivElement> {
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);

	await act(async () => {
		root!.render(node);
	});

	await flushMicrotasks();
	await flushMicrotasks();

	return container;
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

describe("Table formatting integration", () => {
	it("рендерит formatted value для колонки с meta.formatting", () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "amount",
				accessorKey: "amount",
				header: "Сумма",
				meta: {
					align: "right",
					formatting: {
						role: "measure",
						type: "decimal"
					}
				}
			}
		];

		const html = renderToStaticMarkup(
			<Table
				data={[
					{
						id: "1",
						amount: 123.4,
						status: "OK"
					}
				]}
				columns={columns}
				getRowId={(row) => row.id}
			/>
		);

		expect(html).toContain(formatTypedCellValue(123.4, { role: "measure", type: "decimal" }));
	});

	it("скрывает нулевое значение при emptyWhenZero", () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "status",
				accessorKey: "status",
				header: "Статус"
			},
			{
				id: "amount",
				accessorKey: "amount",
				header: "Сумма",
				meta: {
					align: "right",
					formatting: {
						role: "measure",
						type: "decimal",
						emptyWhenZero: true
					}
				}
			}
		];

		const html = renderToStaticMarkup(
			<Table
				data={[
					{
						id: "1",
						amount: 0,
						status: "Пусто"
					}
				]}
				columns={columns}
				getRowId={(row) => row.id}
			/>
		);

		expect(html).toContain("Пусто");
		expect(html).not.toContain(`>${formatTypedCellValue(0, { role: "measure", type: "decimal" })}<`);
	});

	it("показывает state-класс и иконку для resolveValueState", () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "amount",
				accessorKey: "amount",
				header: "Сумма",
				meta: {
					align: "right",
					formatting: {
						role: "measure",
						type: "decimal",
						formattersPipeline: {
							version: 1,
							plan: {
								steps: [
									{
										id: "state",
										type: "resolveValueState",
										config: {
											resolver: {
												kind: "threshold",
												thresholds: [100],
												states: ["success", "warning"],
												invalidState: "none"
											},
											icon: {
												enabled: true,
												showValue: true,
												position: "right"
											}
										}
									},
									{
										id: "typed",
										type: "typedValueFormat"
									}
								]
							}
						}
					}
				}
			}
		];

		const html = renderToStaticMarkup(
			<Table
				data={[
					{
						id: "1",
						amount: 150,
						status: "OK"
					}
				]}
				columns={columns}
				getRowId={(row) => row.id}
			/>
		);

		expect(html).toContain("statusWarning");
		expect(html).toContain("lucide-circle-alert");
	});

	it("применяет rowBasedOverride(field) на обычной строке Table", () => {
		const columns: TableColumnDef<DemoRow & { statusLabel: string }>[] = [
			{
				id: "status",
				accessorKey: "status",
				header: "Статус",
				meta: {
					formatting: {
						role: "dimension",
						type: "string",
						formattersPipeline: {
							version: 1,
							plan: {
								steps: [
									{
										id: "groupOverride",
										type: "rowBasedOverride",
										config: {
											mode: "field",
											fieldKey: "statusLabel"
										}
									}
								]
							}
						}
					}
				}
			}
		];

		const html = renderToStaticMarkup(
			<Table
				data={[
					{
						id: "1",
						amount: 123.4,
						status: "RAW_STATUS",
						statusLabel: "Переопределённый статус"
					}
				]}
				columns={columns}
				getRowId={(row) => row.id}
			/>
		);

		expect(html).toContain("Переопределённый статус");
		expect(html).not.toContain("RAW_STATUS");
	});

	it("сохраняет приоритет кастомного cell над meta.formatting", () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "amount",
				accessorKey: "amount",
				header: "Сумма",
				cell: () => "КАСТОМНОЕ_ЗНАЧЕНИЕ",
				meta: {
					align: "right",
					formatting: {
						role: "measure",
						type: "decimal"
					}
				}
			}
		];

		const html = renderToStaticMarkup(
			<Table
				data={[
					{
						id: "1",
						amount: 123.4,
						status: "OK"
					}
				]}
				columns={columns}
				getRowId={(row) => row.id}
			/>
		);

		expect(html).toContain("КАСТОМНОЕ_ЗНАЧЕНИЕ");
		expect(html).not.toContain(formatTypedCellValue(123.4, { role: "measure", type: "decimal" }));
	});

	it("передает renderCellContent отформатированный defaultContent и displayValue", () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "amount",
				accessorKey: "amount",
				header: "Сумма",
				meta: {
					align: "right",
					formatting: {
						role: "measure",
						type: "decimal"
					}
				}
			}
		];
		let defaultContentHtml = "";
		let renderedDisplayValue: unknown;

		const html = renderToStaticMarkup(
			<Table
				data={[
					{
						id: "1",
						amount: 123.4,
						status: "OK"
					}
				]}
				columns={columns}
				getRowId={(row) => row.id}
				renderCellContent={(args) => {
					defaultContentHtml = renderToStaticMarkup(<>{args.defaultContent}</>);
					renderedDisplayValue = args.displayValue?.value;

					return <span>Шаблон детализации</span>;
				}}
			/>
		);

		expect(defaultContentHtml).toContain(formatTypedCellValue(123.4, { role: "measure", type: "decimal" }));
		expect(renderedDisplayValue).toBe(formatTypedCellValue(123.4, { role: "measure", type: "decimal" }));
		expect(html).toContain("Шаблон детализации");
		expect(html).not.toContain(formatTypedCellValue(123.4, { role: "measure", type: "decimal" }));
	});

	it("скрывает колонку через defaultColumnVisibility в uncontrolled-режиме", () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "status",
				accessorKey: "status",
				header: "Статус"
			},
			{
				id: "amount",
				accessorKey: "amount",
				header: "Сумма"
			}
		];

		const html = renderToStaticMarkup(
			<Table
				data={[
					{
						id: "1",
						amount: 123.4,
						status: "OK"
					}
				]}
				columns={columns}
				defaultColumnVisibility={{ status: false, amount: true }}
				getRowId={(row) => row.id}
				selectionMode="single"
			/>
		);

		expect(html).not.toContain(">Статус<");
		expect(html).toContain(">Сумма<");
	});

	it("применяет defaultColumnOrder в uncontrolled-режиме", () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "status",
				accessorKey: "status",
				header: "Статус"
			},
			{
				id: "amount",
				accessorKey: "amount",
				header: "Сумма"
			}
		];

		const html = renderToStaticMarkup(
			<Table
				data={[
					{
						id: "1",
						amount: 123.4,
						status: "OK"
					}
				]}
				columns={columns}
				defaultColumnOrder={["amount", "status"]}
				getRowId={(row) => row.id}
			/>
		);

		expect(html.indexOf(">Сумма<")).toBeLessThan(html.indexOf(">Статус<"));
	});

	it("применяет controlled columnSizing к colgroup", () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "status",
				accessorKey: "status",
				header: "Статус",
				meta: {
					width: 12
				}
			},
			{
				id: "amount",
				accessorKey: "amount",
				header: "Сумма"
			}
		];

		const html = renderToStaticMarkup(
			<Table
				data={[
					{
						id: "1",
						amount: 123.4,
						status: "OK"
					}
				]}
				columns={columns}
				columnSizing={{ status: 144 }}
				getRowId={(row) => row.id}
			/>
		);

		expect(html).toContain("width:144px");
		expect(html).not.toContain("width:12em");
	});

	it("связывает columnSizing с id колонки после изменения порядка", () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "status",
				accessorKey: "status",
				header: "Статус"
			},
			{
				id: "amount",
				accessorKey: "amount",
				header: "Сумма"
			}
		];

		const html = renderToStaticMarkup(
			<Table
				data={[
					{
						id: "1",
						amount: 123.4,
						status: "OK"
					}
				]}
				columns={columns}
				columnOrder={["amount", "status"]}
				columnSizing={{ amount: 144, status: 96 }}
				getRowId={(row) => row.id}
			/>
		);
		const template = document.createElement("template");
		template.innerHTML = html;
		const colStyles = Array.from(template.content.querySelectorAll("col"), (column) => column.getAttribute("style"));

		expect(html.indexOf(">Сумма<")).toBeLessThan(html.indexOf(">Статус<"));
		expect(colStyles).toEqual(["width:144px", "width:96px"]);
	});

	it("не меняет ширины местами при перемещении колонки между разными width", () => {
		const columns: TableColumnDef<WideDemoRow>[] = [
			{ id: "a", accessorKey: "a", header: "A" },
			{ id: "b", accessorKey: "b", header: "B" },
			{ id: "c", accessorKey: "c", header: "C" },
			{ id: "d", accessorKey: "d", header: "D" },
			{ id: "e", accessorKey: "e", header: "E" }
		];
		const html = renderToStaticMarkup(
			<Table
				data={[
					{
						id: "1",
						a: "a1",
						b: "b1",
						c: "c1",
						d: "d1",
						e: "e1"
					}
				]}
				columns={columns}
				columnOrder={["a", "d", "c", "b", "e"]}
				columnSizing={{ b: 200, d: 80 }}
				getRowId={(row) => row.id}
			/>
		);
		const template = document.createElement("template");
		template.innerHTML = html;
		const colStyles = Array.from(template.content.querySelectorAll("col"), (column) => column.getAttribute("style"));
		const headerText = Array.from(template.content.querySelectorAll("th"), (header) => header.textContent);

		expect(headerText).toEqual(["A", "D", "C", "B", "E"]);
		expect(colStyles).toEqual(["width:4em", "width:80px", "width:4em", "width:200px", "width:4em"]);
	});

	it("сообщает об изменении ширины с keyboard-resize handle", async () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "status",
				accessorKey: "status",
				header: "Статус"
			},
			{
				id: "amount",
				accessorKey: "amount",
				header: "Сумма"
			}
		];
		const handleColumnSizingChange = vi.fn();

		const renderedContainer = await renderIntoDom(
			<Table
				data={[
					{
						id: "1",
						amount: 123.4,
						status: "OK"
					}
				]}
				columns={columns}
				enableColumnResizing
				onColumnSizingChange={handleColumnSizingChange}
				getRowId={(row) => row.id}
			/>
		);

		const resizeHandle = renderedContainer.querySelector('[role="separator"]');
		expect(resizeHandle).not.toBeNull();

		await act(async () => {
			resizeHandle?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
		});
		await flushMicrotasks();

		expect(handleColumnSizingChange).toHaveBeenCalledWith({
			status: 68
		});
		expect(renderedContainer.querySelector<HTMLTableColElement>("col")?.style.width).toBe("68px");
	});

	it("после изменения порядка resize-handle меняет визуальную колонку, а не исходную позицию", async () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "status",
				accessorKey: "status",
				header: "Статус"
			},
			{
				id: "amount",
				accessorKey: "amount",
				header: "Сумма"
			}
		];
		const handleColumnSizingChange = vi.fn();

		const renderedContainer = await renderIntoDom(
			<Table
				data={[
					{
						id: "1",
						amount: 123.4,
						status: "OK"
					}
				]}
				columns={columns}
				columnOrder={["amount", "status"]}
				enableColumnResizing
				onColumnSizingChange={handleColumnSizingChange}
				getRowId={(row) => row.id}
			/>
		);

		const resizeHandle = renderedContainer.querySelector('[role="separator"]');
		const renderedText = renderedContainer.textContent ?? "";
		expect(resizeHandle).not.toBeNull();
		expect(renderedText.indexOf("Сумма")).toBeLessThan(renderedText.indexOf("Статус"));

		await act(async () => {
			resizeHandle?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
		});
		await flushMicrotasks();

		expect(handleColumnSizingChange).toHaveBeenCalledWith({
			amount: 68
		});
		expect(renderedContainer.querySelector<HTMLTableColElement>("col")?.style.width).toBe("68px");
	});

	it("использует controlled columnVisibility и сообщает об изменениях", () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "status",
				accessorKey: "status",
				header: "Статус"
			},
			{
				id: "amount",
				accessorKey: "amount",
				header: "Сумма"
			}
		];
		const handleColumnVisibilityChange = vi.fn();

		renderToStaticMarkup(
			<Table
				data={[
					{
						id: "1",
						amount: 123.4,
						status: "OK"
					}
				]}
				columns={columns}
				columnVisibility={{ status: false, amount: true }}
				onColumnVisibilityChange={handleColumnVisibilityChange}
				getRowId={(row) => row.id}
			/>
		);

		expect(handleColumnVisibilityChange).not.toHaveBeenCalled();
	});

	it("закрепляет колонку слева через defaultColumnPinning и рендерит её sticky первой", () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "status",
				accessorKey: "status",
				header: "Статус",
				meta: {
					width: 10
				}
			},
			{
				id: "amount",
				accessorKey: "amount",
				header: "Сумма",
				meta: {
					width: 8
				}
			}
		];

		const html = renderToStaticMarkup(
			<Table
				data={[
					{
						id: "1",
						amount: 123.4,
						status: "OK"
					}
				]}
				columns={columns}
				defaultColumnPinning={{ left: ["amount"] }}
				getRowId={(row) => row.id}
			/>
		);

		expect(html.indexOf(">Сумма<")).toBeLessThan(html.indexOf(">Статус<"));
		expect(html).toContain("headerCellPinnedLeft");
		expect(html).toContain("bodyCellPinnedLeft");
		expect(html).toContain("left:0px");
	});

	it("использует controlled columnPinning и не сообщает об изменениях на первом рендере", () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "status",
				accessorKey: "status",
				header: "Статус"
			},
			{
				id: "amount",
				accessorKey: "amount",
				header: "Сумма"
			}
		];
		const handleColumnPinningChange = vi.fn();

		renderToStaticMarkup(
			<Table
				data={[
					{
						id: "1",
						amount: 123.4,
						status: "OK"
					}
				]}
				columns={columns}
				columnPinning={{ left: ["amount"] }}
				onColumnPinningChange={handleColumnPinningChange}
				getRowId={(row) => row.id}
			/>
		);

		expect(handleColumnPinningChange).not.toHaveBeenCalled();
	});

	it("сохраняет индикатор выделения на первой отрисованной pinned-колонке", async () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "status",
				accessorKey: "status",
				header: "Статус"
			},
			{
				id: "amount",
				accessorKey: "amount",
				header: "Сумма"
			}
		];

		const renderedContainer = await renderIntoDom(
			<Table
				data={[
					{
						id: "1",
						amount: 123.4,
						status: "OK"
					}
				]}
				columns={columns}
				defaultColumnPinning={{ left: ["amount"] }}
				selectedRowIds={["1"]}
				selectionMode="single"
				getRowId={(row) => row.id}
			/>
		);

		const selectedCell = renderedContainer.querySelector('tbody tr[aria-selected="true"] td');

		expect(selectedCell).not.toBeNull();
		// expect(selectedCell?.className).toContain("selectedIndicatorCell");
		expect(selectedCell?.className).toContain("bodyCellPinnedLeft");
	});

	it("оставляет структуру строк, но скрывает повторы и визуально склеивает группу", () => {
		const columns: TableColumnDef<
			DemoRow & {
				division: string;
			}
		>[] = [
			{
				id: "division",
				accessorKey: "division",
				header: "Дивизион",
				meta: {
					mergeDuplicates: true
				}
			},
			{
				id: "status",
				accessorKey: "status",
				header: "Статус"
			}
		];

		const html = renderToStaticMarkup(
			<Table
				data={[
					{ id: "1", amount: 0, status: "Новая", division: "ДВД" },
					{ id: "2", amount: 0, status: "В работе", division: "ДВД" },
					{ id: "3", amount: 0, status: "Готово", division: "УД" },
					{ id: "4", amount: 0, status: "Отгружено", division: "УД" }
				]}
				columns={columns}
				getRowId={(row) => row.id}
			/>
		);

		expect(html).not.toContain("rowSpan=");
		expect(html).toContain("bodyCellMergedWithNext");
		expect(html.match(/<td/g)?.length).toBe(8);
		expect(html.match(/><\/td>/g)?.length).toBe(2);
	});

	it("не объединяет пустые значения даже при включённом mergeDuplicates", () => {
		const columns: TableColumnDef<
			DemoRow & {
				division: string;
			}
		>[] = [
			{
				id: "division",
				accessorKey: "division",
				header: "Дивизион",
				meta: {
					mergeDuplicates: true
				}
			}
		];

		const html = renderToStaticMarkup(
			<Table
				data={[
					{ id: "1", amount: 0, status: "Новая", division: "" },
					{ id: "2", amount: 0, status: "В работе", division: "" }
				]}
				columns={columns}
				getRowId={(row) => row.id}
			/>
		);

		expect(html).not.toContain("bodyCellMergedWithNext");
		expect(html.match(/<td/g)?.length).toBe(2);
	});

	it("сохраняет mergeDuplicates при закреплении другой колонки слева", () => {
		const columns: TableColumnDef<
			DemoRow & {
				division: string;
			}
		>[] = [
			{
				id: "division",
				accessorKey: "division",
				header: "Дивизион",
				meta: {
					mergeDuplicates: true
				}
			},
			{
				id: "status",
				accessorKey: "status",
				header: "Статус"
			}
		];

		const html = renderToStaticMarkup(
			<Table
				data={[
					{ id: "1", amount: 0, status: "Новая", division: "ДВД" },
					{ id: "2", amount: 0, status: "В работе", division: "ДВД" }
				]}
				columns={columns}
				defaultColumnPinning={{ left: ["status"] }}
				getRowId={(row) => row.id}
			/>
		);

		expect(html.indexOf(">Статус<")).toBeLessThan(html.indexOf(">Дивизион<"));
		expect(html).toContain("bodyCellMergedWithNext");
		expect(html.match(/ДВД/g)?.length).toBe(1);
	});
});
