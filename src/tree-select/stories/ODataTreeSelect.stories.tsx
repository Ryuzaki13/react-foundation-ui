import { useState } from "react";

import { baseOData, storyValues, treeSegments, withMockedOData } from "../../select/stories/odataStoryFixtures";
import { ODataTreeSelect } from "../ODataTreeSelect";
import { TreeSelectValue } from "../types";

import type { ODataCollectionConfig, ODataDependentBaseProps } from "@ryuzaki13/react-foundation-api/odata";
import type { Meta, StoryObj } from "@storybook/react-vite";

function StatefulODataTreeSelect({
	initialValue,
	odata = baseOData,
	segments = treeSegments,
	label = "ODataTreeSelect",
	description
}: {
	initialValue?: TreeSelectValue;
	odata?: ODataCollectionConfig;
	segments?: ODataDependentBaseProps["segments"];
	label?: string;
	description?: string;
}) {
	const [value, setValue] = useState<TreeSelectValue | undefined>(initialValue);

	return (
		<div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
			<ODataTreeSelect label={label} description={description} odata={odata} segments={segments} value={value} onChange={setValue} />
			<div style={{ fontSize: "var(--font-size-sm)", color: "var(--content-1)" }}>
				Текущее значение: {value ? `${value.codeKey}=${value.value}` : "пусто"}
			</div>
		</div>
	);
}

const meta = {
	title: "Shared/UI/ODataTreeSelect",
	component: ODataTreeSelect,
	decorators: [withMockedOData],
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
		segments: { control: false },
		value: { control: false },
		onChange: { control: false }
	},
	tags: ["autodocs"]
} satisfies Meta<typeof ODataTreeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	render: () => <StatefulODataTreeSelect initialValue={{ codeKey: "OWNER", value: storyValues.owner }} />
};

export const SelectParent: Story = {
	render: () => (
		<StatefulODataTreeSelect
			label="Выбор родителя"
			description="Проверка выбора узла верхнего уровня из OData-дерева."
			initialValue={{ codeKey: "REGION", value: storyValues.region }}
		/>
	)
};

export const LoadingState: Story = {
	parameters: {
		odataMockMode: "loading"
	},
	render: () => <StatefulODataTreeSelect description="Сценарий загрузки дерева." />
};

export const ErrorState: Story = {
	parameters: {
		odataMockMode: "collectionError"
	},
	render: () => <StatefulODataTreeSelect description="Сценарий ошибки загрузки дерева." />
};
