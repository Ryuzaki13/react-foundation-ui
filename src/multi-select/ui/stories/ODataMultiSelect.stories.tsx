import { useState } from "react";

import type { ODataCollectionConfig, ODataCollectionModel, ODataCollectionSegment } from "@ryuzaki13/react-foundation-api/odata";

import { baseModel, baseOData, baseSegment, storyValues, withMockedOData } from "../../../select/stories/odataStoryFixtures";
import { ODataMultiSelect } from "../ODataMultiSelect";

import type { Meta, StoryObj } from "@storybook/react-vite";

function StatefulODataMultiSelect({
	initialValue = [],
	odata = baseOData,
	model = baseModel,
	segment = baseSegment,
	dependencies,
	label = "OData MultiSelect",
	description
}: {
	initialValue?: string[];
	odata?: ODataCollectionConfig;
	model?: ODataCollectionModel;
	segment?: ODataCollectionSegment;
	dependencies?: Record<string, string[]>;
	label?: string;
	description?: string;
}) {
	const [value, setValue] = useState<string[]>(initialValue);

	return (
		<div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
			<ODataMultiSelect
				label={label}
				description={description}
				odata={odata}
				model={model}
				segment={segment}
				value={value}
				dependencies={dependencies}
				onChange={setValue}
			/>
			<div style={{ fontSize: "var(--font-size-sm)", color: "var(--content-1)" }}>
				Текущее значение: {value.length ? value.join(", ") : "пусто"}
			</div>
		</div>
	);
}

function LinkedFiltersDemo() {
	const [divisions, setDivisions] = useState<string[]>([storyValues.division]);
	const [branches, setBranches] = useState<string[]>([storyValues.branch, storyValues.branchAlt]);
	const [salesOffices, setSalesOffices] = useState<string[]>([storyValues.salesOffice]);
	const [managerGroups, setManagerGroups] = useState<string[]>([storyValues.managerGroup, storyValues.managerGroupAlt]);

	const divisionDependencies = divisions.length ? { ZDIV: divisions } : undefined;
	const salesOfficeDependencies = divisions.length && branches.length ? { ZDIV: divisions, ZCFO1: branches } : divisionDependencies;
	const managerDependencies =
		divisions.length && branches.length && salesOffices.length
			? { ZDIV: divisions, ZCFO1: branches, ZCSLS_OFF: salesOffices }
			: salesOfficeDependencies;

	return (
		<div style={{ display: "grid", gap: 16, maxWidth: 720 }}>
			<ODataMultiSelect
				label="Дивизион"
				description="Корневой фильтр для цепочки. После смены значения downstream-фильтры сбрасываются."
				odata={baseOData}
				model={{ ...baseModel, codeKey: "ZDIV" }}
				segment={{ placeholder: "Дивизион" }}
				value={divisions}
				onChange={(nextDivisions) => {
					setDivisions(nextDivisions);
					setBranches([]);
					setSalesOffices([]);
					setManagerGroups([]);
				}}
			/>
			<ODataMultiSelect
				label="Филиал"
				description="Выбор нескольких филиалов внутри выбранных дивизионов."
				odata={baseOData}
				model={{ ...baseModel, codeKey: "ZCFO1" }}
				segment={{ placeholder: "Филиал" }}
				dependencies={divisionDependencies}
				value={branches}
				onChange={(nextBranches) => {
					setBranches(nextBranches);
					setSalesOffices([]);
					setManagerGroups([]);
				}}
			/>
			<ODataMultiSelect
				label="Отдел сбыта CRM"
				description="Третий уровень зависит от текущего набора филиалов."
				odata={baseOData}
				model={{ ...baseModel, codeKey: "ZCSLS_OFF" }}
				segment={{ placeholder: "Отдел сбыта CRM" }}
				dependencies={salesOfficeDependencies}
				value={salesOffices}
				onChange={(nextSalesOffices) => {
					setSalesOffices(nextSalesOffices);
					setManagerGroups([]);
				}}
			/>
			<ODataMultiSelect
				label="Группа менеджеров"
				description="Leaf-уровень для выбранных отделов сбыта."
				odata={baseOData}
				model={{ ...baseModel, codeKey: "ZBPMNGRRP" }}
				segment={{ placeholder: "Группа менеджеров" }}
				dependencies={managerDependencies}
				value={managerGroups}
				onChange={setManagerGroups}
			/>
			<div style={{ display: "grid", gap: 4, fontSize: "var(--font-size-sm)", color: "var(--content-1)" }}>
				<div>Дивизион: {divisions.length ? divisions.join(", ") : "пусто"}</div>
				<div>Филиал: {branches.length ? branches.join(", ") : "пусто"}</div>
				<div>Отдел сбыта CRM: {salesOffices.length ? salesOffices.join(", ") : "пусто"}</div>
				<div>Группа менеджеров: {managerGroups.length ? managerGroups.join(", ") : "пусто"}</div>
			</div>
		</div>
	);
}

