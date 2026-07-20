import { describe, expect, it } from "vitest";

import {
	createTreeNodeIndex,
	getSelectableTreeNodeIds,
	getTreeNodeSelectionState,
	toggleTreeMultiSelection,
	treeMultiValueToSelectedIds
} from "./treeUtils";

import type { TreeSelectNode } from "../types";

const nodes: TreeSelectNode[] = [
	{
		id: "ZDIV:04",
		codeKey: "ZDIV",
		value: "04",
		label: "Металл",
		code: "04",
		searchText: "04 Металл",
		children: [
			{
				id: "ZDIV:04/ZCFO1:0202",
				codeKey: "ZCFO1",
				value: "0202",
				label: "Екатеринбург",
				code: "0202",
				searchText: "0202 Екатеринбург",
				children: [
					{
						id: "ZDIV:04/ZCFO1:0202/VSTEL:0601",
						codeKey: "VSTEL",
						value: "0601",
						label: "Склад 1",
						code: "0601",
						searchText: "0601 Склад 1"
					},
					{
						id: "ZDIV:04/ZCFO1:0202/VSTEL:0604",
						codeKey: "VSTEL",
						value: "0604",
						label: "Склад 4",
						code: "0604",
						searchText: "0604 Склад 4"
					}
				]
			},
			{
				id: "ZDIV:04/ZCFO1:0204",
				codeKey: "ZCFO1",
				value: "0204",
				label: "Пермь",
				code: "0204",
				searchText: "0204 Пермь"
			}
		]
	}
];

describe("tree selection utils", () => {
	it("выбирает leaf как самое глубокое значение", () => {
		const index = createTreeNodeIndex(nodes);

		expect(toggleTreeMultiSelection({}, "ZDIV:04/ZCFO1:0202/VSTEL:0601", index)).toEqual({
			VSTEL: ["0601"]
		});
	});

	it("выбирает parent как один узел вместо всех leaf", () => {
		const index = createTreeNodeIndex(nodes);

		expect(toggleTreeMultiSelection({}, "ZDIV:04/ZCFO1:0202", index)).toEqual({
			ZCFO1: ["0202"]
		});
	});

	it("автоматически схлопывает полное покрытие детей в parent", () => {
		const index = createTreeNodeIndex(nodes);
		const afterFirstBranch = toggleTreeMultiSelection({}, "ZDIV:04/ZCFO1:0202", index);
		const afterSecondBranch = toggleTreeMultiSelection(afterFirstBranch, "ZDIV:04/ZCFO1:0204", index);

		expect(afterSecondBranch).toEqual({
			ZDIV: ["04"]
		});
	});

	it("разворачивает parent при частичном снятии subtree", () => {
		const index = createTreeNodeIndex(nodes);

		expect(toggleTreeMultiSelection({ ZDIV: ["04"] }, "ZDIV:04/ZCFO1:0202/VSTEL:0601", index)).toEqual({
			ZCFO1: ["0204"],
			VSTEL: ["0604"]
		});
	});

	it("ставит partial state на предках при выборе leaf", () => {
		const index = createTreeNodeIndex(nodes);
		const selectedIds = treeMultiValueToSelectedIds({ VSTEL: ["0601"] }, index);
		const selectionState = getTreeNodeSelectionState(selectedIds, index);

		expect(selectionState.selectedIds.has("ZDIV:04/ZCFO1:0202/VSTEL:0601")).toBe(true);
		expect(selectionState.partialIds.has("ZDIV:04/ZCFO1:0202")).toBe(true);
		expect(selectionState.partialIds.has("ZDIV:04")).toBe(true);
	});

	it("массово выбирает только доступные поддеревья", () => {
		const index = createTreeNodeIndex([
			{
				...nodes[0],
				children: [{ ...nodes[0].children![0], disabled: true }, nodes[0].children![1]]
			}
		]);

		const selectableIds = getSelectableTreeNodeIds(index);
		expect([...selectableIds]).toEqual(["ZDIV:04/ZCFO1:0202/VSTEL:0601", "ZDIV:04/ZCFO1:0202/VSTEL:0604", "ZDIV:04/ZCFO1:0204"]);
		expect(treeMultiValueToSelectedIds({ VSTEL: ["0601", "0604"], ZCFO1: ["0204"] }, index)).toEqual(selectableIds);
	});

	it("клик по ancestor не выбирает disabled descendants", () => {
		const index = createTreeNodeIndex([
			{
				...nodes[0],
				children: [nodes[0].children![0], { ...nodes[0].children![1], disabled: true }]
			}
		]);

		expect(toggleTreeMultiSelection({}, "ZDIV:04", index)).toEqual({ ZCFO1: ["0202"] });
		expect(toggleTreeMultiSelection({ ZCFO1: ["0202"] }, "ZDIV:04", index)).toEqual({});
	});

	it("не возвращает disabled descendant после раскрытия ранее выбранного ancestor", () => {
		const index = createTreeNodeIndex([
			{
				...nodes[0],
				children: [nodes[0].children![0], { ...nodes[0].children![1], disabled: true }]
			}
		]);

		/*
		 * Значение ancestor было сохранено до того, как дочерний узел стал
		 * недоступным. Снятие доступной ветки не должно материализовать disabled-узел.
		 */
		expect(toggleTreeMultiSelection({ ZDIV: ["04"] }, "ZDIV:04/ZCFO1:0202", index)).toEqual({});
	});
});
