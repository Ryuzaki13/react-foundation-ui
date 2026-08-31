import { createControlledStoryRender } from "../../development/storybook/createControlledStoryRender";
import { TreeMultiSelect, type TreeMultiSelectProps } from "../TreeMultiSelect";
import { TreeSelectNode } from "../types";

import { demoTreeNodes, orphanProtectionTreeNodes } from "./treeStoryFixtures";

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

function TreeMultiSelectStoryCanvas({
	args,
	updateArgs
}: {
	args: TreeMultiSelectProps;
	updateArgs: (newArgs: Partial<TreeMultiSelectProps>) => void;
}) {
	return (
		<div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
			<TreeMultiSelect
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

const renderTreeMultiSelectStory = createControlledStoryRender<TreeMultiSelectProps>((args, updateArgs) => (
	<TreeMultiSelectStoryCanvas args={args} updateArgs={updateArgs} />
));

const renderRightEdgeTreeMultiSelectStory = createControlledStoryRender<TreeMultiSelectProps>((args, updateArgs) => (
	<div style={{ display: "flex", minHeight: "calc(100vh - 32px)", alignItems: "center", justifyContent: "flex-end" }}>
		<div style={{ width: 260 }}>
			<TreeMultiSelectStoryCanvas args={args} updateArgs={updateArgs} />
		</div>
	</div>
));

const meta = {
	title: "UI/TreeMultiSelect",
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
		label: { description: "Заголовок поля.", control: "text" },
		description: { description: "Описание под полем.", control: "text" },
		placeholder: { description: "Текст без выбранных узлов.", control: "text" },
		nodes: { description: "Дерево доступных узлов.", control: false },
		value: { description: "Контролируемое отображение выбранных узлов по codeKey.", control: false },
		onChange: { description: "Вызывается при commit набора узлов.", control: false },
		query: { description: "Контролируемый текст поиска.", control: "text" },
		defaultQuery: { description: "Начальный текст поиска в uncontrolled-режиме.", control: "text" },
		onQuery: { description: "Вызывается при вводе поисковой строки.", control: false },
		isLoading: { description: "Показывает загрузку дерева.", control: "boolean" },
		error: { description: "Текст ошибки загрузки.", control: "text" },
		optionsLayout: {
			description: "Способ показа: дерево или адаптивные колонки.",
			control: "inline-radio",
			options: ["tree", "columns"]
		},
		defaultExpandedCodeKeys: { description: "Ключи уровней, раскрываемых при открытии.", control: false },
		disabled: { description: "Блокирует взаимодействие с полем.", control: "boolean" },
		size: { description: "Размер поля и подписей.", control: "select", options: ["xs", "sm", "md", "lg", "xl"] }
	}
} satisfies Meta<typeof TreeMultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	render: renderTreeMultiSelectStory,
	args: {
		value: { OWNER: ["P0001"] }
	}
};

export const ParentCompression: Story = {
	render: renderTreeMultiSelectStory,
	args: {
		label: "Компрессия parent",
		description: "Когда выбран весь subtree, наружу может уйти только родительский узел.",
		value: { REGION: ["R01"] }
	}
};

export const MixedSelection: Story = {
	render: renderTreeMultiSelectStory,
	args: {
		label: "Смешанный выбор",
		description: "Пример mixed frontier по соседним уровням.",
		value: { BRANCH: ["B0101"], OWNER: ["P0004"] }
	}
};

export const FirstTwoLevelsExpanded: Story = {
	render: renderTreeMultiSelectStory,
	args: {
		label: "Раскрыты два уровня",
		description: "Уровни REGION и BRANCH раскрыты по умолчанию, остальные уровни остаются закрытыми.",
		defaultExpandedCodeKeys: ["REGION", "BRANCH"]
	}
};

export const BalancedColumns: Story = {
	render: renderTreeMultiSelectStory,
	args: {
		label: "Все уровни в столбцах",
		description: "Popover подбирает число столбцов по количеству опций и доступному viewport.",
		optionsLayout: "columns",
		value: { BRANCH: ["B0101"] }
	}
};

export const OrphanProtectionColumns: Story = {
	render: renderTreeMultiSelectStory,
	args: {
		label: "Защита начала большой группы",
		description: "Начало группы остаётся в текущем столбце при трёх свободных строках; при одной или двух переносится в новый.",
		optionsLayout: "columns",
		nodes: orphanProtectionTreeNodes
	}
};

export const RightEdgeColumns: Story = {
	render: renderRightEdgeTreeMultiSelectStory,
	args: {
		label: "Контрол у правой границы",
		description: "Popover для 66 опций должен сравнить вертикальные и горизонтальные стороны и остаться внутри viewport.",
		optionsLayout: "columns",
		nodes: rightEdgeTreeNodes
	}
};
