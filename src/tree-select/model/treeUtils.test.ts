import { describe, expect, it } from "vitest";

import {
	createTreeNodeIndex,
	getConfiguredTreeExpandedIds,
	getSelectableTreeNodeIds,
	getTreeNodeSelectionState,
	toggleTreeMultiSelection,
	treeMultiValueToSelectedIds,
	treeSelectedIdsToMultiValue
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

/** Два визуальных представления одного server predicate в разных ветвях. */
const duplicatePredicateNodes: TreeSelectNode[] = [
	{
		id: "GROUP:02",
		codeKey: "GROUP",
		value: "02",
		label: "02",
		searchText: "02",
		selectionBehavior: "descendants",
		children: [
			{
				id: "GROUP:02/ZPRODH01:A",
				codeKey: "ZPRODH01",
				value: "A",
				label: "Группа A",
				searchText: "A Группа A",
				children: [
					{
						id: "GROUP:02/ZPRODH01:A/ZPRODH11:A1",
						codeKey: "ZPRODH11",
						value: "A1",
						label: "Подгруппа 1",
						searchText: "A1 Подгруппа 1"
					},
					{
						id: "GROUP:02/ZPRODH01:A/ZPRODH11:A2",
						codeKey: "ZPRODH11",
						value: "A2",
						label: "Подгруппа 2",
						searchText: "A2 Подгруппа 2"
					}
				]
			}
		]
	},
	{
		id: "GROUP:other",
		codeKey: "GROUP",
		value: "other",
		label: "Остальные",
		searchText: "Остальные",
		selectionBehavior: "descendants",
		children: [
			{
				id: "GROUP:other/ZPRODH01:A",
				codeKey: "ZPRODH01",
				value: "A",
				label: "Группа A",
				searchText: "A Группа A",
				children: [
					{
						id: "GROUP:other/ZPRODH01:A/ZPRODH11:A3",
						codeKey: "ZPRODH11",
						value: "A3",
						label: "Подгруппа 3",
						searchText: "A3 Подгруппа 3"
					}
				]
			}
		]
	}
];

/** Создаёт независимое дерево с одним явно запрещённым узлом. */
function disableTreeNode(sourceNodes: readonly TreeSelectNode[], disabledNodeId: string): TreeSelectNode[] {
	return sourceNodes.map((node) => ({
		...node,
		disabled: node.id === disabledNodeId ? true : node.disabled,
		children: node.children ? disableTreeNode(node.children, disabledNodeId) : undefined
	}));
}

describe("tree expansion utils", () => {
	const index = createTreeNodeIndex(nodes);
	const rootId = "ZDIV:04";
	const branchId = "ZDIV:04/ZCFO1:0202";

	it.each([
		{ codeKeys: [], expectedIds: [] },
		{ codeKeys: ["ZDIV"], expectedIds: [rootId] },
		{ codeKeys: ["ZDIV", "ZCFO1"], expectedIds: [rootId, branchId] },
		{ codeKeys: ["ZCFO1"], expectedIds: [branchId] }
	])("раскрывает настроенные уровни $codeKeys", ({ codeKeys, expectedIds }) => {
		expect(getConfiguredTreeExpandedIds(index, new Set(codeKeys), new Map())).toEqual(new Set(expectedIds));
	});

	it("применяет ручные true и false поверх настройки уровня", () => {
		expect(
			getConfiguredTreeExpandedIds(
				index,
				new Set(["ZDIV"]),
				new Map([
					[rootId, false],
					[branchId, true]
				])
			)
		).toEqual(new Set([branchId]));
	});

	it("не добавляет leaf в набор раскрытых узлов", () => {
		const leafId = "ZDIV:04/ZCFO1:0202/VSTEL:0601";

		expect(getConfiguredTreeExpandedIds(index, new Set(["VSTEL"]), new Map([[leafId, true]]))).toEqual(new Set());
	});
});

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

	it("переключает виртуальную группу через потомков и не сериализует саму группу", () => {
		const virtualGroupNodes: TreeSelectNode[] = [
			{
				id: "GROUP:main",
				codeKey: "GROUP",
				value: "main",
				label: "Основные",
				searchText: "Основные",
				selectionBehavior: "descendants",
				children: nodes[0].children
			}
		];
		const index = createTreeNodeIndex(virtualGroupNodes);
		const selectedValue = toggleTreeMultiSelection({}, "GROUP:main", index);

		expect(selectedValue).toEqual({ ZCFO1: ["0202", "0204"] });
		expect(selectedValue).not.toHaveProperty("GROUP");
		expect(toggleTreeMultiSelection(selectedValue, "GROUP:main", index)).toEqual({});

		const selectedIds = treeMultiValueToSelectedIds(selectedValue, index);
		const selectionState = getTreeNodeSelectionState(selectedIds, index);
		expect(selectionState.selectedIds.has("GROUP:main")).toBe(true);
	});

	it("разворачивает сохранённое значение виртуальной группы в актуальное покрытие потомков", () => {
		const index = createTreeNodeIndex([
			{
				id: "GROUP:main",
				codeKey: "GROUP",
				value: "main",
				label: "Основные",
				searchText: "Основные",
				selectionBehavior: "descendants",
				children: nodes[0].children
			}
		]);

		expect(treeMultiValueToSelectedIds({ GROUP: ["main"] }, index)).toEqual(new Set(["ZDIV:04/ZCFO1:0202", "ZDIV:04/ZCFO1:0204"]));
	});

	it("связывает все визуальные узлы одного server predicate с одним multi-value", () => {
		const index = createTreeNodeIndex(duplicatePredicateNodes);
		const equivalentIds = new Set(["GROUP:02/ZPRODH01:A", "GROUP:other/ZPRODH01:A"]);

		expect(treeMultiValueToSelectedIds({ ZPRODH01: ["A"] }, index)).toEqual(equivalentIds);
		expect(treeSelectedIdsToMultiValue(equivalentIds, index)).toEqual({ ZPRODH01: ["A"] });
		expect(treeSelectedIdsToMultiValue(getSelectableTreeNodeIds(index), index)).toEqual({ ZPRODH01: ["A"] });
		expect(toggleTreeMultiSelection({}, "GROUP:02/ZPRODH01:A", index)).toEqual({ ZPRODH01: ["A"] });
		expect(toggleTreeMultiSelection({ ZPRODH01: ["A"] }, "GROUP:02/ZPRODH01:A", index)).toEqual({});
	});

	it("разворачивает все эквивалентные parent-ветви при частичном снятии выбора", () => {
		const index = createTreeNodeIndex(duplicatePredicateNodes);

		expect(toggleTreeMultiSelection({ ZPRODH01: ["A"] }, "GROUP:02/ZPRODH01:A/ZPRODH11:A1", index)).toEqual({ ZPRODH11: ["A2", "A3"] });
	});

	it("не схлопывает дочерние значения до полного покрытия всех эквивалентных parent-ветвей", () => {
		const index = createTreeNodeIndex(duplicatePredicateNodes);

		expect(treeMultiValueToSelectedIds({ ZPRODH11: ["A1", "A2"] }, index)).toEqual(
			new Set(["GROUP:02/ZPRODH01:A/ZPRODH11:A1", "GROUP:02/ZPRODH01:A/ZPRODH11:A2"])
		);
		expect(treeMultiValueToSelectedIds({ ZPRODH11: ["A1", "A2", "A3"] }, index)).toEqual(
			new Set(["GROUP:02/ZPRODH01:A", "GROUP:other/ZPRODH01:A"])
		);
	});

	it("не сериализует parent predicate при disabled-потомке в эквивалентной ветви", () => {
		const nodesWithDisabledDescendant = disableTreeNode(duplicatePredicateNodes, "GROUP:other/ZPRODH01:A/ZPRODH11:A3");
		const index = createTreeNodeIndex(nodesWithDisabledDescendant);

		expect(toggleTreeMultiSelection({}, "GROUP:02/ZPRODH01:A", index)).toEqual({ ZPRODH11: ["A1", "A2"] });
		expect(treeSelectedIdsToMultiValue(getSelectableTreeNodeIds(index), index)).toEqual({ ZPRODH11: ["A1", "A2"] });
	});

	it("блокирует новый общий predicate для enabled и disabled дублей, но позволяет снять сохранённый", () => {
		const duplicateLeafNodes: TreeSelectNode[] = [
			{
				id: "ROOT:01/VALUE:X",
				codeKey: "VALUE",
				value: "X",
				label: "Разрешённый X",
				searchText: "Разрешённый X"
			},
			{
				id: "ROOT:02/VALUE:X",
				codeKey: "VALUE",
				value: "X",
				label: "Запрещённый X",
				searchText: "Запрещённый X",
				disabled: true
			}
		];
		const index = createTreeNodeIndex(duplicateLeafNodes);

		expect(toggleTreeMultiSelection({}, "ROOT:01/VALUE:X", index)).toEqual({});
		expect(toggleTreeMultiSelection({ VALUE: ["X"] }, "ROOT:01/VALUE:X", index)).toEqual({});
	});

	it("не создаёт новый predicate для вложенных дублей одного codeKey/value", () => {
		const nestedDuplicateNodes: TreeSelectNode[] = [
			{
				id: "VALUE:X",
				codeKey: "VALUE",
				value: "X",
				label: "Родитель X",
				searchText: "Родитель X",
				children: [
					{
						id: "VALUE:X/VALUE:X",
						codeKey: "VALUE",
						value: "X",
						label: "Потомок X",
						searchText: "Потомок X"
					}
				]
			}
		];
		const index = createTreeNodeIndex(nestedDuplicateNodes);

		expect(toggleTreeMultiSelection({}, "VALUE:X", index)).toEqual({});
		expect(toggleTreeMultiSelection({ VALUE: ["X"] }, "VALUE:X", index)).toEqual({});
	});
});
