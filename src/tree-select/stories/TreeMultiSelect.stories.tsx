import { useState } from "react";

import { TreeMultiSelect } from "../TreeMultiSelect";
import { TreeMultiSelectValue } from "../types";

import { demoTreeNodes } from "./treeStoryFixtures";

import type { Meta, StoryObj } from "@storybook/react-vite";

function StatefulTreeMultiSelect({
	initialValue = {},
	label = "TreeMultiSelect",
	description
}: {
	initialValue?: TreeMultiSelectValue;
	label?: string;
	description?: string;
}) {
	const [value, setValue] = useState<TreeMultiSelectValue>(initialValue);

	return (
		<div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
			<TreeMultiSelect label={label} description={description} nodes={demoTreeNodes} value={value} onChange={setValue} />
			<div style={{ fontSize: "var(--font-size-sm)", color: "var(--content-1)" }}>Текущее значение: {JSON.stringify(value)}</div>
		</div>
	);
}

const meta = {
	title: "Shared/UI/TreeMultiSelect",
	component: TreeMultiSelect,
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	args: {
		label: "Выбор узлов",
		description: "Мультивыбор с канонизацией subtree в ближайший parent.",
		nodes: demoTreeNodes,
		value: {},
		onChange: () => {}
	},
	argTypes: {
		nodes: { control: false },
		value: { control: false },
		onChange: { control: false }
	},
	tags: ["autodocs"]
} satisfies Meta<typeof TreeMultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	render: () => <StatefulTreeMultiSelect initialValue={{ OWNER: ["P0001"] }} />
};

export const ParentCompression: Story = {
	render: () => (
		<StatefulTreeMultiSelect
			label="Компрессия parent"
			description="Когда выбран весь subtree, наружу может уйти только родительский узел."
			initialValue={{ REGION: ["R01"] }}
		/>
	)
};

export const MixedSelection: Story = {
	render: () => (
		<StatefulTreeMultiSelect
			label="Смешанный выбор"
			description="Пример mixed frontier по соседним уровням."
			initialValue={{ BRANCH: ["B0101"], OWNER: ["P0004"] }}
		/>
	)
};
