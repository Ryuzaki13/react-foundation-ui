import { useState, type ComponentProps } from "react";

import { useArgs } from "storybook/preview-api";

import { ODataSelect } from "../ODataSelect";

import {
	baseModel,
	baseOData,
	baseSegment,
	installODataStoryFetchMock,
	odataStoryOData,
	storyValues,
	withODataStoryQueryClient
} from "./odataStoryFixtures";

import type { Meta, StoryObj } from "@storybook/react-vite";

type ODataSelectStoryArgs = ComponentProps<typeof ODataSelect>;

function ODataSelectStoryCanvas(args: ODataSelectStoryArgs) {
	const [, updateArgs] = useArgs<ODataSelectStoryArgs>();

	return (
		<div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
			<ODataSelect
				{...args}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
			/>
			<div style={{ fontSize: "var(--font-size-sm)", color: "var(--content-1)" }}>Текущее значение: {args.value || "пусто"}</div>
		</div>
	);
}

export function LinkedFiltersDemo() {
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
	decorators: [withODataStoryQueryClient],
	beforeEach: installODataStoryFetchMock,
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
		label: { description: "Заголовок поля.", control: "text" },
		description: { description: "Описание под полем.", control: "text" },
		odata: { description: "Конфигурация OData-источника.", control: false },
		model: { description: "Модель OData-коллекции и codeKey.", control: false },
		segment: { description: "Конфигурация отображения сегмента.", control: false },
		dependencies: { description: "Выбранные значения upstream-сегментов.", control: false },
		value: { description: "Контролируемый код или текст выбранной option.", control: false },
		onChange: { description: "Вызывается с новым значением option.", control: false },
		clearable: { description: "Показывает действие очистки выбора.", control: "boolean" },
		disabled: { description: "Блокирует взаимодействие с полем.", control: "boolean" },
		size: { description: "Размер поля и подписей.", control: "select", options: ["xs", "sm", "md", "lg", "xl"] }
	}
} satisfies Meta<typeof ODataSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BasicDivision: Story = {
	name: "Базовый регион",
	render: function Render(args) {
		return <ODataSelectStoryCanvas {...args} />;
	},
	args: {
		label: "Регион",
		description: "Базовая настройка single-select для выбора кода REGION.",
		model: { ...baseModel, codeKey: "REGION" },
		segment: { placeholder: "Регион" },
		value: storyValues.region
	}
};

export const HideCode: Story = {
	name: "Скрытый код",
	render: function Render(args) {
		return <ODataSelectStoryCanvas {...args} />;
	},
	args: {
		label: "Подразделение",
		description: "Код скрыт и в выпадающем списке, и в выбранном значении.",
		model: { ...baseModel, codeKey: "BRANCH" },
		segment: { placeholder: "Подразделение", hideCode: true },
		value: storyValues.branch
	}
};

export const SelectTextValue: Story = {
	name: "Выбор текста вместо кода",
	render: function Render(args) {
		return <ODataSelectStoryCanvas {...args} />;
	},
	args: {
		label: "Регион по тексту",
		description: "Снаружи хранится текстовое значение, а не код.",
		model: { ...baseModel, codeKey: "REGION" },
		segment: { placeholder: "Регион", selectText: true },
		value: storyValues.regionText
	}
};

export const StaticDependency: Story = {
	name: "Зависимость от региона",
	render: function Render(args) {
		return <ODataSelectStoryCanvas {...args} />;
	},
	args: {
		label: "Подразделение c зависимостью",
		description: "Фильтрация подразделений по уже выбранному региону через props.dependencies.",
		model: { ...baseModel, codeKey: "BRANCH" },
		segment: { placeholder: "Подразделение" },
		dependencies: { REGION: [storyValues.region] },
		value: storyValues.branch
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
		return <ODataSelectStoryCanvas {...args} />;
	},
	args: {
		odata: odataStoryOData.loading,
		label: "Команда",
		description: "Mock с задержкой ответа, чтобы проверить loading-state.",
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
		return <ODataSelectStoryCanvas {...args} />;
	},
	args: {
		odata: odataStoryOData.metadataError,
		label: "Регион",
		description: "Сервис возвращает ошибку metadata.",
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
		return <ODataSelectStoryCanvas {...args} />;
	},
	args: {
		odata: odataStoryOData.collectionError,
		label: "Ответственный",
		description: "Transport возвращает 500, а текущий API-контракт безопасно показывает пустой список.",
		model: { ...baseModel, codeKey: "OWNER" },
		segment: { placeholder: "Ответственный" }
	}
};
