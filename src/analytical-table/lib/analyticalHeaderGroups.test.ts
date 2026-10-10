import { describe, expect, it } from "vitest";

import { buildAnalyticalHeaderRows } from "./analyticalHeaderGroups";

describe("analytical nested headers", () => {
	it("разбивает три уровня на границе pinned и сохраняет colspan", () => {
		const groups = [
			{
				id: "root",
				label: "Корень",
				columnIds: ["a"],
				children: [
					{
						id: "middle",
						label: "Подгруппа",
						columnIds: ["b"],
						children: [{ id: "leaf", label: "Детали", columnIds: ["c", "d"] }]
					}
				]
			}
		];
		const rows = buildAnalyticalHeaderRows(["a", "b", "c", "d"], new Map([["a", 40]]), groups);
		expect(rows).toHaveLength(3);
		expect(rows[0].map((segment) => [segment.group?.id, segment.count, segment.offset])).toEqual([
			["root", 1, 40],
			["root", 3, undefined]
		]);
		expect(rows[2].at(-1)?.count).toBe(2);
		expect(rows.every((row) => row.reduce((sum, segment) => sum + segment.count, 0) === 4)).toBe(true);
	});
});
