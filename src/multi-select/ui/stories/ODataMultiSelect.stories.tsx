import { type ComponentProps } from "react";

import { flattenODataDependentServices } from "@ryuzaki13/react-foundation-api/odata";

import { createControlledStoryRender, type StoryArgsUpdater } from "../../../development/storybook/createControlledStoryRender";
import { useODataDependentSelection } from "../../../odata-dependent";
import {
	baseModel,
	baseOData,
	baseSegment,
	installODataStoryFetchMock,
	odataStoryOData,
	storyValues,
	treeSegments,
	withODataMetadataErrorStoryBoundary,
	withODataStoryQueryClient
} from "../../../select/stories/odataStoryFixtures";
import { ODataDependentSegmentMultiSelect } from "../ODataDependentSegmentMultiSelect";
import { ODataMultiSelect } from "../ODataMultiSelect";

import type { Meta, StoryObj } from "@storybook/react-vite";

type ODataMultiSelectStoryArgs = ComponentProps<typeof ODataMultiSelect>;

const linkedSegmentItems = flattenODataDependentServices([
	{
		odata: baseOData,
		segments: treeSegments,
		model: baseModel
	}
]);
const linkedSegmentOrder = linkedSegmentItems.map((item) => item.id);

function ODataMultiSelectStoryCanvas({
	args,
	updateArgs
}: {
	args: ODataMultiSelectStoryArgs;
	updateArgs: StoryArgsUpdater<ODataMultiSelectStoryArgs>;
}) {
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

const renderODataMultiSelectStory = createControlledStoryRender<ODataMultiSelectStoryArgs>((args, updateArgs) => (
	<ODataMultiSelectStoryCanvas args={args} updateArgs={updateArgs} />
));

function LinkedFiltersDemo() {
	const selection = useODataDependentSelection({
		selectionMode: "sequential",
		segmentOrder: linkedSegmentOrder
	});

	return (
		<div style={{ display: "grid", gap: 16, maxWidth: 720 }}>
			{linkedSegmentItems.map((item, index) => (
				<ODataDependentSegmentMultiSelect
					key={item.id}
					item={item}
					values={selection.values}
					onChange={selection.updateValues}
					selectionMode="sequential"
					segmentOrder={linkedSegmentOrder}
					label={item.segment.placeholder}
					description={
						index === 0 ? "Первый уровень доступен сразу." : "Уровень включается после заполнения всего предыдущего пути."
					}
					width={30}
				/>
			))}
			<div style={{ display: "grid", gap: 4, fontSize: "var(--font-size-sm)", color: "var(--content-1)" }}>
				<div>Общий снимок: {JSON.stringify(selection.values)}</div>
			</div>
		</div>
	);
}

const meta = {
	title: "UI/ODataMultiSelect",
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
	render: renderODataMultiSelectStory,
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
	render: renderODataMultiSelectStory,
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
	render: renderODataMultiSelectStory,
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
	render: renderODataMultiSelectStory,
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
	render: renderODataMultiSelectStory,
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
	decorators: [withODataMetadataErrorStoryBoundary],
	parameters: {
		odataMockMode: "metadataError"
	},
	render: renderODataMultiSelectStory,
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
	render: renderODataMultiSelectStory,
	args: {
		odata: odataStoryOData.collectionError,
		label: "Ответственный",
		description: "Transport возвращает 500, а текущий API-контракт безопасно показывает пустой список.",
		model: { ...baseModel, codeKey: "OWNER" },
		segment: { placeholder: "Ответственный" }
	}
};
