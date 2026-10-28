import { type TableColumnDef } from "@ryuzaki13/react-foundation-lib/table";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { TreeTable } from "../tree-table";

import { Table } from "./Table";

type Row = { id: string; name: string; value: string };

const rows: readonly Row[] = [{ id: "1", name: "Пример", value: "Значение" }];
const nameColumn: TableColumnDef<Row> = { id: "name", header: "Имя", accessorKey: "name", meta: { width: 20 } };
const valueColumn: TableColumnDef<Row> = { id: "value", header: "Значение", accessorKey: "value", meta: { width: 10 } };
const columns: readonly TableColumnDef<Row>[] = [nameColumn, valueColumn];

describe("размеры Table и TreeTable в em", () => {
	it("меняет общую ширину и одну колонку без перераспределения остальных", () => {
		const onColumnSizingChange = vi.fn();
		render(
			<Table
				data={rows}
				columns={columns}
				columnSizingUnit="em"
				tableWidth="columns"
				enableColumnResizing
				onColumnSizingChange={onColumnSizingChange}
			/>
		);
		const table = screen.getByRole("table");
		const [header] = screen.getAllByRole("columnheader");
		if (!header) throw new Error("Тесту нужен заголовок изменяемой колонки.");
		table.style.fontSize = "16px";
		vi.spyOn(header, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 320, 40));

		const [resizeHandle] = screen.getAllByRole("separator");
		if (!resizeHandle) throw new Error("Тесту нужен resize-handle колонки.");

		fireEvent.keyDown(resizeHandle, { key: "ArrowRight" });

		expect(onColumnSizingChange).toHaveBeenLastCalledWith({ name: 20.5 });
		expect(Array.from(table.querySelectorAll("col"), (col) => col.style.width)).toEqual(["20.5em", "10em"]);
		expect(table.style.width).toBe("calc(30.5em)");
		expect(table.style.tableLayout).toBe("fixed");
	});

	it("учитывает видимость и замену определений колонок", () => {
		const view = render(<Table data={rows} columns={columns} tableWidth="columns" columnVisibility={{ value: false }} />);
		expect(screen.getByRole("table").style.width).toBe("20em");

		view.rerender(
			<Table data={rows} columns={[{ id: "name", header: "Имя", accessorKey: "name", meta: { width: 25 } }]} tableWidth="columns" />
		);
		expect(screen.getByRole("table").style.width).toBe("25em");
	});

	it("сохраняет относительную ширину закреплённой колонки TreeTable", () => {
		render(
			<TreeTable
				data={rows}
				columns={columns}
				hierarchy={{ getRowId: (row) => row.id, getParentRowId: () => null }}
				columnSizingUnit="em"
				tableWidth="columns"
				columnSizing={{ name: 20.5 }}
				columnPinning={{ start: ["name", "value"] }}
			/>
		);
		const table = screen.getByRole("table");

		expect(table.style.width).toBe("calc(30.5em)");
		const [, pinnedHeader] = screen.getAllByRole("columnheader");
		if (!pinnedHeader) throw new Error("Тесту нужен второй закреплённый заголовок.");

		expect(pinnedHeader.style.insetInlineStart).toBe("20.5em");
	});

	it("суммирует px с em и оставляет auto-колонку браузерной раскладке", () => {
		const view = render(
			<Table data={rows} columns={[nameColumn, { ...valueColumn, meta: { width: "120px" } }]} tableWidth="columns" />
		);
		expect(screen.getByRole("table").style.width).toBe("calc(20em + 120px)");

		view.rerender(<Table data={rows} columns={[{ ...nameColumn, meta: { width: "auto" } }]} tableWidth="columns" />);
		expect(screen.getByRole("table").style.width).toBe("");
	});

	it("выдаёт сумму em уже при SSR и сохраняет прежнюю автоматическую раскладку по умолчанию", () => {
		const html = renderToStaticMarkup(
			<Table data={rows} columns={columns} tableWidth="columns" columnSizingUnit="em" defaultColumnSizing={{ name: 20.5 }} />
		);
		expect(html).toContain("width:calc(20.5em + 10em);table-layout:fixed");

		render(<Table data={rows} columns={columns} />);
		expect(screen.getByRole("table").style.width).toBe("");
	});
});
