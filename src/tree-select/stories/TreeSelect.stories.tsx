import { useArgs } from "storybook/preview-api";

import { TreeSelect, type TreeSelectProps } from "../TreeSelect";

import { demoTreeNodes } from "./treeStoryFixtures";

import type { Meta, StoryObj } from "@storybook/react-vite";

function TreeSelectStoryCanvas(args: TreeSelectProps) {
	const [, updateArgs] = useArgs<TreeSelectProps>();

	return (
		<div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
			<TreeSelect
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

const meta = {
	title: "Shared/UI/TreeSelect",
	component: TreeSelect,
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	args: {
		label: "Выбор узла",
		description: "Single-select поверх дерева. Можно выбрать любой узел.",
		nodes: demoTreeNodes,
		value: undefined,
		onChange: () => {}
	},
	argTypes: {
		label: { description: "Заголовок поля.", control: "text" },
		description: { description: "Описание под полем.", control: "text" },
		placeholder: { description: "Текст без выбранного узла.", control: "text" },
		nodes: { description: "Дерево доступных узлов.", control: false },
		value: { description: "Выбранный узел в формате codeKey/value.", control: false },
		onChange: { description: "Вызывается при выборе узла.", control: false },
		query: { description: "Контролируемый текст поиска.", control: "text" },
		defaultQuery: { description: "Начальный текст поиска в uncontrolled-режиме.", control: "text" },
		onQuery: { description: "Вызывается при вводе поисковой строки.", control: false },
		isLoading: { description: "Показывает загрузку дерева.", control: "boolean" },
		error: { description: "Текст ошибки загрузки.", control: "text" },
		clearable: { description: "Показывает действие очистки выбора.", control: "boolean" },
		defaultExpandedCodeKeys: { description: "Ключи уровней, раскрываемых при открытии.", control: false },
		disabled: { description: "Блокирует взаимодействие с полем.", control: "boolean" },
		size: { description: "Размер поля и подписей.", control: "select", options: ["xs", "sm", "md", "lg", "xl"] }
	}
} satisfies Meta<typeof TreeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	render: function Render(args) {
		return <TreeSelectStoryCanvas {...args} />;
	},
	args: {
		value: { codeKey: "BRANCH", value: "B0101" }
	}
};

export const SelectParent: Story = {
	render: function Render(args) {
		return <TreeSelectStoryCanvas {...args} />;
	},
	args: {
		label: "Выбор родителя",
		description: "Проверка single-select сценария, когда выбирается не leaf, а промежуточный узел.",
		value: { codeKey: "REGION", value: "R01" }
	}
};

export const FirstLevelExpanded: Story = {
	render: function Render(args) {
		return <TreeSelectStoryCanvas {...args} />;
	},
	args: {
		label: "Раскрыт первый уровень",
		description: "Все узлы уровня REGION раскрыты до первого ручного действия пользователя.",
		defaultExpandedCodeKeys: ["REGION"]
	}
};

export const Empty: Story = {
	render: function Render(args) {
		return <TreeSelectStoryCanvas {...args} />;
	},
	args: {
		nodes: [],
		description: "Состояние без доступных узлов."
	}
};
