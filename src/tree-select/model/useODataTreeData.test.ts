// @vitest-environment jsdom

import { useODataCollection, useODataCollectionChains, useODataCollectionModel } from "@ryuzaki13/react-foundation-api/odata";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useODataTreeData } from "./useODataTreeData";

vi.mock("@ryuzaki13/react-foundation-api/odata", async (importOriginal) => {
	const original = await importOriginal<typeof import("@ryuzaki13/react-foundation-api/odata")>();

	return {
		...original,
		useODataCollection: vi.fn(),
		useODataCollectionChains: vi.fn(),
		useODataCollectionModel: vi.fn()
	};
});

const items = [
	{
		ROOT: "10",
		ROOT_TXT: "Якорь",
		CHILD: "10",
		CHILD_TXT: "Якорь"
	},
	{
		ROOT: "20",
		ROOT_TXT: "Альфа",
		CHILD: "20",
		CHILD_TXT: "Альфа"
	},
	{
		ROOT: "10",
		ROOT_TXT: "Якорь",
		CHILD: "20",
		CHILD_TXT: "Альфа"
	}
];

beforeEach(() => {
	vi.mocked(useODataCollectionChains).mockReturnValue({});
	vi.mocked(useODataCollectionModel).mockImplementation((model) => ({
		minSearchTextLength: 0,
		minSearchCodeLength: 0,
		searchDebounceDelay: 0,
		maxVisibleItems: 100,
		...model
	}));
	vi.mocked(useODataCollection).mockReturnValue({
		data: {
			items,
			keyPairs: [
				{ codeKey: "ROOT", textKey: "ROOT_TXT" },
				{ codeKey: "CHILD", textKey: "CHILD_TXT" }
			],
			keyPairsMap: {
				ROOT: "ROOT_TXT",
				CHILD: "CHILD_TXT"
			},
			separated: {},
			chain: [],
			count: items.length,
			cacheUpdatedAt: 0
		},
		isLoading: false,
		isError: false
	} as unknown as ReturnType<typeof useODataCollection>);
});

describe("useODataTreeData", () => {
	it("передаёт локальный sortByCode=false в построение дерева", () => {
		const { result } = renderHook(() =>
			useODataTreeData({
				odata: {
					service: "S",
					target: "T",
					sortByCode: false
				},
				segments: {
					ROOT: { placeholder: "Корень" },
					CHILD: { placeholder: "Дочерний уровень" }
				}
			})
		);

		expect(result.current.nodes.map((node) => node.label)).toEqual(["Альфа", "Якорь"]);
		expect(result.current.nodes[1].children?.map((node) => node.label)).toEqual(["Альфа", "Якорь"]);
	});
});
