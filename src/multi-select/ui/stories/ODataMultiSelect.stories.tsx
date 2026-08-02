import { useState, type ComponentProps } from "react";

import { useArgs } from "storybook/preview-api";

import {
	baseModel,
	baseOData,
	baseSegment,
	installODataStoryFetchMock,
	odataStoryOData,
	storyValues,
	withODataStoryQueryClient
} from "../../../select/stories/odataStoryFixtures";
import { ODataMultiSelect } from "../ODataMultiSelect";

import type { Meta, StoryObj } from "@storybook/react-vite";

type ODataMultiSelectStoryArgs = ComponentProps<typeof ODataMultiSelect>;

function ODataMultiSelectStoryCanvas(args: ODataMultiSelectStoryArgs) {
	const [, updateArgs] = useArgs<ODataMultiSelectStoryArgs>();

	return (
		<div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
			<ODataMultiSelect
				{...args}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
			/>
			<div style={{ fontSize: "var(--font-size-sm)", color: "var(--content-1)" }}>
				Текущее значение: {args.value.length ? args.value.join(", ") : "пусто"}
			</div>
		</div>
	);
}

function LinkedFiltersDemo() {
	const [regions, setRegions] = useState<string[]>([storyValues.region]);
	const [branches, setBranches] = useState<string[]>([storyValues.branch, storyValues.branchAlt]);
	const [teams, setTeams] = useState<string[]>([storyValues.team]);
	const [owners, setOwners] = useState<string[]>([storyValues.owner, storyValues.ownerAlt]);

	const regionDependencies = regions.length ? { REGION: regions } : undefined;
	const teamDependencies = regions.length && branches.length ? { REGION: regions, BRANCH: branches } : regionDependencies;
	const ownerDependencies =
		regions.length && branches.length && teams.length ? { REGION: regions, BRANCH: branches, TEAM: teams } : teamDependencies;

	return (
		<div style={{ display: "grid", gap: 16, maxWidth: 720 }}>
			<ODataMultiSelect
				label="Регион"
				description="Корневой фильтр для цепочки. После смены значения downstream-фильтры сбрасываются."
				odata={baseOData}
				model={{ ...baseModel, codeKey: "REGION" }}
				segment={{ placeholder: "Регион" }}
				value={regions}
				onChange={(nextRegions) => {
					setRegions(nextRegions);
					setBranches([]);
					setTeams([]);
					setOwners([]);
				}}
			/>
			<ODataMultiSelect
				label="Подразделение"
				description="Выбор нескольких подразделений внутри выбранных регионов."
				odata={baseOData}
				model={{ ...baseModel, codeKey: "BRANCH" }}
				segment={{ placeholder: "Подразделение" }}
				dependencies={regionDependencies}
				value={branches}
				onChange={(nextBranches) => {
					setBranches(nextBranches);
					setTeams([]);
					setOwners([]);
				}}
			/>
			<ODataMultiSelect
				label="Команда"
				description="Третий уровень зависит от текущего набора подразделений."
				odata={baseOData}
				model={{ ...baseModel, codeKey: "TEAM" }}
				segment={{ placeholder: "Команда" }}
				dependencies={teamDependencies}
				value={teams}
				onChange={(nextTeams) => {
					setTeams(nextTeams);
					setOwners([]);
				}}
			/>
			<ODataMultiSelect
				label="Ответственный"
				description="Leaf-уровень для выбранных команд."
				odata={baseOData}
				model={{ ...baseModel, codeKey: "OWNER" }}
				segment={{ placeholder: "Ответственный" }}
				dependencies={ownerDependencies}
				value={owners}
				onChange={setOwners}
			/>
			<div style={{ display: "grid", gap: 4, fontSize: "var(--font-size-sm)", color: "var(--content-1)" }}>
				<div>Регион: {regions.length ? regions.join(", ") : "пусто"}</div>
				<div>Подразделение: {branches.length ? branches.join(", ") : "пусто"}</div>
				<div>Команда: {teams.length ? teams.join(", ") : "пусто"}</div>
				<div>Ответственный: {owners.length ? owners.join(", ") : "пусто"}</div>
			</div>
		</div>
	);
}

