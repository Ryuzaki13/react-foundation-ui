import { describe, expect, it } from "vitest";

import type { ODataDependentSegmentItem } from "@ryuzaki13/react-foundation-api/odata";

import { resolveOrderedTreeSegmentItems } from "./resolveOrderedTreeSegmentItems";

function createItem(id: string, segmentIndex: number): ODataDependentSegmentItem {
	return {
		id,
		serviceKey: "S.T",
		serviceIndex: 0,
		segmentIndex,
		odata: { service: "S", target: "T" },
		segment: { placeholder: id },
		model: { codeKey: id },
		panelVisibility: "user"
	};
}

describe("resolveOrderedTreeSegmentItems", () => {
	it("берет chain-порядок, если он доступен", () => {
		const items = [createItem("B", 0), createItem("A", 1), createItem("C", 2)];

		expect(
			resolveOrderedTreeSegmentItems(items, {
				"S.T": [
					{ codeKey: "A", count: 1 },
					{ codeKey: "C", count: 2 }
				]
			}).map((item) => item.id)
		).toEqual(["A", "C", "B"]);
	});

	it("сохраняет исходный порядок сегментов без chain", () => {
		const items = [createItem("B", 0), createItem("A", 1), createItem("C", 2)];

		expect(resolveOrderedTreeSegmentItems(items, {}).map((item) => item.id)).toEqual(["B", "A", "C"]);
	});
});
