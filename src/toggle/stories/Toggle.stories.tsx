import { useState } from "react";

import { Toggle } from "../Toggle";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/Toggle",
	component: Toggle,
	args: {
		value: false,
		onChange: () => {}
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		label: {
			description: "Текст подписи переключателя.",
			control: "text"
		},
		description: {
			description: "Описание под переключателем.",
			control: "text"
		},
		value: {
			description: "Текущее значение переключателя.",
			control: "boolean"
		},
		onChange: {
			description: "Вызывается при изменении значения.",
			control: false
		},
		checkedText: {
			description: "Текст для включенного состояния.",
			control: "text"
		},
		uncheckedText: {
			description: "Текст для выключенного состояния.",
			control: "text"
		},
		labelPosition: {
			description: "Положение подписи относительно переключателя.",
			control: "inline-radio",
			options: ["before", "after"]
		},
		disabled: {
			description: "Блокирует взаимодействие.",
			control: "boolean"
		},
		size: {
			description: "Размер контрола и подписи.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		}
	}
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
	render: (args) => {
		const [value, setValue] = useState(args.value ?? false);
		return <Toggle {...args} value={value} onChange={setValue} />;
	},
	args: {
		label: "Режим синхронизации",
		description: "Мгновенное переключение состояния.",
		value: false,
		checkedText: "ВКЛ",
		uncheckedText: "ВЫКЛ",
		labelPosition: "before"
	}
};

export const LabelAfter: Story = {
	render: (args) => {
		const [value, setValue] = useState(args.value ?? true);
		return <Toggle {...args} value={value} onChange={setValue} />;
	},
	args: {
		label: "Уведомления",
		value: true,
		labelPosition: "after"
	}
};

export const Disabled: Story = {
	args: {
		label: "Недоступный переключатель",
		value: true,
		disabled: true
	}
};
