import { describe, expect, it } from "vitest";

import { createPaginationModel } from "./createPaginationModel";

describe("модель нумерованной пагинации", () => {
	it.each([0, 1, 2, 7])("показывает все номера при количестве %i", (pageCount) => {
		expect(createPaginationModel(1, pageCount)).toEqual({
			page: 1,
			items: Array.from({ length: pageCount }, (_, index) => ({ kind: "page", page: index + 1 }))
		});
	});

	it("показывает начало, соседей и конец большого набора", () => {
		expect(createPaginationModel(1, 43).items).toEqual([
			{ kind: "page", page: 1 },
			{ kind: "page", page: 2 },
			{ kind: "page", page: 3 },
			{ kind: "page", page: 4 },
			{ kind: "gap", position: "after" },
			{ kind: "page", page: 43 }
		]);

		expect(createPaginationModel(22, 43).items).toEqual([
			{ kind: "page", page: 1 },
			{ kind: "gap", position: "before" },
			{ kind: "page", page: 21 },
			{ kind: "page", page: 22 },
			{ kind: "page", page: 23 },
			{ kind: "gap", position: "after" },
			{ kind: "page", page: 43 }
		]);

		expect(createPaginationModel(43, 43).items).toEqual([
			{ kind: "page", page: 1 },
			{ kind: "gap", position: "before" },
			{ kind: "page", page: 40 },
			{ kind: "page", page: 41 },
			{ kind: "page", page: 42 },
			{ kind: "page", page: 43 }
		]);
	});

	it("сохраняет порядок, identity текущей страницы и края при всех переходах", () => {
		for (let pageCount = 1; pageCount <= 100; pageCount++) {
			for (let page = 1; page <= pageCount; page++) {
				const model = createPaginationModel(page, pageCount);
				const numbers = model.items.flatMap((item) => (item.kind === "page" ? [item.page] : []));

				expect(numbers[0]).toBe(1);
				expect(numbers.at(-1)).toBe(pageCount);
				expect(numbers).toContain(page);
				expect(numbers).toEqual([...new Set(numbers)].sort((left, right) => left - right));
				expect(numbers.length).toBeLessThanOrEqual(7);
			}
		}
	});

	it("ограничивает номер после сокращения набора без создания лишних элементов", () => {
		expect(createPaginationModel(43, 2)).toEqual({
			page: 2,
			items: [
				{ kind: "page", page: 1 },
				{ kind: "page", page: 2 }
			]
		});

		expect(createPaginationModel(1_000_000, Number.MAX_SAFE_INTEGER).items).toHaveLength(7);
		expect(createPaginationModel(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER).items).toHaveLength(6);
	});

	it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])("отклоняет неправильный номер %j", (page) => {
		expect(() => createPaginationModel(page, 10)).toThrow(RangeError);
	});

	it.each([-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])("отклоняет неправильное количество %j", (pageCount) => {
		expect(() => createPaginationModel(1, pageCount)).toThrow(RangeError);
	});
});
