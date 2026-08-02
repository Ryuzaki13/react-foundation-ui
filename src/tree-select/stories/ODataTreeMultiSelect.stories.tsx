import { useArgs } from "storybook/preview-api";

import {
	baseOData,
	installODataStoryFetchMock,
	odataStoryOData,
	storyValues,
	treeSegments,
	withODataStoryQueryClient
} from "../../select/stories/odataStoryFixtures";
import { ODataTreeMultiSelect, type ODataTreeMultiSelectProps } from "../ODataTreeMultiSelect";

import type { ODataDependentBaseProps } from "@ryuzaki13/react-foundation-api/odata";
import type { Meta, StoryObj } from "@storybook/react-vite";

const largeRootGroupSegments = {
	REGION: treeSegments.REGION,
	OWNER: treeSegments.OWNER
} satisfies ODataDependentBaseProps["segments"];

function ODataTreeMultiSelectStoryCanvas(args: ODataTreeMultiSelectProps) {
	const [, updateArgs] = useArgs<ODataTreeMultiSelectProps>();

	return (
		<div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
			<ODataTreeMultiSelect
				{...args}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
			/>
			<div style={{ fontSize: "var(--font-size-sm)", color: "var(--content-1)" }}>Текущее значение: {JSON.stringify(args.value)}</div>
		</div>
	);
}

const meta = {
	title: "Shared/UI/ODataTreeMultiSelect",
	component: ODataTreeMultiSelect,
	decorators: [withODataStoryQueryClient],
	beforeEach: installODataStoryFetchMock,
	parameters: {
		atomicCanvas: true,
		layout: "padded",
		odataMockMode: "success"
	},
	args: {
		label: "OData дерево",
		description: "Multi-select поверх одной OData-цепочки.",
		odata: baseOData,
		segments: treeSegments,
		value: {},
		onChange: () => {}
	},
	argTypes: {
		label: { description: "Заголовок поля.", control: "text" },
		description: { description: "Описание под полем.", control: "text" },
		placeholder: { description: "Текст без выбранных узлов.", control: "text" },
		odata: { description: "Конфигурация OData-источника.", control: false },
		segments: { description: "Конфигурация уровней OData-дерева.", control: false },
		model: { description: "Опциональная модель OData-коллекции.", control: false },
		value: { description: "Контролируемое отображение выбранных узлов по codeKey.", control: false },
		onChange: { description: "Вызывается при commit набора узлов.", control: false },
		query: { description: "Контролируемый текст поиска.", control: "text" },
		defaultQuery: { description: "Начальный текст поиска в uncontrolled-режиме.", control: "text" },
		onQuery: { description: "Вызывается при вводе поисковой строки.", control: false },
		optionsLayout: {
			description: "Способ показа: дерево или адаптивные колонки.",
			control: "inline-radio",
			options: ["tree", "columns"]
		},
		defaultExpandedCodeKeys: { description: "Ключи уровней, раскрываемых после загрузки.", control: false },
		disabled: { description: "Блокирует взаимодействие с полем.", control: "boolean" },
		size: { description: "Размер поля и подписей.", control: "select", options: ["xs", "sm", "md", "lg", "xl"] }
	}
} satisfies Meta<typeof ODataTreeMultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	render: function Render(args) {
		return <ODataTreeMultiSelectStoryCanvas {...args} />;
	},
	args: {
		value: { OWNER: [storyValues.owner] }
	}
};

export const ParentCompression: Story = {
	render: function Render(args) {
		return <ODataTreeMultiSelectStoryCanvas {...args} />;
	},
	args: {
		label: "Компрессия subtree",
		description: "Пример, когда наружу уходит узел верхнего уровня вместо полного списка потомков.",
		value: { REGION: [storyValues.region] }
	}
};

export const MixedSelection: Story = {
	render: function Render(args) {
		return <ODataTreeMultiSelectStoryCanvas {...args} />;
	},
	args: {
		label: "Смешанный выбор",
		description: "Смешанный frontier по соседним уровням в OData-дереве.",
		value: { BRANCH: [storyValues.branch], OWNER: [storyValues.ownerAlt] }
	}
};

export const BalancedColumns: Story = {
	render: function Render(args) {
		return <ODataTreeMultiSelectStoryCanvas {...args} />;
	},
	args: {
		label: "OData tree в столбцах",
		description: "Режим columns открывает все уровни независимо от пустой настройки defaultExpandedCodeKeys.",
		optionsLayout: "columns",
		defaultExpandedCodeKeys: [],
		value: { BRANCH: [storyValues.branch] }
	}
};

export const LargeRootGroupsColumns: Story = {
	render: function Render(args) {
		return <ODataTreeMultiSelectStoryCanvas {...args} />;
	},
	args: {
		label: "Крупные OData-группы",
		description: "Сокращённая цепочка REGION → OWNER создаёт несколько root-групп для проверки порога из трёх строк.",
		optionsLayout: "columns",
		segments: largeRootGroupSegments
	}
};

export const LoadingState: Story = {
	parameters: {
		odataMockMode: "loading"
	},
	render: function Render(args) {
		return <ODataTreeMultiSelectStoryCanvas {...args} />;
	},
	args: {
		odata: odataStoryOData.loading,
		description: "Сценарий загрузки дерева."
	}
};

export const ErrorState: Story = {
	parameters: {
		odataMockMode: "metadataError"
	},
	render: function Render(args) {
		return <ODataTreeMultiSelectStoryCanvas {...args} />;
	},
	args: {
		odata: odataStoryOData.metadataError,
		description: "Сценарий ошибки metadata дерева."
	}
};
