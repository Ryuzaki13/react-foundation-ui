import { type ComponentProps } from "react";

import { flattenODataDependentServices } from "@ryuzaki13/react-foundation-api/odata";

import { createControlledStoryRender, type StoryArgsUpdater } from "../../development/storybook/createControlledStoryRender";
import { useODataDependentSelection } from "../../odata-dependent";
import { ODataDependentSegmentSelect } from "../ODataDependentSegmentSelect";
import { ODataSelect } from "../ODataSelect";

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
} from "./odataStoryFixtures";

import type { Meta, StoryObj } from "@storybook/react-vite";

type ODataSelectStoryArgs = ComponentProps<typeof ODataSelect>;

const linkedSegmentItems = flattenODataDependentServices([
	{
		odata: baseOData,
		segments: treeSegments,
		model: baseModel
	}
]);
const linkedSegmentOrder = linkedSegmentItems.map((item) => item.id);

function ODataSelectStoryCanvas({ args, updateArgs }: { args: ODataSelectStoryArgs; updateArgs: StoryArgsUpdater<ODataSelectStoryArgs> }) {
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

const renderODataSelectStory = createControlledStoryRender<ODataSelectStoryArgs>((args, updateArgs) => (
	<ODataSelectStoryCanvas args={args} updateArgs={updateArgs} />
));

export function LinkedFiltersDemo() {
	const selection = useODataDependentSelection({
		selectionMode: "sequential",
		segmentOrder: linkedSegmentOrder
	});

	return (
		<div style={{ display: "grid", gap: 16, maxWidth: 720 }}>
			{linkedSegmentItems.map((item, index) => (
				<ODataDependentSegmentSelect
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
					clearable
				/>
			))}
			<div style={{ display: "grid", gap: 4, fontSize: "var(--font-size-sm)", color: "var(--content-1)" }}>
				<div>Общий снимок: {JSON.stringify(selection.values)}</div>
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
	render: renderODataSelectStory,
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
	render: renderODataSelectStory,
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
	render: renderODataSelectStory,
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
	render: renderODataSelectStory,
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
	render: renderODataSelectStory,
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
	decorators: [withODataMetadataErrorStoryBoundary],
	parameters: {
		odataMockMode: "metadataError"
	},
	render: renderODataSelectStory,
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
	render: renderODataSelectStory,
	args: {
		odata: odataStoryOData.collectionError,
		label: "Ответственный",
		description: "Transport возвращает 500, а текущий API-контракт безопасно показывает пустой список.",
		model: { ...baseModel, codeKey: "OWNER" },
		segment: { placeholder: "Ответственный" }
	}
};
