import type { TreeSelectNode } from "../types";

export const demoTreeNodes: TreeSelectNode[] = [
	{
		id: "REGION:R01",
		codeKey: "REGION",
		value: "R01",
		label: "Северный регион",
		code: "R01",
		searchText: "R01 Северный регион",
		children: [
			{
				id: "REGION:R01/BRANCH:B0101",
				codeKey: "BRANCH",
				value: "B0101",
				label: "Подразделение Альфа",
				code: "B0101",
				searchText: "B0101 Подразделение Альфа",
				children: [
					{
						id: "REGION:R01/BRANCH:B0101/TEAM:T0101",
						codeKey: "TEAM",
						value: "T0101",
						label: "Команда поддержки",
						code: "T0101",
						searchText: "T0101 Команда поддержки",
						children: [
							{
								id: "REGION:R01/BRANCH:B0101/TEAM:T0101/OWNER:P0001",
								codeKey: "OWNER",
								value: "P0001",
								label: "Ответственный 1",
								code: "P0001",
								searchText: "P0001 Ответственный 1"
							},
							{
								id: "REGION:R01/BRANCH:B0101/TEAM:T0101/OWNER:P0002",
								codeKey: "OWNER",
								value: "P0002",
								label: "Ответственный 2",
								code: "P0002",
								searchText: "P0002 Ответственный 2"
							}
						]
					},
					{
						id: "REGION:R01/BRANCH:B0101/TEAM:T0102",
						codeKey: "TEAM",
						value: "T0102",
						label: "Команда внедрения",
						code: "T0102",
						searchText: "T0102 Команда внедрения",
						children: [
							{
								id: "REGION:R01/BRANCH:B0101/TEAM:T0102/OWNER:P0003",
								codeKey: "OWNER",
								value: "P0003",
								label: "Ответственный 3",
								code: "P0003",
								searchText: "P0003 Ответственный 3"
							}
						]
					}
				]
			},
			{
				id: "REGION:R01/BRANCH:B0102",
				codeKey: "BRANCH",
				value: "B0102",
				label: "Подразделение Бета",
				code: "B0102",
				searchText: "B0102 Подразделение Бета",
				children: [
					{
						id: "REGION:R01/BRANCH:B0102/TEAM:T0201",
						codeKey: "TEAM",
						value: "T0201",
						label: "Команда аналитики",
						code: "T0201",
						searchText: "T0201 Команда аналитики",
						children: [
							{
								id: "REGION:R01/BRANCH:B0102/TEAM:T0201/OWNER:P0004",
								codeKey: "OWNER",
								value: "P0004",
								label: "Ответственный 4",
								code: "P0004",
								searchText: "P0004 Ответственный 4"
							}
						]
					}
				]
			}
		]
	},
	{
		id: "REGION:R02",
		codeKey: "REGION",
		value: "R02",
		label: "Южный регион",
		code: "R02",
		searchText: "R02 Южный регион",
		children: [
			{
				id: "REGION:R02/BRANCH:B0201",
				codeKey: "BRANCH",
				value: "B0201",
				label: "Подразделение Гамма",
				code: "B0201",
				searchText: "B0201 Подразделение Гамма",
				children: [
					{
						id: "REGION:R02/BRANCH:B0201/TEAM:T0301",
						codeKey: "TEAM",
						value: "T0301",
						label: "Команда сопровождения",
						code: "T0301",
						searchText: "T0301 Команда сопровождения",
						children: [
							{
								id: "REGION:R02/BRANCH:B0201/TEAM:T0301/OWNER:P0005",
								codeKey: "OWNER",
								value: "P0005",
								label: "Ответственный 5",
								code: "P0005",
								searchText: "P0005 Ответственный 5"
							}
						]
					}
				]
			}
		]
	}
];

function createOrphanFixtureRoot(rootIndex: number, childCount: number): TreeSelectNode {
	const rootCode = `OR${rootIndex}`;

	return {
		id: `ORPHAN_ROOT:${rootCode}`,
		codeKey: "ORPHAN_ROOT",
		value: rootCode,
		label: `Группа ${rootIndex}`,
		code: rootCode,
		searchText: `${rootCode} Группа ${rootIndex}`,
		children: Array.from({ length: childCount }, (_, childIndex) => {
			const childCode = `${rootCode}-${childIndex + 1}`;

			return {
				id: `ORPHAN_ROOT:${rootCode}/ORPHAN_CHILD:${childCode}`,
				codeKey: "ORPHAN_CHILD",
				value: childCode,
				label: `Элемент ${rootIndex}.${childIndex + 1}`,
				code: childCode,
				searchText: `${childCode} Элемент ${rootIndex}.${childIndex + 1}`
			};
		})
	};
}

/**
 * Точный fixture защиты от orphan-start: при типичной логической высоте шесть
 * строк после первой большой группы остаются две ячейки, куда раньше попадали
 * root и один child следующей большой группы.
 */
export const orphanProtectionTreeNodes: TreeSelectNode[] = [
	createOrphanFixtureRoot(1, 3),
	createOrphanFixtureRoot(2, 3),
	createOrphanFixtureRoot(3, 1)
];
