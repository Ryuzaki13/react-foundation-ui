import { useState } from "react";

import { TreeMultiSelect } from "../TreeMultiSelect";
import { TreeMultiSelectOptionsLayout, TreeMultiSelectValue, TreeSelectNode } from "../types";

import { demoTreeNodes } from "./treeStoryFixtures";

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Повторяет объём справочника ZDIV, при котором popup должен пересчитать
 * многоколоночную геометрию и рассмотреть боковые стороны viewport.
 */
const rightEdgeTreeNodes: TreeSelectNode[] = Array.from({ length: 66 }, (_, index) => {
	const sequence = String(index + 1).padStart(2, "0");
	const code = `D${sequence}`;

	return {
		id: `DIVISION:${code}`,
		codeKey: "DIVISION",
		value: code,
		label: `Дивизион ${sequence}`,
		code,
		searchText: `${code} Дивизион ${sequence}`
	};
});

function StatefulTreeMultiSelect({
	initialValue = {},
	label = "TreeMultiSelect",
	description,
	optionsLayout = "tree",
	nodes = demoTreeNodes
}: {
	initialValue?: TreeMultiSelectValue;
	label?: string;
	description?: string;
	optionsLayout?: TreeMultiSelectOptionsLayout;
	nodes?: readonly TreeSelectNode[];
}) {
	const [value, setValue] = useState<TreeMultiSelectValue>(initialValue);

	return (
		<div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
			<TreeMultiSelect
				label={label}
				description={description}
				nodes={nodes}
				value={value}
				onChange={setValue}
				optionsLayout={optionsLayout}
			/>
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
	}
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

export const BalancedColumns: Story = {
	render: () => (
		<StatefulTreeMultiSelect
			label="Все уровни в столбцах"
			description="Popover подбирает число столбцов по количеству опций и доступному viewport."
			optionsLayout="columns"
			initialValue={{ BRANCH: ["B0101"] }}
		/>
	)
};

export const RightEdgeColumns: Story = {
	render: () => (
		<div style={{ display: "flex", minHeight: "calc(100vh - 32px)", alignItems: "center", justifyContent: "flex-end" }}>
			<div style={{ width: 260 }}>
				<StatefulTreeMultiSelect
					label="Контрол у правой границы"
					description="Popover для 66 опций должен сравнить вертикальные и горизонтальные стороны и остаться внутри viewport."
					optionsLayout="columns"
					nodes={rightEdgeTreeNodes}
				/>
			</div>
		</div>
	)
};
