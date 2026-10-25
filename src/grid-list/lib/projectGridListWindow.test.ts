import { describe, expect, it } from "vitest";

import { buildCollectionRows } from "../../collection-layout/lib/buildCollectionRows";
import { getCollectionRowAnchorKeys } from "../../collection-layout/lib/getCollectionRowAnchorKeys";
import { createGridListTestItems } from "../test-fixtures/gridListItems.fixture.test";

import { projectGridListWindow } from "./projectGridListWindow";

describe("GridList: переходное окно после изменения упаковки", () => {
	it("сохраняет все прежние карточки, включая хвост, при переносе между рядами", () => {
		const items = createGridListTestItems(12);
		const previous = buildCollectionRows({ items, getKey: (item) => item.id, columns: { count: 3 } });
		const next = buildCollectionRows({ items, getKey: (item) => item.id, columns: { count: 2 } });
		const anchorKeys = previous.rows.flatMap(getCollectionRowAnchorKeys);
		const indexes = new Map(next.rows.flatMap((row, index) => getCollectionRowAnchorKeys(row).map((key) => [key, index] as const)));
		const result = projectGridListWindow(next.rows, indexes, anchorKeys, [], false);
		const projectedKeys = result.flatMap(({ row }) => (row?.kind === "items" ? row.entries.map((entry) => entry.key) : []));
		expect(projectedKeys).toEqual(items.map((item) => item.id));
		expect(new Set(projectedKeys).size).toBe(items.length);
	});

	it("произвольная перестановка сохраняет разнесённые карточки без монтирования всего промежутка", () => {
		const items = createGridListTestItems(10000);
		const previous = buildCollectionRows({ items: items.slice(0, 3), getKey: (item) => item.id, columns: { count: 3 } });
		const reordered = [items[0], ...items.slice(3, 5002), items[1], ...items.slice(5002), items[2]];
		const next = buildCollectionRows({ items: reordered, getKey: (item) => item.id, columns: { count: 2 } });
		const anchorKeys = [...previous.rows.flatMap(getCollectionRowAnchorKeys), JSON.stringify(["item", "removed"])];
		const indexes = new Map(next.rows.flatMap((row, index) => getCollectionRowAnchorKeys(row).map((key) => [key, index] as const)));
		const sentinel = { key: -1, index: previous.rows.length, start: 120, end: 240, size: 120, lane: 0 };
		const result = projectGridListWindow(next.rows, indexes, anchorKeys, [sentinel], true);
		const dataRows = result.filter(({ row }) => row !== undefined);
		const projectedKeys = new Set(dataRows.flatMap(({ row }) => (row?.kind === "items" ? row.entries.map((entry) => entry.key) : [])));
		for (const item of items.slice(0, 3)) expect(projectedKeys.has(item.id)).toBe(true);
		// Размер переходного DOM определяется прежним окном, а не расстоянием
		// между новыми позициями записей после сортировки большого источника.
		expect(dataRows.length).toBeLessThanOrEqual(3);
		expect(projectedKeys.size).toBeLessThanOrEqual(6);
		expect(result.filter(({ row }) => row === undefined)).toEqual([{ key: sentinel.key, index: next.rows.length, row: undefined }]);
		expect(projectGridListWindow(next.rows, indexes, anchorKeys, [sentinel], false).every(({ row }) => row !== undefined)).toBe(true);
	});
});
