import { describe, expect, it } from "vitest";

import { indexCollectionRowAnchorKeys } from "./indexCollectionRowAnchorKeys";

describe("indexCollectionRowAnchorKeys", () => {
	it("связывает исходные identities с рядами и сохраняет границы полноширинных заголовков", () => {
		const rows = Object.freeze([Object.freeze(["group:first"]), Object.freeze(["item-1", "item-2"]), Object.freeze(["item-3"])]);
		expect(indexCollectionRowAnchorKeys(rows, (keys) => keys)).toEqual({
			keys: ["group:first", "item-1", "item-2", "item-3"],
			rowIndexes: [0, 1, 1, 2],
			firstKeyIndexes: [0, 1, 3]
		});
		expect(rows[1]).toEqual(["item-1", "item-2"]);
	});

	it("не создаёт фиктивный логический ключ для пустого ряда", () => {
		expect(indexCollectionRowAnchorKeys([[], ["item"]], (keys) => keys)).toEqual({
			keys: ["item"],
			rowIndexes: [1],
			firstKeyIndexes: [undefined, 0]
		});
	});
});
