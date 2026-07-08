import { describe, expect, it } from "vitest";

import {
	buildTableFormattingSnapshot,
	hasTableColumnCustomCellRenderer,
	resolveTableFormattingColumnId,
	shouldUseTableFormatting
} from "./formatting";

import type { TableColumnDef } from "@ryuzaki13/react-foundation-lib/table";

type DemoRow = {
	id: string;
	amount: number;
	status: string;
};

/**
 * Создаёт measure-колонку для тестов сборки formatting-runtime.
 */
function measureColumn(overrides?: Partial<TableColumnDef<DemoRow>>): TableColumnDef<DemoRow> {
	return {
		id: "amount",
		accessorKey: "amount",
		header: "Сумма",
		meta: {
			align: "right",
			formatting: {
				role: "measure",
				type: "decimal"
			}
		},
		...overrides
	};
}

describe("table formatting helpers", () => {
	it("включает в compile-map только колонки с meta.formatting", () => {
		const snapshot = buildTableFormattingSnapshot([
			measureColumn(),
			{
				id: "status",
				accessorKey: "status",
				header: "Статус"
			}
		]);

		expect(Object.keys(snapshot.runtimeByColumnId)).toEqual(["amount"]);
	});

	it("использует column.id раньше accessorKey", () => {
		const column = measureColumn({
			id: "TOTAL_AMOUNT",
			accessorKey: "amount"
		});

		expect(resolveTableFormattingColumnId(column)).toBe("TOTAL_AMOUNT");
	});

	it("игнорирует колонку без стабильного id", () => {
		const snapshot = buildTableFormattingSnapshot([
			{
				header: "Без id",
				meta: {
					formatting: {
						role: "dimension",
						type: "string"
					}
				}
			} as TableColumnDef<DemoRow>
		]);

		expect(snapshot.runtimeByColumnId).toEqual({});
	});

	it("определяет наличие кастомного cell и блокирует formatting для такой колонки", () => {
		const column = measureColumn({
			cell: ({ getValue }) => `Кастом: ${String(getValue())}`
		});
		const snapshot = buildTableFormattingSnapshot([column]);

		expect(hasTableColumnCustomCellRenderer(column)).toBe(true);
		expect(snapshot.customCellColumnIds.has("amount")).toBe(true);
		expect(
			shouldUseTableFormatting({
				columnId: "amount",
				runtimeByColumnId: snapshot.runtimeByColumnId,
				customCellColumnIds: snapshot.customCellColumnIds
			})
		).toBe(false);
	});

	it("включает formatted path, если кастомного cell нет", () => {
		const snapshot = buildTableFormattingSnapshot([measureColumn()]);

		expect(
			shouldUseTableFormatting({
				columnId: "amount",
				runtimeByColumnId: snapshot.runtimeByColumnId,
				customCellColumnIds: snapshot.customCellColumnIds
			})
		).toBe(true);
	});
});
