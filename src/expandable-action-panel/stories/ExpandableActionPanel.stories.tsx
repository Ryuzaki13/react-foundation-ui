import { useState } from "react";

import { CheckIcon, RefreshCwIcon, SearchIcon, Settings2Icon } from "lucide-react";
import { fn } from "storybook/test";

import { Button } from "../../button";
import { CheckBox } from "../../check-box";
import { InputText } from "../../input";
import { Select } from "../../select";
import { ExpandableActionPanel } from "../ExpandableActionPanel";
import { LabeledExpandableActionPanel } from "../LabeledExpandableActionPanel";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/ExpandableActionPanel",
	component: LabeledExpandableActionPanel,
	args: {
		label: "Длинное название строки с результатами расчёта и параметрами отбора",
		labelMinWidth: "18em",
		defaultOpen: false,
		onOpenChange: fn()
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		label: {
			description: "Текст или ReactNode слева от панели.",
			control: "text"
		},
		labelMinWidth: {
			description: "Минимальная ширина `flexEllipsis`-текста.",
			control: "text"
		},
		defaultOpen: {
			description: "Начальное состояние раскрытия в uncontrolled-режиме.",
			control: "boolean"
		},
		open: {
			description: "Контролируемое состояние раскрытия.",
			control: "boolean"
		},
		onOpenChange: {
			description: "Вызывается при раскрытии или сворачивании панели.",
			control: false
		}
	}
} satisfies Meta<typeof LabeledExpandableActionPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = ["Все", "Активные", "Архив"] as const;

function DemoControls() {
	const [query, setQuery] = useState("");
	const [checked, setChecked] = useState(false);
	const [selected, setSelected] = useState<(typeof options)[number] | undefined>("Все");

	return (
		<>
			<div style={{ width: "calc(14em + var(--width-add))" }}>
				<InputText placeholder="Поиск" value={query} onChange={setQuery} endAdornment={<SearchIcon />} />
			</div>
			<div style={{ width: "calc(12em + var(--width-add))" }}>
				<Select
					placeholder="Статус"
					options={options}
					value={selected}
					onChange={setSelected}
					getOptionKey={(option) => option}
					getOptionLabel={(option) => option}
				/>
			</div>
			<CheckBox placeholder="Только мои" value={checked} onChange={setChecked} noWrap />
			<Button icon={<RefreshCwIcon />} title="Обновить" />
			<Button icon={<Settings2Icon />} title="Настроить" />
			<Button icon={<CheckIcon />} tone="success" appearance="solid">
				Применить
			</Button>
		</>
	);
}

export const Labeled: Story = {
	render: (args) => (
		<div style={{ width: "min(100%, 920px)" }}>
			<LabeledExpandableActionPanel {...args}>
				<DemoControls />
			</LabeledExpandableActionPanel>
		</div>
	)
};

export const BasePanel: Story = {
	render: () => (
		<div style={{ width: "min(100%, 720px)", display: "flex", justifyContent: "flex-end" }}>
			<ExpandableActionPanel defaultOpen>
				<DemoControls />
			</ExpandableActionPanel>
		</div>
	)
};
