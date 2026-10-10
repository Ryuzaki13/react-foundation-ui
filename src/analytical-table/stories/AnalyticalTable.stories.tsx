import { createAnalyticalDateColumnsPlan, projectAnalyticalDateFacts } from "@ryuzaki13/react-foundation-lib/analytical-table";
import { type Meta, type StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { AnalyticalTable } from "../AnalyticalTable";

import { analyticalStoryColumnGroups, analyticalStoryColumns, analyticalStorySnapshot } from "./analyticalTableFixture";

const meta = {
	title: "Data/AnalyticalTable",
	component: AnalyticalTable,
	parameters: { layout: "fullscreen" },
	args: {
		snapshot: analyticalStorySnapshot,
		columns: analyticalStoryColumns,
		columnGroups: analyticalStoryColumnGroups,
		height: "34rem",
		rowSelectionMode: "multi",
		cellSelectionMode: "multi",
		cellSelectionActivationMode: "primary-modifier",
		onExport: fn(),
		onRefresh: fn(),
		getRowLabel: (row) => String(row.values.name ?? "группу")
	}
} satisfies Meta<typeof AnalyticalTable>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Hierarchy: Story = { args: { defaultState: { expandedRowIds: ["record-0"] } } };
export const Grouped: Story = {
	args: { defaultState: { grouping: [analyticalStoryColumns[0].grouping!], expandedRowIds: "all", pinnedColumnIds: ["name"] } }
};
export const GroupingAsColumn: Story = {
	args: { defaultState: { grouping: [{ ...analyticalStoryColumns[0].grouping!, showAsColumn: true }], expandedRowIds: "all" } }
};
export const Virtualized: Story = {
	args: {
		snapshot: {
			rows: Array.from({ length: 10000 }, (_, index) => ({
				id: String(index),
				values: { name: `Запись ${index + 1}`, division: `Направление ${index % 10}`, amount: index + 1, cost: index / 2 }
			}))
		},
		columnGroups: undefined,
		defaultState: { sorting: [{ id: "amount", desc: true }] }
	}
};
export const Empty: Story = { args: { snapshot: { rows: [] } } };
export const Refreshing: Story = { args: { isFetching: true } };
export const FailedRefresh: Story = { args: { error: "Не удалось обновить данные. Доступен последний полученный снимок." } };

const datePlan = createAnalyticalDateColumnsPlan({
	id: "sales",
	from: "2026-01-01",
	to: "2026-03-31",
	granularity: "month",
	identityColumnIds: ["divisionId"],
	dateColumnId: "date",
	measureColumnId: "amount",
	aggregation: "sum"
});
const dateRows = projectAnalyticalDateFacts({
	rows: [
		{ id: "north", values: { divisionId: "north", name: "Север" } },
		{ id: "south", values: { divisionId: "south", name: "Юг" } }
	],
	facts: [
		{ divisionId: "north", date: "2026-01-12", amount: 100 },
		{ divisionId: "north", date: "2026-03-02", amount: 450 },
		{ divisionId: "south", date: "2026-02-13", amount: 250 }
	],
	plan: datePlan
});
export const DynamicDates: Story = {
	args: {
		snapshot: { rows: dateRows },
		columns: [
			{ id: "name", label: "Регион", width: 220 },
			...datePlan.columns.map((column) => ({
				id: column.id,
				label: column.label,
				kind: "measure" as const,
				valueType: "number" as const,
				aggregate: "sum" as const
			}))
		],
		columnGroups: [{ id: "period", label: "Первый квартал 2026", columnIds: datePlan.columns.map((column) => column.id) }]
	}
};

/** Граница tree-подписи перед первой закреплённой мерой и длинный footer caption. */
export const EdgeLabels: Story = {
	args: {
		snapshot: {
			rows: [
				{
					id: "one",
					values: {
						divisionId: "first",
						division: "Очень длинная подпись группы, которая не должна накрывать значения закреплённых числовых колонок",
						amount: 15000,
						cost: 4200
					}
				}
			]
		},
		columns: analyticalStoryColumns.filter((column) => column.id !== "name" && column.id !== "active"),
		columnGroups: undefined,
		grandTotalsLabel: "Итого по всем видимым строкам текущего снимка",
		defaultState: { grouping: [analyticalStoryColumns[0].grouping!], pinnedColumnIds: ["amount"] }
	}
};
