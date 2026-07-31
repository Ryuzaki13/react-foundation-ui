import { describe, expect, it } from "vitest";

import { buildTreeColumnsLayoutDescriptor } from "./buildTreeColumnsLayoutDescriptor";
import { resolveBalancedTreeColumnsLayout, resolveTreeColumnsPlacements } from "./resolveBalancedTreeColumnsLayout";

const desktopGeometry = {
	availableWidth: 1424,
	availableHeight: 860,
	viewportWidth: 1440,
	viewportHeight: 900,
	referenceWidth: 224
};

function buildDescriptor(levels: readonly number[]) {
	return buildTreeColumnsLayoutDescriptor(levels.map((level) => ({ level })));
}

function buildFlatDescriptor(itemCount: number) {
	return buildDescriptor(Array.from({ length: itemCount }, () => 0));
}

describe("resolveTreeColumnsPlacements", () => {
	it("переносит целую большую группу при двух оставшихся строках", () => {
		const resolved = resolveTreeColumnsPlacements(buildDescriptor([0, 1, 1, 1, 0, 1, 1, 1]), 6);

		expect(resolved.placements[4]).toEqual({ column: 2, row: 1 });
		expect(resolved.intentionalGapCount).toBe(2);
		expect(resolved.usedColumnCount).toBe(2);
	});

	it("удерживает целую группу, даже когда protected prefix поместился бы в текущем остатке", () => {
		const resolved = resolveTreeColumnsPlacements(buildDescriptor([0, 1, 0, 1, 1, 1, 1]), 6);

		expect(resolved.placements[2]).toEqual({ column: 2, row: 1 });
		expect(resolved.intentionalGapCount).toBe(4);
	});

	it("оставляет protected group в текущей колонке при достаточном остатке", () => {
		const resolved = resolveTreeColumnsPlacements(buildDescriptor([0, 1, 0, 1, 1, 1]), 6);

		expect(resolved.placements[2]).toEqual({ column: 1, row: 3 });
		expect(resolved.intentionalGapCount).toBe(0);
	});

	it("считает второй direct child после grandchildren первого child", () => {
		const resolved = resolveTreeColumnsPlacements(buildDescriptor([0, 1, 1, 0, 1, 2, 2, 1, 1, 2, 2]), 7);

		expect(resolved.placements[3]).toEqual({ column: 2, row: 1 });
		expect(resolved.placements[7]).toEqual({ column: 2, row: 5 });
	});

	it("не переносит prefix до второго direct child, если он заполняет доступный остаток", () => {
		const resolved = resolveTreeColumnsPlacements(buildDescriptor([0, 1, 0, 1, 2, 2, 1, 1, 2, 2]), 7);

		expect(resolved.placements[2]).toEqual({ column: 1, row: 3 });
		expect(resolved.placements[6]).toEqual({ column: 1, row: 7 });
		expect(resolved.intentionalGapCount).toBe(0);
	});

	it("использует three-row fallback для слишком длинного direct-child prefix", () => {
		const resolved = resolveTreeColumnsPlacements(buildDescriptor([0, 1, 1, 0, 1, 2, 2, 2, 2, 1, 1]), 5);

		expect(resolved.placements.slice(3, 6)).toEqual([
			{ column: 2, row: 1 },
			{ column: 2, row: 2 },
			{ column: 2, row: 3 }
		]);
		expect(resolved.intentionalGapCount).toBe(2);
	});

	it("не включает специальную защиту для root ровно с двумя direct children", () => {
		const resolved = resolveTreeColumnsPlacements(buildDescriptor([0, 1, 1, 0, 1, 2, 1, 2]), 4);

		expect(resolved.placements[3]).toEqual({ column: 1, row: 4 });
		expect(resolved.placements[4]).toEqual({ column: 2, row: 1 });
		expect(resolved.intentionalGapCount).toBe(0);
	});
});

