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
						owners: [
							{ code: "P0001", text: "Ответственный 1" },
							{ code: "P0002", text: "Ответственный 2" },
							{ code: "P0003", text: "Ответственный 3" }
						]
					},
					{
						code: "T0102",
						text: "Команда внедрения",
						owners: [
							{ code: "P0004", text: "Ответственный 4" },
							{ code: "P0005", text: "Ответственный 5" }
						]
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
						owners: [
							{ code: "P0006", text: "Ответственный 6" },
							{ code: "P0007", text: "Ответственный 7" }
						]
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
						owners: [
							{ code: "P0008", text: "Ответственный 8" },
							{ code: "P0009", text: "Ответственный 9" }
						]
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
						code: "T0401",
						text: "Команда развития",
						owners: [
							{ code: "P0010", text: "Ответственный 10" },
							{ code: "P0011", text: "Ответственный 11" }
						]
					}
				]
			},
			{
				code: "B0302",
				text: "Подразделение Омега",
				teams: [
					{
						code: "T0501",
						text: "Команда качества",
						owners: [
							{ code: "P0012", text: "Ответственный 12" },
							{ code: "P0013", text: "Ответственный 13" }
						]
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
