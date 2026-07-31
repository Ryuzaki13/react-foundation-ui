import { useState } from "react";

import { baseOData, storyValues, treeSegments, withMockedOData } from "../../select/stories/odataStoryFixtures";
import { ODataTreeMultiSelect } from "../ODataTreeMultiSelect";
import { TreeMultiSelectOptionsLayout, TreeMultiSelectValue } from "../types";

import type { ODataCollectionConfig, ODataDependentBaseProps } from "@ryuzaki13/react-foundation-api/odata";
import type { Meta, StoryObj } from "@storybook/react-vite";

const largeRootGroupSegments = {
	REGION: treeSegments.REGION,
	OWNER: treeSegments.OWNER
} satisfies ODataDependentBaseProps["segments"];

function StatefulODataTreeMultiSelect({
	initialValue = {},
	odata = baseOData,
	segments = treeSegments,
	label = "ODataTreeMultiSelect",
	description,
	optionsLayout = "tree",
	defaultExpandedCodeKeys
}: {
	initialValue?: TreeMultiSelectValue;
	odata?: ODataCollectionConfig;
	segments?: ODataDependentBaseProps["segments"];
	label?: string;
	description?: string;
	optionsLayout?: TreeMultiSelectOptionsLayout;
	defaultExpandedCodeKeys?: readonly string[];
}) {
	const [value, setValue] = useState<TreeMultiSelectValue>(initialValue);

	return (
		<div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
			<ODataTreeMultiSelect
				label={label}
				description={description}
				odata={odata}
				segments={segments}
				value={value}
				onChange={setValue}
				optionsLayout={optionsLayout}
				defaultExpandedCodeKeys={defaultExpandedCodeKeys}
			/>
			<div style={{ fontSize: "var(--font-size-sm)", color: "var(--content-1)" }}>Текущее значение: {JSON.stringify(value)}</div>
		</div>
	);
}

const meta = {
	title: "Shared/UI/ODataTreeMultiSelect",
	component: ODataTreeMultiSelect,
	decorators: [withMockedOData],
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
		segments: { control: false },
		value: { control: false },
		onChange: { control: false }
	}
} satisfies Meta<typeof ODataTreeMultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	render: () => <StatefulODataTreeMultiSelect initialValue={{ OWNER: [storyValues.owner] }} />
};

export const ParentCompression: Story = {
	render: () => (
		<StatefulODataTreeMultiSelect
			label="Компрессия subtree"
			description="Пример, когда наружу уходит узел верхнего уровня вместо полного списка потомков."
			initialValue={{ REGION: [storyValues.region] }}
		/>
	)
};

export const MixedSelection: Story = {
	render: () => (
		<StatefulODataTreeMultiSelect
			label="Смешанный выбор"
			description="Смешанный frontier по соседним уровням в OData-дереве."
			initialValue={{ BRANCH: [storyValues.branch], OWNER: [storyValues.ownerAlt] }}
		/>
	)
};

export const BalancedColumns: Story = {
	render: () => (
		<StatefulODataTreeMultiSelect
			label="OData tree в столбцах"
			description="Режим columns открывает все уровни независимо от пустой настройки defaultExpandedCodeKeys."
			optionsLayout="columns"
			defaultExpandedCodeKeys={[]}
			initialValue={{ BRANCH: [storyValues.branch] }}
		/>
	)
};

export const LargeRootGroupsColumns: Story = {
	render: () => (
		<StatefulODataTreeMultiSelect
			label="Крупные OData-группы"
			description="Сокращённая цепочка REGION → OWNER создаёт несколько root-групп с тремя и более direct children для проверки group-aware packing."
			optionsLayout="columns"
			segments={largeRootGroupSegments}
		/>
	)
};

export const LoadingState: Story = {
	parameters: {
		odataMockMode: "loading"
	},
	render: () => <StatefulODataTreeMultiSelect description="Сценарий загрузки дерева." />
};

export const ErrorState: Story = {
	parameters: {
		odataMockMode: "collectionError"
	},
	render: () => <StatefulODataTreeMultiSelect description="Сценарий ошибки загрузки дерева." />
};
