import { type AnalyticalSnapshot } from "@ryuzaki13/react-foundation-lib/analytical-table";

import { type AnalyticalTableColumn, type AnalyticalTableColumnGroup } from "../types/columns";

/** Фиксированный нейтральный набор для сравнения геометрии, SSR и пользовательских команд. */
export const analyticalStorySnapshot: AnalyticalSnapshot = {
	rows: Array.from({ length: 80 }, (_, index) => ({
		id: `record-${index}`,
		parentId: index % 10 === 0 ? null : `record-${index - (index % 10)}`,
		values: {
			divisionId: `division-${Math.floor(index / 10) % 3}`,
			division: ["Производство", "Продажи", "Поддержка"][Math.floor(index / 10) % 3],
			name:
				index % 10 === 0
					? `Проект ${index / 10 + 1}`
					: `Строка ${index + 1} — подробное описание выполненной работы и её результата`,
			amount: 1000 + index * 25,
			cost: 620 + index * 15,
			active: index % 3 !== 0
		}
	}))
};
export const analyticalStoryColumns: readonly AnalyticalTableColumn[] = [
	{
		id: "division",
		label: "Подразделение",
		width: 180,
		grouping: { id: "division", keyColumnIds: ["divisionId"], displayColumnIds: ["division"], label: "Подразделение" }
	},
	{ id: "name", label: "Наименование", width: 300 },
	{ id: "amount", label: "Сумма", kind: "measure", valueType: "number", aggregate: "sum", width: 140 },
	{ id: "cost", label: "Затраты", kind: "measure", valueType: "number", aggregate: "sum", width: 140 },
	{
		id: "margin",
		label: "Результат",
		kind: "measure",
		valueType: "number",
		calculate: { dependencies: ["amount", "cost"], compute: (values) => Number(values.amount) - Number(values.cost) },
		width: 140
	},
	{ id: "active", label: "Активен", valueType: "boolean", width: 110 }
];
export const analyticalStoryColumnGroups: readonly AnalyticalTableColumnGroup[] = [
	{
		id: "financial",
		label: "Финансовые показатели",
		columnIds: ["amount", "cost", "margin"],
		collapsedColumnId: "margin",
		children: [{ id: "facts", label: "Фактические значения", columnIds: ["amount", "cost"] }]
	}
];
