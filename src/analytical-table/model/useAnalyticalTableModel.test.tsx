import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { testColumns, testSnapshot } from "../test-fixtures/analyticalTableTestData";
import { type AnalyticalTableProps } from "../types/props";

import { useAnalyticalTableModel } from "./useAnalyticalTableModel";

describe("AnalyticalTable model ownership", () => {
	it("не пересчитывает snapshot/formulas на resize, pin, reorder и раскрытие", () => {
		const compute = vi.fn(() => 7);
		const columns = [...testColumns, { id: "spy", calculate: { dependencies: ["amount"], compute } }];
		const { result } = renderHook(() => useAnalyticalTableModel({ snapshot: testSnapshot, columns }));
		const count = compute.mock.calls.length;
		act(() => result.current.resizeColumn("name", 240));
		act(() => result.current.pinColumn("name"));
		act(() => result.current.patchState({ columnOrder: ["cost", "name"] }));
		act(() => result.current.toggleRow("a"));
		expect(result.current.model.visibleRows.map((row) => row.id)).toEqual(["a", "a-child", "b"]);
		expect(compute).toHaveBeenCalledTimes(count);
		expect(testSnapshot.rows[0].values).not.toHaveProperty("spy");
	});
	it("отделяет группировки с одинаковыми display labels и скрывает их колонки", () => {
		const { result } = renderHook(() => useAnalyticalTableModel({ snapshot: testSnapshot, columns: testColumns }));
		act(() => result.current.groupColumn("unit"));
		expect(result.current.model.rows).toHaveLength(2);
		expect(new Set(result.current.model.rows.map((row) => row.id)).size).toBe(2);
		expect(result.current.visibleColumns.map((column) => column.id)).not.toContain("unit");
		act(() => result.current.patchState({ grouping: [{ ...testColumns[0].grouping!, showAsColumn: true }] }));
		expect(result.current.visibleColumns[0].id).toBe("unit");
	});
	it("применяет capability guards внутри команд", () => {
		const onStateChange = vi.fn();
		const { result } = renderHook(() =>
			useAnalyticalTableModel({
				snapshot: testSnapshot,
				columns: testColumns.map((column) => ({
					...column,
					sortable: false,
					groupable: false,
					filterable: false,
					hideable: false
				})),
				enableGrouping: false,
				enableColumnResizing: false,
				onStateChange
			})
		);
		act(() => {
			result.current.groupColumn("name");
			result.current.sortColumn("name");
			result.current.filterColumn("name", "Альфа");
			result.current.hideColumn("name");
			result.current.resizeColumn("name", 300);
			result.current.toggleRow("unknown");
			result.current.pinColumn("unknown");
			result.current.ungroupColumn("name");
			result.current.moveGrouping("name", 1);
		});
		expect(onStateChange).not.toHaveBeenCalled();
	});
	it("многоколоночная сортировка, фильтр и итоги используют весь snapshot", () => {
		const { result } = renderHook(() => useAnalyticalTableModel({ snapshot: testSnapshot, columns: testColumns }));
		expect(result.current.model.grandTotals).toMatchObject({ amount: 30, cost: 8, margin: 22 });
		act(() => result.current.sortColumn("amount", "desc"));
		act(() => result.current.sortColumn("name", "asc", true));
		expect(result.current.state.sorting).toEqual([
			{ id: "amount", desc: true },
			{ id: "name", desc: false }
		]);
		act(() => result.current.filterColumn("name", "Бета"));
		expect(result.current.model.visibleRows.map((row) => row.id)).toEqual(["b"]);
		expect(result.current.model.grandTotals?.amount).toBe(20);
		act(() => result.current.clearFilter("name"));
		expect(result.current.model.visibleRows).toHaveLength(2);
	});
	it("вложенные header groups сохраняют summary при collapse", () => {
		const options: AnalyticalTableProps = {
			snapshot: testSnapshot,
			columns: testColumns,
			columnGroups: [
				{
					id: "financial",
					label: "Показатели",
					columnIds: ["margin"],
					collapsedColumnId: "margin",
					children: [{ id: "facts", label: "Факт", columnIds: ["amount", "cost"] }]
				}
			]
		};
		const { result } = renderHook(() => useAnalyticalTableModel(options));
		act(() => result.current.patchState({ collapsedColumnGroupIds: ["financial"] }));
		expect(result.current.visibleColumns.map((column) => column.id)).toEqual(["unit", "name", "margin"]);
	});
	it("controlled state меняется только через владельца", () => {
		const onStateChange = vi.fn();
		const { result, rerender } = renderHook(
			(state: AnalyticalTableProps["state"]) =>
				useAnalyticalTableModel({ snapshot: testSnapshot, columns: testColumns, state, onStateChange }),
			{ initialProps: {} }
		);
		act(() => result.current.toggleRow("a"));
		expect(result.current.model.visibleRows).toHaveLength(2);
		rerender(onStateChange.mock.lastCall?.[0]);
		expect(result.current.model.visibleRows).toHaveLength(3);
	});
});

describe("column collapse recovery", () => {
	it("сохраняет скрытый summary видимым при вложенном collapse", () => {
		const { result } = renderHook(() =>
			useAnalyticalTableModel({
				snapshot: testSnapshot,
				columns: testColumns,
				defaultState: { hiddenColumnIds: ["margin"], collapsedColumnGroupIds: ["root", "child"] },
				columnGroups: [
					{
						id: "root",
						label: "Родитель",
						columnIds: [],
						collapsedColumnId: "margin",
						children: [{ id: "child", label: "Потомок", columnIds: ["amount", "cost", "margin"], collapsedColumnId: "cost" }]
					}
				]
			})
		);
		expect(result.current.visibleColumns.map((column) => column.id)).toEqual(["unit", "name", "margin"]);
		act(() => result.current.patchState({ collapsedColumnGroupIds: [] }));
		expect(result.current.visibleColumns.map((column) => column.id)).toEqual(["unit", "name", "amount", "cost"]);
	});
});

describe("deep hierarchy geometry", () => {
	it("резервирует отступ deepest snapshot row независимо от раскрытия", () => {
		const snapshot = {
			rows: Array.from({ length: 8 }, (_, index) => ({
				id: String(index),
				parentId: index ? String(index - 1) : null,
				values: { name: String(index) }
			}))
		};
		const { result } = renderHook(() => useAnalyticalTableModel({ snapshot, columns: testColumns }));
		expect(result.current.maxRowLevel).toBe(7);
		act(() => result.current.patchState({ expandedRowIds: "all" }));
		expect(result.current.maxRowLevel).toBe(7);
	});
});
