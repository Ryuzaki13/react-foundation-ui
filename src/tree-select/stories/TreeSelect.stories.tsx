import { useState } from "react";

import { TreeSelect } from "../TreeSelect";
import { TreeSelectValue } from "../types";

import { demoTreeNodes } from "./treeStoryFixtures";

import type { Meta, StoryObj } from "@storybook/react-vite";

function StatefulTreeSelect({
	initialValue,
	label = "TreeSelect",
	description,
	defaultExpandedCodeKeys
}: {
	initialValue?: TreeSelectValue;
	label?: string;
	description?: string;
	defaultExpandedCodeKeys?: readonly string[];
}) {
	const [value, setValue] = useState<TreeSelectValue | undefined>(initialValue);

	return (
		<div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
			<TreeSelect
				label={label}
				description={description}
				nodes={demoTreeNodes}
				value={value}
				onChange={setValue}
				defaultExpandedCodeKeys={defaultExpandedCodeKeys}
			/>
			<div style={{ fontSize: "var(--font-size-sm)", color: "var(--content-1)" }}>
				Текущее значение: {value ? `${value.codeKey}=${value.value}` : "пусто"}
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
		nodes: { control: false },
		value: { control: false },
		onChange: { control: false }
	}
} satisfies Meta<typeof TreeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	render: () => <StatefulTreeSelect initialValue={{ codeKey: "BRANCH", value: "B0101" }} />
};

export const SelectParent: Story = {
	render: () => (
		<StatefulTreeSelect
			label="Выбор родителя"
			description="Проверка single-select сценария, когда выбирается не leaf, а промежуточный узел."
			initialValue={{ codeKey: "REGION", value: "R01" }}
		/>
	)
};

export const FirstLevelExpanded: Story = {
	render: () => (
		<StatefulTreeSelect
			label="Раскрыт первый уровень"
			description="Все узлы уровня REGION раскрыты до первого ручного действия пользователя."
			defaultExpandedCodeKeys={["REGION"]}
		/>
	)
};

export const Empty: Story = {
	args: {
		nodes: [],
		description: "Состояние без доступных узлов."
	}
};
