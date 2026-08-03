import { describe, expect, it } from "vitest";

import { buildODataTreeNodes } from "./buildODataTreeNodes";

describe("buildODataTreeNodes", () => {
	it("строит дерево по порядку codeKey, дедуплицирует узлы и учитывает hideCode", () => {
		const nodes = buildODataTreeNodes({
			items: [
				{
					ZDIV: "04",
					ZDIV_TXT: "Металл",
					ZCFO1: "0202",
					ZCFO1_TXT: "Екатеринбург",
					VSTEL: "0601",
					VSTEL_TXT: "Склад 1"
				},
				{
					ZDIV: "04",
					ZDIV_TXT: "Металл",
					ZCFO1: "0202",
					ZCFO1_TXT: "Екатеринбург",
					VSTEL: "0604",
					VSTEL_TXT: "Склад 4"
				},
				{
					ZDIV: "04",
					ZDIV_TXT: "Металл",
					ZCFO1: "0204",
					ZCFO1_TXT: "Пермь",
					VSTEL: "0701",
					VSTEL_TXT: "Склад ПРМ"
				}
			],
			orderedCodeKeys: ["ZDIV", "ZCFO1", "VSTEL"],
			keyPairsMap: {
				ZDIV: "ZDIV_TXT",
				ZCFO1: "ZCFO1_TXT",
				VSTEL: "VSTEL_TXT"
			},
			hiddenCodeKeys: new Set(["ZCFO1"])
		});

		expect(nodes).toHaveLength(1);
		expect(nodes[0]).toMatchObject({
			id: "ZDIV:04",
			codeKey: "ZDIV",
			value: "04",
			label: "Металл",
			code: "04"
		});
		expect(nodes[0].children).toHaveLength(2);
		expect(nodes[0].children?.[0]).toMatchObject({
			id: "ZDIV:04/ZCFO1:0202",
			label: "Екатеринбург",
			code: undefined
		});
		expect(nodes[0].children?.[0].children).toHaveLength(2);
		expect(nodes[0].children?.[0].children?.[1]).toMatchObject({
			id: "ZDIV:04/ZCFO1:0202/VSTEL:0604",
			label: "Склад 4",
			code: "0604"
		});
		expect(nodes[0].children?.[0].searchText).toContain("0202");
		expect(nodes[0].children?.[0].searchText).toContain("Екатеринбург");
	});

	it("останавливает ветку на первом пустом уровне", () => {
		const nodes = buildODataTreeNodes({
			items: [
				{
					ZDIV: "04",
					ZDIV_TXT: "Металл",
					ZCFO1: "0202",
					ZCFO1_TXT: "Екатеринбург",
					VSTEL: ""
				}
			],
			orderedCodeKeys: ["ZDIV", "ZCFO1", "VSTEL"],
			keyPairsMap: {
				ZDIV: "ZDIV_TXT",
				ZCFO1: "ZCFO1_TXT",
				VSTEL: "VSTEL_TXT"
			},
			hiddenCodeKeys: new Set()
		});

		expect(nodes[0].children?.[0].children).toBeUndefined();
	});

	it("сохраняет потомков разрешённого пустого структурного уровня", () => {
		const nodes = buildODataTreeNodes({
			items: [{ ROOT: "", CHILD: "10", CHILD_TEXT: "Десять" }],
			orderedCodeKeys: ["ROOT", "CHILD"],
			keyPairsMap: { CHILD: "CHILD_TEXT" },
			hiddenCodeKeys: new Set(),
			allowEmptyCodeKeys: new Set(["ROOT"])
		});

		expect(nodes).toHaveLength(1);
		expect(nodes[0]).toMatchObject({ codeKey: "ROOT", value: "" });
		expect(nodes[0].children).toEqual([expect.objectContaining({ codeKey: "CHILD", value: "10", label: "Десять" })]);
	});

	it("использует текст как value для сегментов с selectText", () => {
		const nodes = buildODataTreeNodes({
			items: [
				{
					ZDIV: "04",
					ZDIV_TXT: "Металл"
				}
			],
			orderedCodeKeys: ["ZDIV"],
			keyPairsMap: {
				ZDIV: "ZDIV_TXT"
			},
			hiddenCodeKeys: new Set(),
			textValueCodeKeys: new Set(["ZDIV"])
		});

		expect(nodes[0]).toMatchObject({
			id: "ZDIV:Металл",
			codeKey: "ZDIV",
			value: "Металл",
			label: "Металл",
			code: "04"
		});
		expect(nodes[0].searchText).toContain("04");
	});

	it("строит sparse-дерево без соседних уровней цепочки", () => {
		const nodes = buildODataTreeNodes({
			items: [
				{
					ZDIV: "04",
					ZDIV_TXT: "Металл",
					ZCFO1: "0202",
					ZCFO1_TXT: "Екатеринбург",
					ZCSLS_OFF: "0601",
					ZCSLS_OFF_TXT: "Офис 1"
				}
			],
			orderedCodeKeys: ["ZDIV", "ZCSLS_OFF"],
			keyPairsMap: {
				ZDIV: "ZDIV_TXT",
				ZCSLS_OFF: "ZCSLS_OFF_TXT"
			},
			hiddenCodeKeys: new Set()
		});

		expect(nodes).toEqual([
			{
				id: "ZDIV:04",
				codeKey: "ZDIV",
				value: "04",
				label: "Металл",
				code: "04",
				searchText: "04 Металл",
				children: [
					{
						id: "ZDIV:04/ZCSLS_OFF:0601",
						codeKey: "ZCSLS_OFF",
						value: "0601",
						label: "Офис 1",
						code: "0601",
						searchText: "0601 Офис 1"
					}
				]
			}
		]);
	});

	it("по умолчанию рекурсивно сортирует по исходному коду при hideCode и selectText", () => {
		const nodes = buildODataTreeNodes({
			items: [
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
				},
				{
					ROOT: "10",
					ROOT_TXT: "Якорь",
					CHILD: "10",
					CHILD_TXT: "Якорь"
				}
			],
			orderedCodeKeys: ["ROOT", "CHILD"],
			keyPairsMap: {
				ROOT: "ROOT_TXT",
				CHILD: "CHILD_TXT"
			},
			hiddenCodeKeys: new Set(["ROOT", "CHILD"]),
			textValueCodeKeys: new Set(["ROOT", "CHILD"])
		});

		expect(nodes.map((node) => node.label)).toEqual(["Якорь", "Альфа"]);
		expect(nodes[0].children?.map((node) => node.label)).toEqual(["Якорь", "Альфа"]);
		expect(nodes[0].code).toBeUndefined();
		expect(nodes[0].value).toBe("Якорь");
		expect(nodes[0]).not.toHaveProperty("sortCode");
	});

	it("при sortByCode=false рекурсивно сортирует по отображаемому тексту", () => {
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
		const nodes = buildODataTreeNodes({
			items,
			orderedCodeKeys: ["ROOT", "CHILD"],
			keyPairsMap: {
				ROOT: "ROOT_TXT",
				CHILD: "CHILD_TXT"
			},
			hiddenCodeKeys: new Set(["ROOT", "CHILD"]),
			textValueCodeKeys: new Set(["ROOT", "CHILD"]),
			sortByCode: false
		});

		expect(nodes.map((node) => node.label)).toEqual(["Альфа", "Якорь"]);
		expect(nodes[1].children?.map((node) => node.label)).toEqual(["Альфа", "Якорь"]);
		expect(nodes[1].children?.every((node) => !("sortCode" in node))).toBe(true);
		expect(items.map((item) => `${item.ROOT}:${item.CHILD}`)).toEqual(["10:10", "20:20", "10:20"]);
	});
});
