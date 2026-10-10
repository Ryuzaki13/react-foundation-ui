import { type AnalyticalSnapshot } from "@ryuzaki13/react-foundation-lib/analytical-table";
import { AnalyticalTable, type AnalyticalTableColumn, type AnalyticalTableProps, type AnalyticalTableState } from "../src/analytical-table";

type Original = Readonly<{ code: string; label: string }>;
type Equal<Left, Right> = (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2 ? true : false;
type Expect<Value extends true> = Value;

const snapshot: AnalyticalSnapshot<Original> = {
	rows: [{ id: "row", original: { code: "one", label: "Строка" }, values: { name: "Строка", amount: 5 } }]
};
const columns: readonly AnalyticalTableColumn<Original>[] = [
	{ id: "name", render: ({ row }) => row.original?.label, renderGroup: ({ row }) => row.groupingLevelId },
	{
		id: "amount",
		kind: "measure",
		aggregate: "sum",
		format: (value, row) => `${row.original?.code}: ${value}`,
		formatTotal: (value) => `${value}`,
		renderTotal: (value) => <strong>{String(value)}</strong>
	}
];
const state: AnalyticalTableState = {
	grouping: [{ id: "name", keyColumnIds: ["name"], showAsColumn: true }],
	expandedRowIds: ["row"],
	columnWidths: { name: 240 }
};
const props = {
	snapshot,
	columns,
	state,
	onRowSelectionChange: (rows) => {
		const original: Original | undefined = rows[0]?.original;
		void original;
	},
	onExport: (projection) => {
		const exported: unknown = projection.rows[0]?.values[0];
		void exported;
	}
} satisfies AnalyticalTableProps<Original>;
const inferred = <AnalyticalTable {...props} />;
const explicit = <AnalyticalTable<Original> {...props} />;
void inferred;
void explicit;

export type OriginalPreserved = Expect<
	Equal<Parameters<NonNullable<AnalyticalTableColumn<Original>["render"]>>[0]["row"]["original"], Original | undefined>
>;
export type TotalHasNoFakeRow = Expect<Equal<Parameters<NonNullable<AnalyticalTableColumn<Original>["formatTotal"]>>, [value: unknown]>>;
export type SnapshotReadonly = Expect<Equal<AnalyticalTableProps<Original>["snapshot"], AnalyticalSnapshot<Original>>>;

// @ts-expect-error Снимок и строки принадлежат Query/host и не мутируются таблицей.
snapshot.rows.push({ id: "other", values: {} });
// @ts-expect-error Renderer сохраняет original конкретного host типа.
const invalidColumn: AnalyticalTableColumn<Original> = { id: "name", render: ({ row }) => row.original?.unknownField };
void invalidColumn;