const meta = {
	title: "Shared/UI/ODataMultiSelect",
	component: ODataMultiSelect,
	decorators: [withMockedOData],
	parameters: {
		atomicCanvas: true,
		layout: "padded",
		odataMockMode: "success"
	},
	args: {
		label: "Дивизион",
		description: "Пример OData MultiSelect на основе конфигурации ui control.",
		odata: baseOData,
		model: baseModel,
		segment: baseSegment,
		value: [],
		onChange: () => {}
	},
	argTypes: {
		onChange: { control: false },
		value: { control: false },
		dependencies: { control: false }
	},
	tags: ["autodocs"]
} satisfies Meta<typeof ODataMultiSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BasicDivision: Story = {
	name: "Базовый дивизион",
	render: () => (
		<StatefulODataMultiSelect
			label="Дивизион"
			description="Базовая настройка из multiSelectConfig: выбор кодов ZDIV с текстовым отображением."
			model={{ ...baseModel, codeKey: "ZDIV" }}
			segment={{ placeholder: "Дивизион" }}
			initialValue={[storyValues.division]}
		/>
	)
};

export const HideCode: Story = {
	name: "Скрытый код",
	render: () => (
		<StatefulODataMultiSelect
			label="Филиал"
			description="Сценарий segment.hideCode: в списке и токене показывается только текст без кода."
			model={{ ...baseModel, codeKey: "ZCFO1" }}
			segment={{ placeholder: "Филиал", hideCode: true }}
			initialValue={[storyValues.branch, storyValues.branchAlt]}
		/>
	)
};

export const SelectTextValue: Story = {
	name: "Выбор текста вместо кода",
	render: () => (
		<StatefulODataMultiSelect
			label="Дивизион по тексту"
			description="Сценарий segment.selectText: наружу возвращаются текстовые значения, а не коды."
			model={{ ...baseModel, codeKey: "ZDIV" }}
			segment={{ placeholder: "Дивизион", selectText: true }}
			initialValue={[storyValues.divisionText]}
		/>
	)
};

export const StaticDependency: Story = {
	name: "Зависимость от дивизиона",
	render: () => (
		<StatefulODataMultiSelect
			label="Филиал c зависимостью"
			description="Фильтрация филиалов по уже выбранному дивизиону через props.dependencies."
			model={{ ...baseModel, codeKey: "ZCFO1" }}
			segment={{ placeholder: "Филиал" }}
			dependencies={{ ZDIV: [storyValues.division] }}
			initialValue={[storyValues.branch]}
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
		<StatefulODataMultiSelect
			label="Отдел сбыта CRM"
			description="Mock с задержкой ответа, чтобы проверить loading-state и skeleton."
			model={{ ...baseModel, codeKey: "ZCSLS_OFF" }}
			segment={{ placeholder: "Отдел сбыта CRM" }}
		/>
	)
};

export const MetadataError: Story = {
	name: "Ошибка metadata",
	parameters: {
		odataMockMode: "metadataError"
	},
	render: () => (
		<StatefulODataMultiSelect
			label="Дивизион"
			description="Сервис возвращает ошибку metadata. Полезно для проверки поведения хука useODataEntity."
			model={{ ...baseModel, codeKey: "ZDIV" }}
			segment={{ placeholder: "Дивизион" }}
		/>
	)
};

export const CollectionError: Story = {
	name: "Ошибка коллекции",
	parameters: {
		odataMockMode: "collectionError"
	},
	render: () => (
		<StatefulODataMultiSelect
			label="Группа менеджеров"
			description="Metadata доступна, но загрузка коллекции завершается ошибкой."
			model={{ ...baseModel, codeKey: "ZBPMNGRRP" }}
			segment={{ placeholder: "Группа менеджеров" }}
		/>
	)
};
