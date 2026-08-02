import { useState } from "react";

import { CheckIcon, RefreshCwIcon, SearchIcon, Settings2Icon } from "lucide-react";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { Button } from "../../button";
import { CheckBox } from "../../check-box";
import { InputText } from "../../input";
import { Select } from "../../select";
import { ExpandableActionPanel, type ExpandableActionPanelProps } from "../ExpandableActionPanel";
import { LabeledExpandableActionPanel, type LabeledExpandableActionPanelProps } from "../LabeledExpandableActionPanel";

import type { Meta, StoryObj } from "@storybook/react-vite";

type LabeledPanelStoryArgs = LabeledExpandableActionPanelProps;
type BasePanelStoryArgs = ExpandableActionPanelProps;

const meta = {
	title: "Shared/UI/ExpandableActionPanel",
	component: LabeledExpandableActionPanel,
	args: {
		label: "Длинное название строки с результатами расчёта и параметрами отбора",
		labelMinWidth: "18em",
		open: false,
		defaultOpen: false,
		disabled: false,
		onOpenChange: fn<(open: boolean) => void>(),
		expandLabel: "Раскрыть панель действий влево",
		collapseLabel: "Свернуть панель действий",
		panelLabel: "Действия панели",
		smoothScroll: false,
		children: null
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
		labelClassName: {
			description: "Дополнительный CSS-класс области подписи.",
			control: "text"
		},
		labelStyle: {
			description: "Inline-стили области подписи.",
			control: "object"
		},
		panelClassName: {
			description: "Дополнительный CSS-класс внутренней ExpandableActionPanel.",
			control: "text"
		},
		contentClassName: {
			description: "Дополнительный CSS-класс раскрываемого контейнера действий.",
			control: "text"
		},
		toggleClassName: {
			description: "Дополнительный CSS-класс кнопки раскрытия.",
			control: "text"
		},
		open: {
			description: "Контролируемое состояние раскрытия.",
			control: "boolean"
		},
		defaultOpen: {
			description: "Начальное состояние раскрытия в uncontrolled-режиме.",
			control: "boolean"
		},
		disabled: {
			description: "Блокирует кнопку раскрытия.",
			control: "boolean"
		},
		onOpenChange: {
			description: "Вызывается при раскрытии или сворачивании панели.",
			control: false
		},
		expandLabel: {
			description: "Tooltip и доступное имя кнопки в закрытом состоянии.",
			control: "text"
		},
		collapseLabel: {
			description: "Tooltip и доступное имя кнопки в раскрытом состоянии.",
			control: "text"
		},
		panelLabel: {
			description: "Доступное имя раскрытой группы действий.",
			control: "text"
		},
		itemSelector: {
			description: "CSS-селектор элементов для пошаговой прокрутки.",
			control: "text"
		},
		scrollPadding: {
			description: "Отступ пошаговой прокрутки в пикселях.",
			control: { type: "number", min: 0, step: 1 }
		},
		smoothScroll: {
			description: "Включает плавную пошаговую прокрутку.",
			control: "boolean"
		},
		children: {
			description: "Набор действий внутри раскрываемой панели.",
			control: false
		}
	}
} satisfies Meta<typeof LabeledExpandableActionPanel>;

export default meta;
type LabeledStory = StoryObj<LabeledPanelStoryArgs>;
type BaseStory = StoryObj<BasePanelStoryArgs>;

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

function LabeledPanelStoryCanvas() {
	const [args, updateArgs] = useArgs<LabeledPanelStoryArgs>();

	return (
		<div style={{ width: "min(100%, 920px)" }}>
			<LabeledExpandableActionPanel
				{...args}
				open={args.open}
				onOpenChange={(open) => {
					args.onOpenChange?.(open);
					updateArgs({ open });
				}}>
				{args.children ?? <DemoControls />}
			</LabeledExpandableActionPanel>
		</div>
	);
}

function BasePanelStoryCanvas() {
	const [args, updateArgs] = useArgs<BasePanelStoryArgs>();

	return (
		<div style={{ width: "min(100%, 720px)", display: "flex", justifyContent: "flex-end" }}>
			<ExpandableActionPanel
				{...args}
				open={args.open}
				onOpenChange={(open) => {
					args.onOpenChange?.(open);
					updateArgs({ open });
				}}>
				{args.children ?? <DemoControls />}
			</ExpandableActionPanel>
		</div>
	);
}

export const Labeled: LabeledStory = {
	render: () => <LabeledPanelStoryCanvas />
};

export const BasePanel: BaseStory = {
	args: {
		open: true,
		panelLabel: "Действия панели"
	},
	render: () => <BasePanelStoryCanvas />
};
