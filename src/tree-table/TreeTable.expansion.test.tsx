import { act } from "react";

import { type TableColumnDef } from "@ryuzaki13/react-foundation-lib/table";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TreeTable, type TreeTableProps } from "./TreeTable";

type ExpansionRow = Readonly<{ id: string; parentId: string | null; value: string }>;

const hierarchy: TreeTableProps<ExpansionRow>["hierarchy"] = {
	getRowId: (row) => row.id,
	getParentRowId: (row) => row.parentId
};
const columns: readonly TableColumnDef<ExpansionRow>[] = [
	{ id: "value", header: "Значение", cell: ({ row }) => <span data-tree-row-id={row.original.id}>{row.original.value}</span> }
];
const initialRows: readonly ExpansionRow[] = [
	{ id: "root", parentId: null, value: "Исходный снимок" },
	{ id: "child", parentId: "root", value: "Исходное значение" }
];
const cleanups: Array<() => Promise<void>> = [];

beforeEach(() => vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true));
afterEach(async () => {
	for (const cleanup of cleanups.splice(0)) await cleanup();
	vi.unstubAllGlobals();
});

async function mount(props: Partial<TreeTableProps<ExpansionRow>> = {}) {
	const container = document.createElement("div");
	document.body.append(container);
	const root = createRoot(container);
	const onExpandedRowIdsChange = vi.fn<(ids: string[]) => void>();
	const rerender = async (data: readonly ExpansionRow[]) => {
		await act(async () =>
			root.render(
				<TreeTable {...props} data={data} columns={columns} hierarchy={hierarchy} onExpandedRowIdsChange={onExpandedRowIdsChange} />
			)
		);
	};
	const toggle = async () => {
		const button = container.querySelector<HTMLButtonElement>('[data-ui="tree-table-expander"]');
		if (!button) throw new Error("Не найдено действие раскрытия узла.");
		await act(async () => button.click());
	};
	cleanups.push(async () => {
		await act(async () => root.unmount());
		container.remove();
	});
	await rerender(props.data ?? initialRows);
	return { container, rerender, toggle, onExpandedRowIdsChange };
}

describe("TreeTable: раскрытие при обновлении снимка", () => {
	it("сохраняет раскрытый узел при замене объектов с теми же IDs и показывает обновлённого потомка", async () => {
		const mounted = await mount();
		await mounted.toggle();
		expect(mounted.container.querySelector('[data-tree-row-id="child"]')).not.toBeNull();
		await mounted.rerender(initialRows.map((row) => ({ ...row, value: `${row.value}: обновлено` })));
		expect(mounted.container.querySelector('[data-tree-row-id="child"]')?.textContent).toBe("Исходное значение: обновлено");
		expect(mounted.onExpandedRowIdsChange).toHaveBeenLastCalledWith(["root"]);
	});

	it("удаляет раскрытие исчезнувшего узла и не восстанавливает его при последующем возвращении", async () => {
		const mounted = await mount();
		await mounted.toggle();
		const other: ExpansionRow = { id: "other", parentId: null, value: "Другой узел" };
		await mounted.rerender([other]);
		expect(mounted.onExpandedRowIdsChange).toHaveBeenLastCalledWith([]);
		await mounted.rerender([...initialRows, other]);
		expect(mounted.container.querySelector('[data-tree-row-id="child"]')).toBeNull();
	});

	it("применяет стартовое раскрытие после загрузки, но сохраняет последующее сворачивание пользователя", async () => {
		const mounted = await mount({ data: [], expandFirstLevel: true });
		await mounted.rerender(initialRows);
		expect(mounted.container.querySelector('[data-tree-row-id="child"]')).not.toBeNull();
		await mounted.toggle();
		await mounted.rerender(initialRows.map((row) => ({ ...row })));
		expect(mounted.container.querySelector('[data-tree-row-id="child"]')).toBeNull();
		expect(mounted.onExpandedRowIdsChange).toHaveBeenLastCalledWith([]);
	});
});
