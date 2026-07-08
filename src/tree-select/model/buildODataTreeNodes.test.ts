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
});
