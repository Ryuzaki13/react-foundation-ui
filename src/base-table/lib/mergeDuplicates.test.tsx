import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { TableColumnDef } from "@ryuzaki13/react-foundation-lib/table";

import { buildBaseTableMergedCellsLayout } from "./mergeDuplicates";

type DemoRow = {
	id: string;
	division: string | null;
	status: string;
	group: string;
};

function captureMergedLayout(args: {
	data: DemoRow[];
	columns: TableColumnDef<DemoRow>[];
	resolveRowBoundaryKey?: Parameters<typeof buildBaseTableMergedCellsLayout<DemoRow>>[0]["resolveRowBoundaryKey"];
}) {
	let captured:
		| {
				rows: ReturnType<ReturnType<typeof useReactTable<DemoRow>>["getRowModel"]>["rows"];
				layout: ReturnType<typeof buildBaseTableMergedCellsLayout<DemoRow>>;
		  }
		| undefined;

	function Harness() {
		const table = useReactTable<DemoRow>({
			data: args.data,
			columns: args.columns,
			getCoreRowModel: getCoreRowModel()
		});

		captured = {
			rows: table.getRowModel().rows,
			layout: buildBaseTableMergedCellsLayout({
				rows: table.getRowModel().rows,
				columns: table.getVisibleLeafColumns(),
				resolveRowBoundaryKey: args.resolveRowBoundaryKey
			})
		};

		return null;
	}

	renderToStaticMarkup(<Harness />);

	if (!captured) {
		throw new Error("Не удалось построить layout объединённых ячеек.");
	}

	return captured;
}

function getCellIds(rows: ReturnType<typeof captureMergedLayout>["rows"], columnId: string): string[] {
	return rows.map((row) => {
		const cell = row.getVisibleCells().find((currentCell) => currentCell.column.id === columnId);

		if (!cell) {
			throw new Error(`Не найдена ячейка колонки ${columnId}.`);
		}

		return cell.id;
	});
}

describe("buildBaseTableMergedCellsLayout", () => {
	it("оставляет значение только в первой строке группы и скрывает дубликаты ниже", () => {
		const { rows, layout } = captureMergedLayout({
			data: [
				{ id: "1", division: "ДВД", status: "A", group: "one" },
				{ id: "2", division: "ДВД", status: "B", group: "one" },
				{ id: "3", division: "ДВД", status: "C", group: "one" },
				{ id: "4", division: "УД", status: "D", group: "one" },
				{ id: "5", division: "УД", status: "E", group: "one" },
				{ id: "6", division: "УД", status: "F", group: "one" },
				{ id: "7", division: "УД", status: "G", group: "one" }
			],
			columns: [
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
			]
		});
		const cellIds = getCellIds(rows, "division");

		expect(layout.get(cellIds[0])).toEqual({ mergeWithNext: true, hideContent: false });
		expect(layout.get(cellIds[1])).toEqual({ hideContent: true, mergeWithNext: true });
		expect(layout.get(cellIds[2])).toEqual({ hideContent: true, mergeWithNext: false });
		expect(layout.get(cellIds[3])).toEqual({ mergeWithNext: true, hideContent: false });
		expect(layout.get(cellIds[4])).toEqual({ hideContent: true, mergeWithNext: true });
		expect(layout.get(cellIds[5])).toEqual({ hideContent: true, mergeWithNext: true });
		expect(layout.get(cellIds[6])).toEqual({ hideContent: true, mergeWithNext: false });
	});

	it("не объединяет null, undefined и пустую строку", () => {
		const { rows, layout } = captureMergedLayout({
			data: [
				{ id: "1", division: null, status: "A", group: "one" },
				{ id: "2", division: null, status: "B", group: "one" },
				{ id: "3", division: "", status: "C", group: "one" },
				{ id: "4", division: "", status: "D", group: "one" }
			],
			columns: [
				{
					id: "division",
					accessorKey: "division",
					header: "Дивизион",
					meta: {
						mergeDuplicates: true
					}
				}
			]
		});
		const cellIds = getCellIds(rows, "division");

		expect(layout.get(cellIds[0])).toBeUndefined();
		expect(layout.get(cellIds[1])).toBeUndefined();
		expect(layout.get(cellIds[2])).toBeUndefined();
		expect(layout.get(cellIds[3])).toBeUndefined();
	});

	it("сбрасывает объединение при смене boundary key", () => {
		const { rows, layout } = captureMergedLayout({
			data: [
				{ id: "1", division: "ДВД", status: "A", group: "one" },
				{ id: "2", division: "ДВД", status: "B", group: "one" },
				{ id: "3", division: "ДВД", status: "C", group: "two" },
				{ id: "4", division: "ДВД", status: "D", group: "two" }
			],
			resolveRowBoundaryKey: (row) => row.original.group,
			columns: [
				{
					id: "division",
					accessorKey: "division",
					header: "Дивизион",
					meta: {
						mergeDuplicates: true
					}
				}
			]
		});
		const cellIds = getCellIds(rows, "division");

		expect(layout.get(cellIds[0])).toEqual({ mergeWithNext: true, hideContent: false });
		expect(layout.get(cellIds[1])).toEqual({ hideContent: true, mergeWithNext: false });
		expect(layout.get(cellIds[2])).toEqual({ mergeWithNext: true, hideContent: false });
		expect(layout.get(cellIds[3])).toEqual({ hideContent: true, mergeWithNext: false });
	});

	it("не создаёт layout для одиночной строки", () => {
		const { rows, layout } = captureMergedLayout({
			data: [
				{ id: "1", division: "ДВД", status: "A", group: "one" },
				{ id: "2", division: "УД", status: "B", group: "one" }
			],
			columns: [
				{
					id: "division",
					accessorKey: "division",
					header: "Дивизион",
					meta: {
						mergeDuplicates: true
					}
				}
			]
		});
		const cellIds = getCellIds(rows, "division");

		expect(layout.get(cellIds[0])).toBeUndefined();
		expect(layout.get(cellIds[1])).toBeUndefined();
	});
});
