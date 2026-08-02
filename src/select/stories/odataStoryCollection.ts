type DemoOwner = {
	code: string;
	text: string;
};

type DemoTeam = {
	code: string;
	text: string;
	owners: DemoOwner[];
};

type DemoBranch = {
	code: string;
	text: string;
	teams: DemoTeam[];
};

type DemoRegion = {
	code: string;
	text: string;
	branches: DemoBranch[];
};

function createOwners(firstId: number, count: number): DemoOwner[] {
	return Array.from({ length: count }, (_, index) => {
		const id = firstId + index;
		return {
			code: `P${String(id).padStart(4, "0")}`,
			text: `Ответственный ${id}`
		};
	});
}

const demoRegions: DemoRegion[] = [
	{
		code: "R01",
		text: "Северный регион",
		branches: [
			{
				code: "B0101",
				text: "Подразделение Альфа",
				teams: [
					{
						code: "T0101",
						text: "Команда поддержки",
						owners: createOwners(1, 8)
					},
					{
						code: "T0102",
						text: "Команда внедрения",
						owners: createOwners(9, 6)
					},
					{
						code: "T0103",
						text: "Команда инфраструктуры",
						owners: createOwners(15, 5)
					}
				]
			},
			{
				code: "B0102",
				text: "Подразделение Бета",
				teams: [
					{
						code: "T0201",
						text: "Команда аналитики",
						owners: createOwners(20, 6)
					},
					{
						code: "T0202",
						text: "Проектный офис",
						owners: createOwners(26, 5)
					}
				]
			}
		]
	},
	{
		code: "R02",
		text: "Южный регион",
		branches: [
			{
				code: "B0201",
				text: "Подразделение Гамма",
				teams: [
					{
						code: "T0301",
						text: "Команда сопровождения",
						owners: createOwners(31, 6)
					},
					{
						code: "T0302",
						text: "Команда продаж",
						owners: createOwners(37, 5)
					}
				]
			},
			{
				code: "B0202",
				text: "Подразделение Логистика",
				teams: [
					{
						code: "T0401",
						text: "Команда логистики",
						owners: createOwners(42, 5)
					}
				]
			}
		]
	},
	{
		code: "R03",
		text: "Восточный регион",
		branches: [
			{
				code: "B0301",
				text: "Подразделение Дельта",
				teams: [
					{
						code: "T0501",
						text: "Команда развития",
						owners: createOwners(47, 6)
					},
					{
						code: "T0502",
						text: "Команда архитектуры",
						owners: createOwners(53, 5)
					}
				]
			},
			{
				code: "B0302",
				text: "Подразделение Омега",
				teams: [
					{
						code: "T0601",
						text: "Команда качества",
						owners: createOwners(58, 5)
					}
				]
			}
		]
	},
	{
		code: "R04",
		text: "Западный регион",
		branches: [
			{
				code: "B0401",
				text: "Подразделение Сигма",
				teams: [
					{
						code: "T0701",
						text: "Финансовая команда",
						owners: createOwners(63, 5)
					},
					{
						code: "T0702",
						text: "Команда по работе с клиентами",
						owners: createOwners(68, 5)
					}
				]
			}
		]
	}
];

export const mockCollectionItems: Array<Record<string, string>> = demoRegions.flatMap((region) =>
	region.branches.flatMap((branch) =>
		branch.teams.flatMap((team) =>
			team.owners.map((owner) => ({
				REGION: region.code,
				REGION_Text: region.text,
				BRANCH: branch.code,
				BRANCH_Text: branch.text,
				TEAM: team.code,
				TEAM_Text: team.text,
				OWNER: owner.code,
				OWNER_Text: owner.text
			}))
		)
	)
);