const meta = {
	title: "Shared/UI/ODataMultiSelect",
	component: ODataMultiSelect,
	decorators: [withODataStoryQueryClient],
	beforeEach: installODataStoryFetchMock,
	parameters: {
		atomicCanvas: true,
		layout: "padded",
		odataMockMode: "success"
	},
	args: {
		label: "Регион",
		description: "Пример OData MultiSelect на основе конфигурации ui control.",
		odata: baseOData,
		model: baseModel,
		segment: baseSegment,
		value: [],
		onChange: () => {}
	},
	argTypes: {
		label: { description: "Заголовок поля.", control: "text" },
		description: { description: "Описание под полем.", control: "text" },
		odata: { description: "Конфигурация OData-источника.", control: false },
		model: { description: "Модель OData-коллекции и codeKey.", control: false },
		segment: { description: "Конфигурация отображения сегмента.", control: false },
		dependencies: { description: "Выбранные значения upstream-сегментов.", control: false },
		value: { description: "Контролируемый набор выбранных кодов или текстов.", control: false },
		onChange: { description: "Вызывается с новым набором выбранных значений.", control: false },
		disabled: { description: "Блокирует взаимодействие с полем.", control: "boolean" },
		size: { description: "Размер поля и подписей.", control: "select", options: ["xs", "sm", "md", "lg", "xl"] }
	}
} satisfies Meta<typeof ODataMultiSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BasicDivision: Story = {
	name: "Базовый регион",
	render: function Render(args) {
		return <ODataMultiSelectStoryCanvas {...args} />;
	},
	args: {
		label: "Регион",
		description: "Базовая настройка из multiSelectConfig: выбор кодов REGION с текстовым отображением.",
		model: { ...baseModel, codeKey: "REGION" },
		segment: { placeholder: "Регион" },
		value: [storyValues.region]
	}
};

export const HideCode: Story = {
	name: "Скрытый код",
	render: function Render(args) {
		return <ODataMultiSelectStoryCanvas {...args} />;
	},
	args: {
		label: "Подразделение",
		description: "Сценарий segment.hideCode: в списке и токене показывается только текст без кода.",
		model: { ...baseModel, codeKey: "BRANCH" },
		segment: { placeholder: "Подразделение", hideCode: true },
		value: [storyValues.branch, storyValues.branchAlt]
	}
};

export const SelectTextValue: Story = {
	name: "Выбор текста вместо кода",
	render: function Render(args) {
		return <ODataMultiSelectStoryCanvas {...args} />;
	},
	args: {
		label: "Регион по тексту",
		description: "Сценарий segment.selectText: наружу возвращаются текстовые значения, а не коды.",
		model: { ...baseModel, codeKey: "REGION" },
		segment: { placeholder: "Регион", selectText: true },
		value: [storyValues.regionText]
	}
};

export const StaticDependency: Story = {
	name: "Зависимость от региона",
	render: function Render(args) {
		return <ODataMultiSelectStoryCanvas {...args} />;
	},
	args: {
		label: "Подразделение c зависимостью",
		description: "Фильтрация подразделений по уже выбранному региону через props.dependencies.",
		model: { ...baseModel, codeKey: "BRANCH" },
		segment: { placeholder: "Подразделение" },
		dependencies: { REGION: [storyValues.region] },
		value: [storyValues.branch]
	}
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
	render: function Render(args) {
		return <ODataMultiSelectStoryCanvas {...args} />;
	},
	args: {
		odata: odataStoryOData.loading,
		label: "Команда",
		description: "Mock с задержкой ответа, чтобы проверить loading-state и skeleton.",
		model: { ...baseModel, codeKey: "TEAM" },
		segment: { placeholder: "Команда" }
	}
};

export const MetadataError: Story = {
	name: "Ошибка metadata",
	parameters: {
		odataMockMode: "metadataError"
	},
	render: function Render(args) {
		return <ODataMultiSelectStoryCanvas {...args} />;
	},
	args: {
		odata: odataStoryOData.metadataError,
		label: "Регион",
		description: "Сервис возвращает ошибку metadata. Полезно для проверки поведения хука useODataEntity.",
		model: { ...baseModel, codeKey: "REGION" },
		segment: { placeholder: "Регион" }
	}
};

export const CollectionError: Story = {
	name: "Деградация при ошибке коллекции",
	parameters: {
		odataMockMode: "collectionError"
	},
	render: function Render(args) {
		return <ODataMultiSelectStoryCanvas {...args} />;
	},
	args: {
		odata: odataStoryOData.collectionError,
		label: "Ответственный",
		description: "Transport возвращает 500, а текущий API-контракт безопасно показывает пустой список.",
		model: { ...baseModel, codeKey: "OWNER" },
		segment: { placeholder: "Ответственный" }
	}
};
