/* eslint-disable react-hooks/incompatible-library */
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { TableColumnDef } from "@ryuzaki13/react-foundation-lib/table";

import { BaseTable } from "./BaseTable";

type DemoRow = {
	id: string;
	division: string;
	status: string;
};

function BaseTableHarness() {
	const columns: TableColumnDef<DemoRow>[] = [
		{
			id: "division",
			accessorKey: "division",
			header: "Дивизион"
		},
		{
			id: "status",
			accessorKey: "status",
			header: "Статус"
		}
	];
	const table = useReactTable<DemoRow>({
		data: [
			{ id: "1", division: "ДВД", status: "Новая" },
			{ id: "2", division: "ДВД", status: "В работе" }
		],
		columns,
		getCoreRowModel: getCoreRowModel()
	});

	return (
		<BaseTable
			table={table}
			columnState={table.getState()}
			getCellLayout={({ cell, row }) => {
				if (cell.column.id !== "division") {
					return undefined;
				}

				if (row.id === "0") {
					return { mergeWithNext: true };
				}

				if (row.id === "1") {
					return { hideContent: true };
				}

				return undefined;
			}}
		/>
	);
}

describe("BaseTable", () => {
	it("оставляет td на месте, но скрывает контент дубликата и визуально склеивает ячейки", () => {
		const html = renderToStaticMarkup(<BaseTableHarness />);

		expect(html).not.toContain("rowSpan=");
		expect(html.match(/<td/g)?.length).toBe(4);
		expect(html).toContain("bodyCellMergedWithNext");
		expect(html.match(/ДВД/g)?.length).toBe(1);
		expect(html).toContain("Новая");
		expect(html).toContain("В работе");
	});
});
