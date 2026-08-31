import { createControlledStoryRender, type StoryArgsUpdater } from "../../development/storybook/createControlledStoryRender";
import {
	baseOData,
	installODataStoryFetchMock,
	odataStoryOData,
	storyValues,
	treeSegments,
	withODataMetadataErrorStoryBoundary,
	withODataStoryQueryClient
} from "../../select/stories/odataStoryFixtures";
import { ODataTreeSelect, type ODataTreeSelectProps } from "../ODataTreeSelect";

import type { Meta, StoryObj } from "@storybook/react-vite";

function ODataTreeSelectStoryCanvas({
	args,
	updateArgs
}: {
	args: ODataTreeSelectProps;
	updateArgs: StoryArgsUpdater<ODataTreeSelectProps>;
}) {
	return (
		<div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
			<ODataTreeSelect
				{...args}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
			/>
			<div style={{ fontSize: "var(--font-size-sm)", color: "var(--content-1)" }}>
				Текущее значение: {args.value ? `${args.value.codeKey}=${args.value.value}` : "пусто"}
			</div>
		</div>
	);
}

const renderODataTreeSelectStory = createControlledStoryRender<ODataTreeSelectProps>((args, updateArgs) => (
	<ODataTreeSelectStoryCanvas args={args} updateArgs={updateArgs} />
));

const meta = {
	title: "UI/ODataTreeSelect",
	component: ODataTreeSelect,
	decorators: [withODataStoryQueryClient],
	beforeEach: installODataStoryFetchMock,
	parameters: {
		atomicCanvas: true,
		layout: "padded",
		odataMockMode: "success"
	},
	args: {
		label: "OData дерево",
		description: "Single-select поверх одной OData-цепочки.",
		odata: baseOData,
		segments: treeSegments,
		value: undefined,
		onChange: () => {}
	},
	argTypes: {
		label: { description: "Заголовок поля.", control: "text" },
		description: { description: "Описание под полем.", control: "text" },
		placeholder: { description: "Текст без выбранного узла.", control: "text" },
		odata: { description: "Конфигурация OData-источника.", control: false },
		segments: { description: "Конфигурация уровней OData-дерева.", control: false },
		model: { description: "Опциональная модель OData-коллекции.", control: false },
		value: { description: "Выбранный узел в формате codeKey/value.", control: false },
		onChange: { description: "Вызывается при выборе узла.", control: false },
		query: { description: "Контролируемый текст поиска.", control: "text" },
		defaultQuery: { description: "Начальный текст поиска в uncontrolled-режиме.", control: "text" },
		onQuery: { description: "Вызывается при вводе поисковой строки.", control: false },
		clearable: { description: "Показывает действие очистки выбора.", control: "boolean" },
		defaultExpandedCodeKeys: { description: "Ключи уровней, раскрываемых после загрузки.", control: false },
		disabled: { description: "Блокирует взаимодействие с полем.", control: "boolean" },
		size: { description: "Размер поля и подписей.", control: "select", options: ["xs", "sm", "md", "lg", "xl"] }
	}
} satisfies Meta<typeof ODataTreeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	render: renderODataTreeSelectStory,
	args: {
		value: { codeKey: "OWNER", value: storyValues.owner }
	}
};

export const SelectParent: Story = {
	render: renderODataTreeSelectStory,
	args: {
		label: "Выбор родителя",
		description: "Проверка выбора узла верхнего уровня из OData-дерева.",
		value: { codeKey: "REGION", value: storyValues.region }
	}
};

export const OnlySecondLevelExpanded: Story = {
	render: renderODataTreeSelectStory,
	args: {
		label: "Раскрывается только второй уровень",
		description: "REGION остаётся закрытым. После его ручного открытия узлы BRANCH уже раскрыты по умолчанию.",
		defaultExpandedCodeKeys: ["BRANCH"]
	}
};

export const LoadingState: Story = {
	parameters: {
		odataMockMode: "loading"
	},
	render: renderODataTreeSelectStory,
	args: {
		odata: odataStoryOData.loading,
		description: "Сценарий загрузки дерева."
	}
};

export const ErrorState: Story = {
	decorators: [withODataMetadataErrorStoryBoundary],
	parameters: {
		odataMockMode: "metadataError"
	},
	render: renderODataTreeSelectStory,
	args: {
		odata: odataStoryOData.metadataError,
		description: "Сценарий ошибки metadata дерева."
	}
};