describe("resolveBalancedTreeColumnsLayout", () => {
	it("возвращает одну CSS-строку для пустого дерева", () => {
		expect(resolveBalancedTreeColumnsLayout({ ...desktopGeometry, descriptor: buildDescriptor([]) })).toMatchObject({
			columnCount: 1,
			rowCount: 1,
			placements: []
		});
	});

	it.each([
		[5, 1],
		[12, 2],
		[24, 2],
		[80, 4]
	])("балансирует %i независимых опций без implicit columns", (itemCount, expectedColumnCount) => {
		const layout = resolveBalancedTreeColumnsLayout({
			...desktopGeometry,
			descriptor: buildFlatDescriptor(itemCount)
		});

		expect(layout.columnCount).toBe(expectedColumnCount);
		expect(layout.placements).toHaveLength(itemCount);
		expect(
			layout.placements.every(({ column, row }) => column >= 1 && column <= layout.columnCount && row >= 1 && row <= layout.rowCount)
		).toBe(true);
	});

	it("сводит раскладку к одной колонке в узком viewport", () => {
		const layout = resolveBalancedTreeColumnsLayout({
			...desktopGeometry,
			descriptor: buildFlatDescriptor(24),
			availableWidth: 299,
			viewportWidth: 315
		});

		expect(layout.columnCount).toBe(1);
		expect(layout.width).toBeLessThanOrEqual(299);
	});

	it("не превышает ограничение в шесть колонок при широком viewport", () => {
		const layout = resolveBalancedTreeColumnsLayout({
			...desktopGeometry,
			descriptor: buildFlatDescriptor(1000),
			availableWidth: 10_000,
			availableHeight: 300,
			viewportWidth: 10_016,
			viewportHeight: 316
		});

		expect(layout.columnCount).toBe(6);
		expect(layout.width).toBeLessThanOrEqual(10_000);
	});

	it("использует доступную высоту выше прежних 75vh, не выходя за safe area", () => {
		const availableHeightLayout = resolveBalancedTreeColumnsLayout({
			...desktopGeometry,
			descriptor: buildFlatDescriptor(80)
		});
		const viewportSafeLayout = resolveBalancedTreeColumnsLayout({
			...desktopGeometry,
			descriptor: buildFlatDescriptor(80),
			availableHeight: 1000
		});

		expect(availableHeightLayout.maxHeight).toBe(860);
		expect(viewportSafeLayout.maxHeight).toBe(884);
	});

	it("сохраняет минимум три строки и safe scroll в низком viewport", () => {
		const layout = resolveBalancedTreeColumnsLayout({
			...desktopGeometry,
			descriptor: buildDescriptor([0, 1, 1, 1, 0, 1, 1, 1]),
			availableHeight: 500,
			viewportHeight: 300
		});

		expect(layout.rowCount).toBeGreaterThanOrEqual(3);
		expect(layout.maxHeight).toBe(284);
	});

	it("считает фактическое число колонок с intentional gaps и ограничивает все placements template grid", () => {
		const descriptor = buildDescriptor([0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1]);
		const layout = resolveBalancedTreeColumnsLayout({
			...desktopGeometry,
			descriptor,
			availableHeight: 280,
			viewportHeight: 320
		});
		const usedColumnCount = Math.max(...layout.placements.map(({ column }) => column));
		const occupiedCells = new Set(layout.placements.map(({ column, row }) => `${column}:${row}`));

		expect(layout.columnCount).toBe(usedColumnCount);
		expect(occupiedCells.size).toBe(descriptor.itemCount);
		expect(layout.placements.every(({ column, row }) => column <= layout.columnCount && row <= layout.rowCount)).toBe(true);
	});

	it.each([3, 4, 5, 6, 7, 8, 9, 10, 11])("не создаёт implicit columns при packing в %i строк", (rowCount) => {
		const descriptor = buildDescriptor([0, 1, 1, 0, 1, 2, 2, 1, 1, 2, 2]);
		const resolved = resolveTreeColumnsPlacements(descriptor, rowCount);

		expect(
			resolved.placements.every(({ column, row }) => column >= 1 && column <= resolved.usedColumnCount && row >= 1 && row <= rowCount)
		).toBe(true);
	});
});
