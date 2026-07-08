import { useState } from "react";

import { ODataSelect } from "../ODataSelect";

import { baseModel, baseOData, baseSegment, storyValues, withMockedOData } from "./odataStoryFixtures";

import type { ODataCollectionConfig, ODataCollectionModel, ODataCollectionSegment } from "@ryuzaki13/react-foundation-api/odata";
import type { Meta, StoryObj } from "@storybook/react-vite";

function StatefulODataSelect({
	initialValue,
	odata = baseOData,
	model = baseModel,
	segment = baseSegment,
	dependencies,
	label = "OData Select",
	description
}: {
	initialValue?: string;
	odata?: ODataCollectionConfig;
	model?: ODataCollectionModel;
	segment?: ODataCollectionSegment;
	dependencies?: Record<string, string[]>;
	label?: string;
	description?: string;
}) {
	const [value, setValue] = useState<string | undefined>(initialValue);

	return (
		<div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
			<ODataSelect
				label={label}
				description={description}
				odata={odata}
				model={model}
				segment={segment}
				value={value}
				dependencies={dependencies}
				onChange={setValue}
			/>
			<div style={{ fontSize: "var(--font-size-sm)", color: "var(--content-1)" }}>Текущее значение: {value || "пусто"}</div>
		</div>
	);
}

function LinkedFiltersDemo() {
	const [region, setRegion] = useState<string | undefined>(storyValues.region);
	const [branch, setBranch] = useState<string | undefined>(storyValues.branch);
	const [team, setTeam] = useState<string | undefined>(storyValues.team);
	const [owner, setOwner] = useState<string | undefined>(storyValues.owner);

	const regionDependencies = region ? { REGION: [region] } : undefined;
	const teamDependencies = region && branch ? { REGION: [region], BRANCH: [branch] } : regionDependencies;
	const ownerDependencies = region && branch && team ? { REGION: [region], BRANCH: [branch], TEAM: [team] } : teamDependencies;

	return (
		<div style={{ display: "grid", gap: 16, maxWidth: 720 }}>
			<ODataSelect
				label="Регион"
				description="Первый фильтр в цепочке. Меняет доступный набор подразделений."
				odata={baseOData}
				model={{ ...baseModel, codeKey: "REGION" }}
				segment={{ placeholder: "Регион" }}
				value={region}
				onChange={(nextRegion) => {
					setRegion(nextRegion);
					setBranch(undefined);
					setTeam(undefined);
					setOwner(undefined);
				}}
			/>
			<ODataSelect
				label="Подразделение"
				description="Второй фильтр зависит от выбранного региона."
				odata={baseOData}
				model={{ ...baseModel, codeKey: "BRANCH" }}
				segment={{ placeholder: "Подразделение" }}
				dependencies={regionDependencies}
				value={branch}
				onChange={(nextBranch) => {
					setBranch(nextBranch);
					setTeam(undefined);
					setOwner(undefined);
				}}
			/>
			<ODataSelect
				label="Команда"
				description="Третий фильтр зависит от сочетания региона и подразделения."
				odata={baseOData}
				model={{ ...baseModel, codeKey: "TEAM" }}
				segment={{ placeholder: "Команда" }}
				dependencies={teamDependencies}
				value={team}
				onChange={(nextTeam) => {
					setTeam(nextTeam);
					setOwner(undefined);
				}}
			/>
			<ODataSelect
				label="Ответственный"
				description="Последний фильтр показывает leaf-узлы для выбранного пути."
				odata={baseOData}
				model={{ ...baseModel, codeKey: "OWNER" }}
				segment={{ placeholder: "Ответственный" }}
				dependencies={ownerDependencies}
				value={owner}
				onChange={setOwner}
			/>
			<div style={{ display: "grid", gap: 4, fontSize: "var(--font-size-sm)", color: "var(--content-1)" }}>
				<div>Регион: {region || "пусто"}</div>
				<div>Подразделение: {branch || "пусто"}</div>
				<div>Команда: {team || "пусто"}</div>
				<div>Ответственный: {owner || "пусто"}</div>
			</div>
		</div>
	);
}

const meta = {
	title: "Shared/UI/ODataSelect",
	component: ODataSelect,
	decorators: [withMockedOData],
	parameters: {
		atomicCanvas: true,
		layout: "padded",
		odataMockMode: "success"
	},
	args: {
		label: "Регион",
		description: "Пример OData Select на основе конфигурации ui control.",
		odata: baseOData,
		model: baseModel,
		segment: baseSegment,
		value: undefined,
		onChange: () => {}
	},
	argTypes: {
		onChange: { control: false },
		value: { control: false },
		dependencies: { control: false }
	},
	tags: ["autodocs"]
} satisfies Meta<typeof ODataSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BasicDivision: Story = {
	name: "Базовый регион",
	render: () => (
		<StatefulODataSelect
			label="Регион"
			description="Базовая настройка single-select для выбора кода REGION."
			model={{ ...baseModel, codeKey: "REGION" }}
			segment={{ placeholder: "Регион" }}
			initialValue={storyValues.region}
		/>
	)
};

export const HideCode: Story = {
	name: "Скрытый код",
	render: () => (
		<StatefulODataSelect
			label="Подразделение"
			description="Код скрыт и в выпадающем списке, и в выбранном значении."
			model={{ ...baseModel, codeKey: "BRANCH" }}
			segment={{ placeholder: "Подразделение", hideCode: true }}
			initialValue={storyValues.branch}
		/>
	)
};

export const SelectTextValue: Story = {
	name: "Выбор текста вместо кода",
	render: () => (
		<StatefulODataSelect
			label="Регион по тексту"
			description="Снаружи хранится текстовое значение, а не код."
			model={{ ...baseModel, codeKey: "REGION" }}
			segment={{ placeholder: "Регион", selectText: true }}
			initialValue={storyValues.regionText}
		/>
	)
};

export const StaticDependency: Story = {
	name: "Зависимость от региона",
	render: () => (
		<StatefulODataSelect
			label="Подразделение c зависимостью"
			description="Фильтрация подразделений по уже выбранному региону через props.dependencies."
			model={{ ...baseModel, codeKey: "BRANCH" }}
			segment={{ placeholder: "Подразделение" }}
			dependencies={{ REGION: [storyValues.region] }}
			initialValue={storyValues.branch}
		/>
	)
};

export const LinkedFilters: Story = {
	name: "Связанная цепочка фильтров",
	render: () => <LinkedFiltersDemo />
};

export const LoadingState: Story = {
	name: "Состояние загрузки",
	parameters: {
		odataMockMode: "loading"
	},
	render: () => (
		<StatefulODataSelect
			label="Команда"
			description="Mock с задержкой ответа, чтобы проверить loading-state."
			model={{ ...baseModel, codeKey: "TEAM" }}
			segment={{ placeholder: "Команда" }}
		/>
	)
};

export const MetadataError: Story = {
	name: "Ошибка metadata",
	parameters: {
		odataMockMode: "metadataError"
	},
	render: () => (
		<StatefulODataSelect
			label="Регион"
			description="Сервис возвращает ошибку metadata."
			model={{ ...baseModel, codeKey: "REGION" }}
			segment={{ placeholder: "Регион" }}
		/>
	)
};

export const CollectionError: Story = {
	name: "Ошибка коллекции",
	parameters: {
		odataMockMode: "collectionError"
	},
	render: () => (
		<StatefulODataSelect
			label="Ответственный"
			description="Metadata доступна, но загрузка коллекции завершается ошибкой."
			model={{ ...baseModel, codeKey: "OWNER" }}
			segment={{ placeholder: "Ответственный" }}
		/>
	)
};
