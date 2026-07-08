import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { formatTypedCellValue } from "@ryuzaki13/react-foundation-lib/formatters";
import type { TableColumnDef } from "@ryuzaki13/react-foundation-lib/table";

import { TreeTable, type TreeTableProps } from "./TreeTable";

type DemoRow = {
	id: string;
	parentId: string | null;
	label: string;
	amount: number;
	status: string;
};

const hierarchy: TreeTableProps<DemoRow>["hierarchy"] = {
	getRowId: (row: DemoRow) => row.id,
	getParentRowId: (row: DemoRow) => row.parentId
};

describe("TreeTable formatting integration", () => {
	it("рендерит formatted value в обычной колонке", () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "label",
				accessorKey: "label",
				header: "Показатель"
			},
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
			<TreeTable
				data={[
					{
						id: "1",
						parentId: null,
						label: "Выручка",
						amount: 123.4,
						status: "OK"
					}
				]}
				columns={columns}
				hierarchy={hierarchy}
			/>
		);

		expect(html).toContain(formatTypedCellValue(123.4, { role: "measure", type: "decimal" }));
	});

	it("сохраняет tree-shell для форматируемой tree-колонки", () => {
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
			},
			{
				id: "label",
				accessorKey: "label",
				header: "Показатель"
			}
		];

		const html = renderToStaticMarkup(
			<TreeTable
				data={[
					{
						id: "1",
						parentId: null,
						label: "Выручка",
						amount: 123.4,
						status: "OK"
					},
					{
						id: "2",
						parentId: "1",
						label: "Экспорт",
						amount: 25,
						status: "OK"
					}
				]}
				columns={columns}
				hierarchy={hierarchy}
				treeColumnId="amount"
			/>
		);

		expect(html).toContain("Развернуть строку");
		expect(html).toContain(formatTypedCellValue(123.4, { role: "measure", type: "decimal" }));
	});

	it("скрывает нулевое значение при emptyWhenZero", () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "label",
				accessorKey: "label",
				header: "Показатель"
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
			<TreeTable
				data={[
					{
						id: "1",
						parentId: null,
						label: "Пусто",
						amount: 0,
						status: "EMPTY"
					}
				]}
				columns={columns}
				hierarchy={hierarchy}
			/>
		);

		expect(html).toContain("Пусто");
		expect(html).not.toContain(`>${formatTypedCellValue(0, { role: "measure", type: "decimal" })}<`);
	});

	it("показывает state-класс и иконку для resolveValueState", () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "label",
				accessorKey: "label",
				header: "Показатель"
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
			<TreeTable
				data={[
					{
						id: "1",
						parentId: null,
						label: "Выручка",
						amount: 150,
						status: "OK"
					}
				]}
				columns={columns}
				hierarchy={hierarchy}
			/>
		);

		expect(html).toContain("statusWarning");
		expect(html).toContain("lucide-circle-alert");
	});

	it("применяет rowBasedOverride(field) для tree-строки", () => {
		const columns: TableColumnDef<DemoRow & { statusLabel: string }>[] = [
			{
				id: "label",
				accessorKey: "label",
				header: "Показатель"
			},
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
			<TreeTable
				data={[
					{
						id: "1",
						parentId: null,
						label: "Выручка",
						amount: 123.4,
						status: "RAW_STATUS",
						statusLabel: "Деревянный статус"
					}
				]}
				columns={columns}
				hierarchy={hierarchy}
			/>
		);

		expect(html).toContain("Деревянный статус");
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
			<TreeTable
				data={[
					{
						id: "1",
						parentId: null,
						label: "Выручка",
						amount: 123.4,
						status: "OK"
					}
				]}
				columns={columns}
				hierarchy={hierarchy}
			/>
		);

		expect(html).toContain("КАСТОМНОЕ_ЗНАЧЕНИЕ");
		expect(html).not.toContain(formatTypedCellValue(123.4, { role: "measure", type: "decimal" }));
	});

	it("использует первую видимую колонку как tree-column при скрытии первой metadata-колонки", () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "status",
				accessorKey: "status",
				header: "Статус"
			},
			{
				id: "label",
				accessorKey: "label",
				header: "Показатель"
			}
		];

		const html = renderToStaticMarkup(
			<TreeTable
				data={[
					{
						id: "1",
						parentId: null,
						label: "Выручка",
						amount: 123.4,
						status: "OK"
					},
					{
						id: "2",
						parentId: "1",
						label: "Экспорт",
						amount: 25,
						status: "OK"
					}
				]}
				columns={columns}
				hierarchy={hierarchy}
				defaultColumnVisibility={{ status: false, label: true }}
			/>
		);

		expect(html).not.toContain(">Статус<");
		expect(html).toContain(">Показатель<");
		expect(html).toContain("Развернуть строку");
	});

	it("сохраняет tree-shell при закреплении другой колонки слева", () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "label",
				accessorKey: "label",
				header: "Показатель",
				meta: {
					width: 12
				}
			},
			{
				id: "status",
				accessorKey: "status",
				header: "Статус",
				meta: {
					width: 8
				}
			}
		];

		const html = renderToStaticMarkup(
			<TreeTable
				data={[
					{
						id: "1",
						parentId: null,
						label: "Выручка",
						amount: 123.4,
						status: "OK"
					},
					{
						id: "2",
						parentId: "1",
						label: "Экспорт",
						amount: 25,
						status: "OK"
					}
				]}
				columns={columns}
				hierarchy={hierarchy}
				defaultColumnPinning={{ left: ["status"] }}
			/>
		);

		expect(html.indexOf(">Статус<")).toBeLessThan(html.indexOf(">Показатель<"));
		expect(html).toContain("bodyCellPinnedLeft");
		expect(html).toContain("Развернуть строку");
	});

	it("сохраняет expander и базовый отступ tree-колонки при её закреплении", () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "label",
				accessorKey: "label",
				header: "Показатель",
				meta: {
					width: 12
				}
			},
			{
				id: "status",
				accessorKey: "status",
				header: "Статус"
			}
		];

		const html = renderToStaticMarkup(
			<TreeTable
				data={[
					{
						id: "1",
						parentId: null,
						label: "Выручка",
						amount: 123.4,
						status: "OK"
					},
					{
						id: "2",
						parentId: "1",
						label: "Экспорт",
						amount: 25,
						status: "OK"
					}
				]}
				columns={columns}
				hierarchy={hierarchy}
				defaultColumnPinning={{ left: ["label"] }}
				expandFirstLevel
			/>
		);

		expect(html).toContain("headerCellPinnedLeft");
		expect(html).toContain("bodyCellPinnedLeft");
		expect(html).toContain("Развернуть строку");
		expect(html).toContain("padding-inline-start:calc(0 * 1em)");
	});

	it("объединяет дубликаты на одной глубине и не трогает tree-колонку", () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "label",
				accessorKey: "label",
				header: "Показатель",
				meta: {
					mergeDuplicates: true
				}
			},
			{
				id: "status",
				accessorKey: "status",
				header: "Дивизион",
				meta: {
					mergeDuplicates: true
				}
			}
		];

		const html = renderToStaticMarkup(
			<TreeTable
				data={[
					{ id: "1", parentId: null, label: "Одинаковый заголовок", amount: 0, status: "ДВД" },
					{ id: "2", parentId: null, label: "Одинаковый заголовок", amount: 0, status: "ДВД" }
				]}
				columns={columns}
				hierarchy={hierarchy}
				treeColumnId="label"
			/>
		);

		expect(html).not.toContain("rowSpan=");
		expect(html).toContain("bodyCellMergedWithNext");
		expect(html.match(/Одинаковый заголовок/g)?.length).toBe(2);
		expect(html.match(/ДВД/g)?.length).toBe(1);
	});

	it("учитывает только видимые строки при расчёте слияния", () => {
		const columns: TableColumnDef<DemoRow>[] = [
			{
				id: "label",
				accessorKey: "label",
				header: "Показатель"
			},
			{
				id: "status",
				accessorKey: "status",
				header: "Дивизион",
				meta: {
					mergeDuplicates: true
				}
			}
		];

		const html = renderToStaticMarkup(
			<TreeTable
				data={[
					{ id: "1", parentId: null, label: "Корень", amount: 0, status: "ДВД" },
					{ id: "2", parentId: "1", label: "Дочерняя", amount: 0, status: "ДВД" },
					{ id: "3", parentId: null, label: "Второй корень", amount: 0, status: "ДВД" }
				]}
				columns={columns}
				hierarchy={hierarchy}
				expandFirstLevel
			/>
		);

		expect(html).toContain("bodyCellMergedWithNext");
	});
});
