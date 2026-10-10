import { type AnalyticalSnapshot } from "@ryuzaki13/react-foundation-lib/analytical-table";

import { type AnalyticalTableColumn } from "../types/columns";

export const testSnapshot: AnalyticalSnapshot = {
	rows: [
		{ id: "a", values: { unitId: "one", unit: "Одинаковое имя", name: "Альфа", amount: 10, cost: 3 } },
		{ id: "a-child", parentId: "a", values: { unitId: "one", unit: "Одинаковое имя", name: "Деталь", amount: 500, cost: 100 } },
		{ id: "b", values: { unitId: "two", unit: "Одинаковое имя", name: "Бета", amount: 20, cost: 5 } }
	]
};
export const testColumns: readonly AnalyticalTableColumn[] = [
	{ id: "unit", label: "Отдел", grouping: { id: "unit", keyColumnIds: ["unitId"], displayColumnIds: ["unit"], label: "Отдел" } },
	{ id: "name", label: "Название", width: 180 },
	{
		id: "amount",
		label: "Сумма",
		kind: "measure",
		valueType: "number",
		aggregate: "sum",
		format: (value) => `${value} руб.`,
		formatTotal: (value) => `${value} руб.`
	},
	{ id: "cost", label: "Затраты", kind: "measure", valueType: "number", aggregate: "sum" },
	{
		id: "margin",
		label: "Разница",
		kind: "measure",
		valueType: "number",
		calculate: { dependencies: ["amount", "cost"], compute: (values) => Number(values.amount) - Number(values.cost) }
	}
];
