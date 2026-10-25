import { describe, expect, it, vi } from "vitest";

import { buildCollectionRows } from "./buildCollectionRows";

describe("buildCollectionRows", () => {
	it("без опций сохраняет исходный порядок и по одной записи в строке", () => {
		const items = ["one", "two", "three"];
		const result = buildCollectionRows({ items, getKey: (item) => item });
		expect(result.itemCount).toBe(3);
		expect(
			result.rows.map(
				(row) => row.kind === "items" && row.entries.map(({ item, key, index, position }) => ({ item, key, index, position }))
			)
		).toEqual([
			[{ item: "one", key: "one", index: 0, position: 1 }],
			[{ item: "two", key: "two", index: 1, position: 2 }],
			[{ item: "three", key: "three", index: 2, position: 3 }]
		]);
	});

	it("пакует записи в строки, включая последнюю неполную строку", () => {
		const items = ["a", "b", "c", "d", "e"];
		const result = buildCollectionRows({ items, getKey: (item) => item, columns: { count: 2 } });
		expect(result.itemCount).toBe(5);
		expect(result.rows.map((row) => row.kind === "items" && row.entries.map((entry) => entry.key))).toEqual([
			["a", "b"],
			["c", "d"],
			["e"]
		]);
		expect(new Set(result.rows.map((row) => row.key)).size).toBe(3);
	});

	it("собирает одинаковые группы по первому появлению, не смешивая их в строке", () => {
		const items = Object.freeze([
			Object.freeze({ id: "b-first", group: "b" }),
			Object.freeze({ id: "a-first", group: "a" }),
			Object.freeze({ id: "b-second", group: "b" }),
			Object.freeze({ id: "a-second", group: "a" }),
			Object.freeze({ id: "b-third", group: "b" })
		]);
		const getKey = vi.fn((item: (typeof items)[number], index: number) => `${item.id}:${index}`);
		const groupKey = vi.fn<(item: (typeof items)[number], index: number) => string>((item) => item.group);
		const result = buildCollectionRows({ items, getKey, columns: { count: 2 }, grouping: { getKey: groupKey, render: () => null } });
		expect(result.itemCount).toBe(5);
		expect(
			result.rows.map((row) =>
				row.kind === "group"
					? { group: row.groupKey, items: row.items.map((item) => item.id) }
					: row.entries.map(({ item, key, index, position }) => ({ id: item.id, key, index, position }))
			)
		).toEqual([
			{ group: "b", items: ["b-first", "b-second", "b-third"] },
			[
				{ id: "b-first", key: "b-first:0", index: 0, position: 1 },
				{ id: "b-second", key: "b-second:2", index: 2, position: 2 }
			],
			[{ id: "b-third", key: "b-third:4", index: 4, position: 3 }],
			{ group: "a", items: ["a-first", "a-second"] },
			[
				{ id: "a-first", key: "a-first:1", index: 1, position: 4 },
				{ id: "a-second", key: "a-second:3", index: 3, position: 5 }
			]
		]);
		expect(getKey.mock.calls.map(([, index]) => index)).toEqual([0, 1, 2, 3, 4]);
		expect(groupKey.mock.calls.map((call) => call[1])).toEqual([0, 1, 2, 3, 4]);
		expect(new Set(result.rows.map((row) => row.key)).size).toBe(result.rows.length);
	});

	it("группировка работает независимо от columns, в том числе для пустого ключа группы", () => {
		const items = [
			{ id: "one", group: "" },
			{ id: "two", group: "other" },
			{ id: "three", group: "" }
		];
		const result = buildCollectionRows({
			items,
			getKey: (item) => item.id,
			grouping: { getKey: (item) => item.group, render: () => null }
		});
		expect(result.rows.map((row) => (row.kind === "group" ? row.groupKey : row.entries.map((entry) => entry.key)))).toEqual([
			"",
			["one"],
			["three"],
			"other",
			["two"]
		]);
	});

	it("пустой набор не создаёт заголовки или пустые строки", () => {
		const result = buildCollectionRows({
			items: [],
			getKey: String,
			columns: { count: 3 },
			grouping: { getKey: String, render: () => null }
		});
		expect(result).toEqual({ rows: [], itemCount: 0 });
	});

	it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])("отклоняет недопустимое число столбцов %s", (count) => {
		expect(() => buildCollectionRows({ items: ["one"], getKey: (item) => item, columns: { count } })).toThrow(RangeError);
	});
});
